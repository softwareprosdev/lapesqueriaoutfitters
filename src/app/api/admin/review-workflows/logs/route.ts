import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET logs for a workflow or all logs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = {};
    if (workflowId) where.workflowId = workflowId;
    if (status) where.status = status;

    const logs = await prisma.reviewRequestLog.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        workflow: {
          select: { name: true },
        },
      },
    });

    // Calculate stats
    const stats = await prisma.reviewRequestLog.groupBy({
      by: ['status'],
      _count: true,
    });

    return NextResponse.json({ logs, stats });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
