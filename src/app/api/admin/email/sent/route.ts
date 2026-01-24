import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [emails, total] = await Promise.all([
      prisma.emailLog.findMany({
        where: {
          status: 'sent',
          archived: false,
        },
        orderBy: {
          sentAt: 'desc',
        },
        take: limit,
        skip,
      }),
      prisma.emailLog.count({
        where: {
          status: 'sent',
          archived: false,
        },
      }),
    ]);

    return NextResponse.json({
      emails,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Fetch sent emails error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
