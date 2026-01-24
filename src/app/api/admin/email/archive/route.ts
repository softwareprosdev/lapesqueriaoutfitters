import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emailId, archived } = await request.json();

    if (!emailId || typeof archived !== 'boolean') {
      return NextResponse.json(
        { error: 'emailId and archived flag are required' },
        { status: 400 }
      );
    }

    const email = await prisma.emailLog.update({
      where: { id: emailId },
      data: { archived },
    });

    return NextResponse.json({
      success: true,
      message: archived ? 'Email archived successfully' : 'Email unarchived successfully',
      email,
    });
  } catch (error) {
    console.error('Archive email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
