import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import CampaignEmail from '@/emails/CampaignEmail';

// POST - Send campaign
export async function POST(
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
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    if (campaign.status === 'SENT') {
      return NextResponse.json(
        { error: 'Campaign has already been sent' },
        { status: 400 }
      );
    }

    if (campaign.status === 'SENDING') {
      return NextResponse.json(
        { error: 'Campaign is currently being sent' },
        { status: 400 }
      );
    }

    // Update status to sending
    await prisma.emailCampaign.update({
      where: { id },
      data: {
        status: 'SENDING',
        sentAt: new Date(),
      },
    });

    // Get recipients based on audience
    let recipients: Array<{ email: string; name: string | null; userId: string | null }> = [];

    if (campaign.targetAudience) {
      const audience = JSON.parse(campaign.targetAudience);

      if (audience.subscribedToNewsletter) {
        const subscribers = await prisma.newsletterSubscriber.findMany({
          where: { isActive: true },
          select: { email: true },
        });
        recipients = subscribers.map(s => ({ email: s.email, name: null, userId: null }));
      } else {
        const userWhere: Record<string, unknown> = { role: 'CUSTOMER' };
        if (audience.hasOrdered) {
          userWhere.orders = { some: {} };
        }
        const users = await prisma.user.findMany({
          where: userWhere,
          select: { id: true, email: true, name: true },
        });
        recipients = users.map(u => ({ email: u.email, name: u.name, userId: u.id }));
      }
    } else {
      // Default: newsletter subscribers
      const subscribers = await prisma.newsletterSubscriber.findMany({
        where: { isActive: true },
        select: { email: true },
      });
      recipients = subscribers.map(s => ({ email: s.email, name: null, userId: null }));
    }

    // Create recipient records
    if (recipients.length > 0) {
      await prisma.campaignRecipient.createMany({
        data: recipients.map(r => ({
          campaignId: id,
          email: r.email,
          name: r.name,
          userId: r.userId,
        })),
        skipDuplicates: true,
      });
    }

    // Send emails to each recipient via Resend
    let sentCount = 0;
    for (const recipient of recipients) {
      try {
        // Create email log record
        const emailLog = await prisma.emailLog.create({
          data: {
            to: recipient.email,
            subject: campaign.subject,
            template: 'ADMIN_CUSTOM',
            status: 'pending',
            variables: {
              campaignId: id,
              campaignName: campaign.name,
              content: campaign.content,
              preheader: campaign.preheader,
            },
          },
        });

        // Actually send the email via Resend
        await sendEmail({
          to: recipient.email,
          subject: campaign.subject,
          react: CampaignEmail({
            content: campaign.content || '',
            preheader: campaign.preheader || undefined,
            recipientName: recipient.name || undefined,
          }),
        });

        // Update email log to sent
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: { status: 'sent', sentAt: new Date() },
        });

        // Update recipient as sent
        await prisma.campaignRecipient.updateMany({
          where: {
            campaignId: id,
            email: recipient.email,
          },
          data: {
            sentAt: new Date(),
          },
        });

        sentCount++;
      } catch (error) {
        console.error(`Failed to send email to recipient:`, error);
        // Update recipient with error
        await prisma.campaignRecipient.updateMany({
          where: {
            campaignId: id,
            email: recipient.email,
          },
          data: {
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }

    // Update campaign as sent
    await prisma.emailCampaign.update({
      where: { id },
      data: {
        status: 'SENT',
        completedAt: new Date(),
        totalSent: sentCount,
        recipientCount: recipients.length,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Campaign sent to ${sentCount} recipients`,
      stats: {
        total: recipients.length,
        sent: sentCount,
        failed: recipients.length - sentCount,
      },
    });
  } catch (error) {
    console.error('Send campaign error:', error);

    // Reset campaign status on error
    const { id } = await params;
    await prisma.emailCampaign.update({
      where: { id },
      data: { status: 'DRAFT' },
    }).catch(() => {}); // Ignore if this fails

    return NextResponse.json(
      { error: 'Failed to send campaign' },
      { status: 500 }
    );
  }
}
