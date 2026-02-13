import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = process.env.CLOVER_ACCESS_TOKEN;
    const merchantId = process.env.CLOVER_MERCHANT_ID;

    if (!accessToken || !merchantId) {
      return NextResponse.json({
        configured: false,
      });
    }

    return NextResponse.json({
      configured: true,
      merchantId: '***' + merchantId.slice(-4),
    });
  } catch (error) {
    console.error('Clover config check error:', error);
    return NextResponse.json(
      { error: 'Failed to check Clover configuration' },
      { status: 500 }
    );
  }
}
