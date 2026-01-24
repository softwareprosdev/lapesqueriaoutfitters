import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const where = activeOnly ? { isActive: true } : {};

    const workflows = await prisma.reviewRequestWorkflow.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { logs: true },
        },
      },
    });

    return NextResponse.json({ workflows });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      triggerType,
      triggerDelayHours,
      subject,
      body: emailBody,
      templateConfig,
      incentiveType,
      incentiveValue,
      incentiveMinRating,
      channel,
      remindersEnabled,
      remindersCount,
      remindersIntervalDays,
      targetSegments,
      excludeSegments,
      minOrderValue,
    } = body;

    const workflow = await prisma.reviewRequestWorkflow.create({
      data: {
        name,
        triggerType: triggerType || 'order_delivered',
        triggerDelayHours: triggerDelayHours || 72,
        subject,
        body: emailBody,
        templateConfig: templateConfig || {},
        incentiveType,
        incentiveValue,
        incentiveMinRating,
        channel: channel || 'email',
        remindersEnabled: remindersEnabled ?? true,
        remindersCount: remindersCount || 2,
        remindersIntervalDays: remindersIntervalDays || 7,
        targetSegments: targetSegments || [],
        excludeSegments: excludeSegments || [],
        minOrderValue,
      },
    });

    return NextResponse.json({ workflow });
  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 });
  }
}
