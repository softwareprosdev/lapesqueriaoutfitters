import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  preheader: z.string().optional(),
  content: z.string().optional(),
  type: z.enum(['NEWSLETTER', 'PROMOTIONAL', 'ABANDONED_CART', 'WELCOME', 'REENGAGEMENT', 'ANNOUNCEMENT', 'CUSTOM']).optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'PAUSED', 'CANCELLED']).optional(),
  targetAudience: z.string().optional(),
  segmentName: z.string().optional(),
  scheduledAt: z.string().nullable().optional(),
});

// GET - Fetch single campaign with details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const campaign = await prisma.emailCampaign.findUnique({
      where: { id },
      include: {
        recipients: {
          take: 100,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { recipients: true },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Calculate detailed stats
    const recipientStats = await prisma.campaignRecipient.groupBy({
      by: ['campaignId'],
      where: { campaignId: id },
      _count: {
        _all: true,
        sentAt: true,
        deliveredAt: true,
        openedAt: true,
        clickedAt: true,
        bouncedAt: true,
        unsubscribedAt: true,
      },
    });

    const stats = recipientStats[0] || {
      _count: {
        _all: 0,
        sentAt: 0,
        deliveredAt: 0,
        openedAt: 0,
        clickedAt: 0,
        bouncedAt: 0,
        unsubscribedAt: 0,
      },
    };

    return NextResponse.json({
      campaign,
      detailedStats: {
        totalRecipients: stats._count._all,
        sent: stats._count.sentAt,
        delivered: stats._count.deliveredAt,
        opened: stats._count.openedAt,
        clicked: stats._count.clickedAt,
        bounced: stats._count.bouncedAt,
        unsubscribed: stats._count.unsubscribedAt,
        openRate: stats._count.sentAt ? (stats._count.openedAt / stats._count.sentAt * 100) : 0,
        clickRate: stats._count.openedAt ? (stats._count.clickedAt / stats._count.openedAt * 100) : 0,
        bounceRate: stats._count.sentAt ? (stats._count.bouncedAt / stats._count.sentAt * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Fetch campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}

// PATCH - Update campaign
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateSchema.parse(body);

    // Check campaign exists
    const existing = await prisma.emailCampaign.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Cannot edit sent campaigns
    if (existing.status === 'SENT' && validated.status !== 'SENT') {
      return NextResponse.json(
        { error: 'Cannot modify a sent campaign' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.subject !== undefined) updateData.subject = validated.subject;
    if (validated.preheader !== undefined) updateData.preheader = validated.preheader;
    if (validated.content !== undefined) updateData.content = validated.content;
    if (validated.type !== undefined) updateData.type = validated.type;
    if (validated.status !== undefined) updateData.status = validated.status;
    if (validated.targetAudience !== undefined) updateData.targetAudience = validated.targetAudience;
    if (validated.segmentName !== undefined) updateData.segmentName = validated.segmentName;
    if (validated.scheduledAt !== undefined) {
      updateData.scheduledAt = validated.scheduledAt ? new Date(validated.scheduledAt) : null;
    }

    const campaign = await prisma.emailCampaign.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error('Update campaign error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

// DELETE - Delete campaign
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.emailCampaign.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Delete campaign and all related recipients (cascade)
    await prisma.emailCampaign.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  } catch (error) {
    console.error('Delete campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
