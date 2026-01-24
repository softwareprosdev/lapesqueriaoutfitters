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
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    const orders = await prisma.order.findMany({
      where,
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
    });

    // Calculate financial metrics
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalSubtotal = orders.reduce((sum, o) => sum + o.subtotal, 0);
    const totalShipping = orders.reduce((sum, o) => sum + o.shipping, 0);
    const totalTax = orders.reduce((sum, o) => sum + o.tax, 0);
    const totalDonations = orders.reduce(
      (sum, o) => sum + (o.conservationDonation?.amount || 0),
      0
    );

    // Product performance
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.variant.product.id;
        if (!productSales[productId]) {
          productSales[productId] = {
            name: item.variant.product.name,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return NextResponse.json({
      summary: {
        totalOrders: orders.length,
        totalRevenue,
        totalSubtotal,
        totalShipping,
        totalTax,
        totalDonations,
        netRevenue: totalRevenue - totalDonations,
      },
      topProducts,
      dateRange: {
        from: dateFrom,
        to: dateTo,
      },
    });
  } catch (error) {
    console.error('Fetch financial report error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial report' },
      { status: 500 }
    );
  }
}
