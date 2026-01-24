import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const template = searchParams.get('template');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (template) {
      where.template = template;
    }

    const logs = await prisma.emailLog.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    const summary = {
      total: await prisma.emailLog.count(),
      sent: await prisma.emailLog.count({ where: { status: 'sent' } }),
      failed: await prisma.emailLog.count({ where: { status: 'failed' } }),
      pending: await prisma.emailLog.count({ where: { status: 'pending' } }),
    };

    return NextResponse.json({ logs, summary });
  } catch (error) {
    console.error('Fetch email logs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email logs' },
      { status: 500 }
    );
  }
}
