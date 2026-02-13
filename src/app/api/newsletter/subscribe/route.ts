import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import WelcomeEmail from '@/emails/WelcomeEmail';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { error: 'You are already subscribed!' },
          { status: 400 }
        );
      } else {
        // Reactivate subscription
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: {
            isActive: true,
            name: name || existing.name,
            unsubscribedAt: null,
          },
        });

        // Send welcome back email
        try {
          await sendEmail({
            to: email,
            subject: "🌊 Welcome Back to La Pesqueria's Studio!",
            react: WelcomeEmail({ customerName: name || existing.name || 'Ocean Lover' }),
          });
          console.log('Welcome back email sent successfully');
        } catch (emailError) {
          console.error('Failed to send welcome back email:', emailError);
        }

        return NextResponse.json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated.',
        });
      }
    }

    // Create new subscriber
    await prisma.newsletterSubscriber.create({
      data: {
        email,
        name: name || null,
      },
    });

    // Send welcome email
    try {
      await sendEmail({
        to: email,
        subject: "🌊 Welcome to La Pesqueria's Studio - Your Ocean Conservation Journey Begins!",
        react: WelcomeEmail({ customerName: name || 'Ocean Lover' }),
      });
      console.log('Welcome email sent successfully');
    } catch (emailError) {
      // Don't fail the subscription if email fails
      console.error('Failed to send welcome email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to our newsletter!',
    });
  } catch (error: unknown) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
