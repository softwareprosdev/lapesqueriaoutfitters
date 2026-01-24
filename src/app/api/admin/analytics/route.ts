import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch comprehensive analytics data
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

        // Get various analytics in parallel
        const [
          // Revenue metrics
          revenueData,
          previousPeriodRevenue,
          // Order metrics
          orderStats,
          // Customer metrics
          customerStats,
          newCustomers,
          // Product metrics
          topProducts,
          lowStockProducts,
          // Conservation metrics
          conservationStats,
          // Daily revenue for chart
          rawDailyRevenue,
          // Order status distribution
          orderStatusDistribution,
          // Traffic/conversion data from analytics events
          conversionData,
        ] = await Promise.all([
          // Current period revenue
          prisma.order.aggregate({
            where: {
              createdAt: { gte: startDate },
              status: { in: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
            },
            _sum: { total: true },
            _count: true,
            _avg: { total: true },
          }),
          // Previous period revenue for comparison
          prisma.order.aggregate({
            where: {
              createdAt: {
                gte: new Date(startDate.getTime() - parseInt(period) * 24 * 60 * 60 * 1000),
                lt: startDate,
              },
              status: { in: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
            },
            _sum: { total: true },
            _count: true,
          }),
          // Order statistics (Filtered by period)
          prisma.order.groupBy({
            by: ['status'],
            where: { createdAt: { gte: startDate } },
            _count: true,
          }),
          // Customer statistics
          prisma.user.aggregate({
            where: { role: 'CUSTOMER' },
            _count: true,
          }),
          // New customers in period
          prisma.user.count({
            where: {
              role: 'CUSTOMER',
              createdAt: { gte: startDate },
            },
          }),
          // Top selling products
          prisma.orderItem.groupBy({
            by: ['variantId'],
            where: {
              order: {
                createdAt: { gte: startDate },
                status: { in: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
              },
            },
            _sum: { quantity: true, price: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 10,
          }),
          // Low stock products
          prisma.productVariant.findMany({
            where: { stock: { lte: 10 } },
            include: {
              product: { select: { name: true, slug: true } },
            },
            orderBy: { stock: 'asc' },
            take: 10,
          }),
          // Conservation donations
          prisma.conservationDonation.aggregate({
            where: {
              createdAt: { gte: startDate },
              status: 'DONATED',
            },
            _sum: { amount: true },
            _count: true,
          }),
          // Daily revenue for chart
          prisma.$queryRaw<Array<{ date: Date; revenue: number | null; orders: bigint }>>`
            SELECT
              DATE("createdAt") as date,
              SUM(total) as revenue,
              COUNT(*) as orders
            FROM orders
            WHERE "createdAt" >= ${startDate}
              AND status IN ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED')
            GROUP BY DATE("createdAt")
            ORDER BY date ASC
          `,
          // Order status distribution (All Time - Real Time Snapshot)
          prisma.order.groupBy({
            by: ['status'],
            _count: true,
          }),
          // Conversion data from analytics
          prisma.productAnalytics.aggregate({
            _avg: {
              viewToCartRate: true,
              cartToPurchaseRate: true,
            },
          }),
        ]);
    
        // Format daily revenue
        const dailyRevenue = rawDailyRevenue.map((item) => ({
          date: new Date(item.date).toISOString(),
          revenue: Number(item.revenue || 0),
          orders: Number(item.orders || 0),
        }));
    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
          include: {
            product: {
              select: { name: true, slug: true },
            },
          },
        });
        return {
          ...item,
          productName: variant?.product.name || 'Unknown',
          variantName: variant?.name || '',
          slug: variant?.product.slug || '',
        };
      })
    );

    // Calculate growth percentages
    const currentRevenue = revenueData._sum.total || 0;
    const prevRevenue = previousPeriodRevenue._sum.total || 0;
    const revenueGrowth = prevRevenue > 0
      ? ((currentRevenue - prevRevenue) / prevRevenue) * 100
      : 0;

    const currentOrders = revenueData._count || 0;
    const prevOrders = previousPeriodRevenue._count || 0;
    const orderGrowth = prevOrders > 0
      ? ((currentOrders - prevOrders) / prevOrders) * 100
      : 0;

    return NextResponse.json({
      overview: {
        revenue: currentRevenue,
        revenueGrowth,
        orders: currentOrders,
        orderGrowth,
        averageOrderValue: revenueData._avg.total || 0,
        totalCustomers: customerStats._count,
        newCustomers,
        conversionRate: (conversionData._avg.viewToCartRate || 0) * 100,
        cartToPurchaseRate: (conversionData._avg.cartToPurchaseRate || 0) * 100,
      },
      conservation: {
        totalDonated: conservationStats._sum.amount || 0,
        donationCount: conservationStats._count,
      },
      ordersByStatus: orderStats.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      statusDistribution: orderStatusDistribution,
      topProducts: topProductsWithDetails,
      lowStockProducts,
      dailyRevenue,
      period: parseInt(period),
    });
  } catch (error) {
    console.error('Fetch analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
