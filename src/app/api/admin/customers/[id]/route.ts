import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const customer = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            items: {
              include: {
                variant: {
                  include: {
                    product: true,
                  },
                },
              },
            },
            conservationDonation: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        rewards: {
          include: {
            achievements: {
              include: {
                achievement: true,
              },
            },
            pointTransactions: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 10,
            },
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Calculate metrics
    const totalSpent = customer.orders.reduce((sum, order) => sum + order.total, 0);
    const totalDonations = customer.orders.reduce(
      (sum, order) => sum + (order.conservationDonation?.amount || 0),
      0
    );

    return NextResponse.json({
      customer: {
        ...customer,
        metrics: {
          totalSpent,
          orderCount: customer.orders.length,
          avgOrderValue: customer.orders.length > 0 ? totalSpent / customer.orders.length : 0,
          totalDonations,
        },
      },
    });
  } catch (error) {
    console.error('Fetch customer error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}
