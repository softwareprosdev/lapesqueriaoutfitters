import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/email';
import WelcomeEmail from '@/emails/WelcomeEmail';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with rewards account
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'CUSTOMER',
        rewards: {
          create: {
            points: 100, // Signup bonus!
            pointTransactions: {
              create: {
                points: 100,
                type: 'SIGNUP',
                description: 'Welcome bonus for creating your account! 🎉',
              },
            },
          },
        },
      },
      include: {
        rewards: true,
      },
    });

    // Send welcome email (don't block registration if email fails)
    try {
      await sendEmail({
        to: user.email,
        subject: "Welcome to La Pesqueria's Studio! 🌊",
        react: WelcomeEmail({
          customerName: user.name || 'Ocean Lover',
        }),
      });
      console.log('Welcome email sent successfully');
    } catch (emailError: unknown) {
      console.error('Failed to send welcome email:', emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully! You earned 100 welcome points!',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create account' },
      { status: 500 }
    );
  }
}
