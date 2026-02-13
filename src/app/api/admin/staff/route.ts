import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import StaffInviteEmail from '@/emails/StaffInviteEmail';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'STAFF']),
});

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'STAFF']),
});

// GET - Fetch all staff members and pending invites
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [staff, invites, activityLogs] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: { in: ['ADMIN', 'STAFF'] },
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          image: true,
          _count: {
            select: {
              orderNotes: true,
              activityLogs: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.staffInvite.findMany({
        where: {
          acceptedAt: null,
          expiresAt: { gt: new Date() },
        },
        include: {
          inviter: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.activityLog.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const stats = {
      totalStaff: staff.length,
      admins: staff.filter(s => s.role === 'ADMIN').length,
      staffMembers: staff.filter(s => s.role === 'STAFF').length,
      pendingInvites: invites.length,
    };

    return NextResponse.json({
      staff,
      invites,
      activityLogs,
      stats,
    });
  } catch (error) {
    console.error('Fetch staff error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

// POST - Create staff invite or direct user creation
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Check if it's a direct user creation or invite
    if (body.password) {
      // Direct user creation
      const validated = createUserSchema.parse(body);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: validated.email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'A user with this email already exists' },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validated.password, 12);

      const user = await prisma.user.create({
        data: {
          email: validated.email,
          name: validated.name,
          password: hashedPassword,
          role: validated.role,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'create',
          resource: 'staff',
          resourceId: user.id,
          details: { email: user.email, role: user.role },
        },
      });

      return NextResponse.json({ user }, { status: 201 });
    } else {
      // Create invite
      const validated = inviteSchema.parse(body);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: validated.email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'A user with this email already exists' },
          { status: 400 }
        );
      }

      // Check for existing pending invite
      const existingInvite = await prisma.staffInvite.findFirst({
        where: {
          email: validated.email,
          acceptedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      if (existingInvite) {
        return NextResponse.json(
          { error: 'An invite for this email is already pending' },
          { status: 400 }
        );
      }

      const invite = await prisma.staffInvite.create({
        data: {
          email: validated.email,
          role: validated.role,
          invitedBy: session.user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
        include: {
          inviter: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      // Send invite email
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://lapesqueriaoutfitters.com';
        await sendEmail({
          to: validated.email,
          subject: `You're invited to join La Pesqueria Outfitters`,
          react: StaffInviteEmail({
            inviterName: session.user.name || invite.inviter?.name || 'Admin',
            role: validated.role,
            inviteUrl: `${baseUrl}/admin/accept-invite?token=${invite.id}`,
            expiresAt: invite.expiresAt.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
          }),
        });
      } catch (emailError) {
        console.error('Failed to send staff invite email:', emailError);
      }

      return NextResponse.json({ invite }, { status: 201 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Create staff error:', error);
    return NextResponse.json(
      { error: 'Failed to create staff member' },
      { status: 500 }
    );
  }
}
