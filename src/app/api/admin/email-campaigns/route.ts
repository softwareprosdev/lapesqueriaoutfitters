import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const campaignSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  preheader: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['NEWSLETTER', 'PROMOTIONAL', 'ABANDONED_CART', 'WELCOME', 'REENGAGEMENT', 'ANNOUNCEMENT', 'CUSTOM']).default('NEWSLETTER'),
  targetAudience: z.string().optional(),
  segmentName: z.string().optional(),
  scheduledAt: z.string().optional(),
});

// GET - Fetch all email campaigns
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (status && status !== 'all') {
      where.status = status;
    }
    if (type && type !== 'all') {
      where.type = type;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [campaigns, total] = await Promise.all([
      prisma.emailCampaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: { recipients: true },
          },
        },
      }),
      prisma.emailCampaign.count({ where }),
    ]);

    // Get overall stats
    const stats = await prisma.emailCampaign.aggregate({
      _sum: {
        totalSent: true,
        totalOpened: true,
        totalClicked: true,
      },
      _count: true,
    });

    const sentCampaigns = await prisma.emailCampaign.count({
      where: { status: 'SENT' },
    });

    const scheduledCampaigns = await prisma.emailCampaign.count({
      where: { status: 'SCHEDULED' },
    });

    return NextResponse.json({
      campaigns,
      stats: {
        total: stats._count,
        sent: sentCampaigns,
        scheduled: scheduledCampaigns,
        totalEmailsSent: stats._sum.totalSent || 0,
        totalOpens: stats._sum.totalOpened || 0,
        totalClicks: stats._sum.totalClicked || 0,
        avgOpenRate: stats._sum.totalSent ? ((stats._sum.totalOpened || 0) / stats._sum.totalSent * 100) : 0,
        avgClickRate: stats._sum.totalOpened ? ((stats._sum.totalClicked || 0) / stats._sum.totalOpened * 100) : 0,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Fetch email campaigns error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email campaigns' },
      { status: 500 }
    );
  }
}

// POST - Create new email campaign
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = campaignSchema.parse(body);

    // Calculate recipient count based on audience
    let recipientCount = 0;
    let targetAudienceJson = '{}'; // Default to empty audience for broader targeting

    if (validated.segmentName === 'All Newsletter Subscribers') {
      targetAudienceJson = JSON.stringify({ subscribedToNewsletter: true });
      recipientCount = await prisma.newsletterSubscriber.count({
        where: { isActive: true },
      });
    } else if (validated.segmentName === 'Customers Who Have Ordered') {
      targetAudienceJson = JSON.stringify({ hasOrdered: true });
      // Fetch count for customers who have ordered
      recipientCount = await prisma.user.count({
        where: {
          role: 'CUSTOMER',
          orders: {
            some: {}
          }
        }
      });
    } else if (validated.segmentName === 'All Customers') {
      targetAudienceJson = JSON.stringify({}); // This should cover all users based on backend default logic
      recipientCount = await prisma.user.count({
        where: { role: 'CUSTOMER' }
      });
    } else {
      // Fallback to all newsletter subscribers if segment is unrecognized or default
      targetAudienceJson = JSON.stringify({ subscribedToNewsletter: true });
      recipientCount = await prisma.newsletterSubscriber.count({
        where: { isActive: true },
      });
    }

    const campaign = await prisma.emailCampaign.create({
      data: {
        name: validated.name,
        subject: validated.subject,
        preheader: validated.preheader,
        content: validated.content,
        type: validated.type,
        targetAudience: targetAudienceJson, // Use the dynamically generated JSON
        segmentName: validated.segmentName,
        recipientCount, // Use the calculated recipient count
        scheduledAt: validated.scheduledAt ? new Date(validated.scheduledAt) : null,
        status: validated.scheduledAt ? 'SCHEDULED' : 'DRAFT',
        createdById: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error('Create email campaign error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create email campaign' },
      { status: 500 }
    );
  }
}
