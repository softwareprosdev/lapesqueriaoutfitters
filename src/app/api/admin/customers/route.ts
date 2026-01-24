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
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {
      role: 'CUSTOMER',
    };

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const customers = await prisma.user.findMany({
      where,
      include: {
        orders: {
          select: {
            id: true,
            total: true,
            createdAt: true,
            status: true,
          },
        },
        rewards: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate customer metrics
    const customersWithMetrics = customers.map((customer) => {
      const totalSpent = customer.orders.reduce((sum, order) => sum + order.total, 0);
      const orderCount = customer.orders.length;
      const avgOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;
      const lastOrderDate = customer.orders.length > 0
        ? customer.orders[0].createdAt
        : null;

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        createdAt: customer.createdAt,
        totalSpent,
        orderCount,
        avgOrderValue,
        lastOrderDate,
        rewardPoints: customer.rewards?.points || 0,
        tier: customer.rewards?.currentTier || 'Bronze',
      };
    });

    return NextResponse.json({ customers: customersWithMetrics });
  } catch (error) {
    console.error('Fetch customers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
