 import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Diagnostic endpoint to check database orders directly
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get raw order count from database
    const orderCount = await prisma.order.count();
    
    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        customerEmail: true,
        total: true,
        status: true,
        createdAt: true,
      },
    });

    // Check for any webhook-related issues
    const webhookCheck = {
      cloverWebhookSecretConfigured: !!process.env.CLOVER_WEBHOOK_SECRET,
      databaseConnected: true,
    };

    return NextResponse.json({
      success: true,
      orderCount,
      recentOrders,
      webhookCheck,
      message: orderCount === 0 
        ? 'No orders found in database. Orders may not be getting created by the Clover webhook.'
        : `Found ${orderCount} orders in database.`,
    });
  } catch (error) {
    console.error('Diagnostic error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      databaseConnected: false,
    }, { status: 500 });
  }
}
