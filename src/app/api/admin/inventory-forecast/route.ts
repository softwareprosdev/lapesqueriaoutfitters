import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch inventory forecasts and alerts
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'overview'; // overview, alerts, forecasts
    const period = searchParams.get('period') || '30';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (view === 'overview') {
      // Get inventory overview stats
      const [
        totalProducts,
        lowStockCount,
        outOfStockCount,
        recentSales,
        topSelling,
        slowMoving,
      ] = await Promise.all([
        // Total product variants
        prisma.productVariant.count(),

        // Low stock (below 10)
        prisma.productVariant.count({
          where: { stock: { gt: 0, lte: 10 } },
        }),

        // Out of stock
        prisma.productVariant.count({
          where: { stock: 0 },
        }),

        // Recent sales velocity
        prisma.orderItem.groupBy({
          by: ['variantId'],
          where: {
            order: {
              createdAt: { gte: new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000) },
              status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
            },
          },
          _sum: { quantity: true },
        }),

        // Top selling products
        prisma.orderItem.groupBy({
          by: ['variantId'],
          where: {
            order: {
              createdAt: { gte: new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000) },
              status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
            },
          },
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 10,
        }),

        // Slow moving (no sales in period)
        prisma.productVariant.findMany({
          where: {
            stock: { gt: 0 },
            orderItems: {
              none: {
                order: {
                  createdAt: { gte: new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000) },
                },
              },
            },
          },
          include: {
            product: { select: { name: true, slug: true } },
          },
          take: 10,
        }),
      ]);

      // Get details for top selling
      const topSellingDetails = await Promise.all(
        topSelling.map(async (item) => {
          const variant = await prisma.productVariant.findUnique({
            where: { id: item.variantId },
            include: {
              product: { select: { name: true, slug: true } },
            },
          });
          return {
            ...item,
            variant,
            daysOfStock: variant ? Math.floor(variant.stock / ((item._sum.quantity || 0) / parseInt(period))) : null,
          };
        })
      );

      // Calculate total sales velocity
      const totalSales = recentSales.reduce((sum, item) => sum + (item._sum.quantity || 0), 0);
      const avgDailySales = totalSales / parseInt(period);

      // Get unread alerts count
      const unreadAlerts = await prisma.inventoryAlert.count({
        where: { isRead: false },
      });

      return NextResponse.json({
        overview: {
          totalProducts,
          lowStockCount,
          outOfStockCount,
          healthyStock: totalProducts - lowStockCount - outOfStockCount,
          avgDailySales,
          totalSalesPeriod: totalSales,
          unreadAlerts,
        },
        topSelling: topSellingDetails,
        slowMoving,
        period: parseInt(period),
      });
    }

    if (view === 'alerts') {
      const where: Record<string, unknown> = {};
      const alertType = searchParams.get('alertType');
      const severity = searchParams.get('severity');
      const isRead = searchParams.get('isRead');

      if (alertType) where.alertType = alertType;
      if (severity) where.severity = severity;
      if (isRead !== null && isRead !== undefined) where.isRead = isRead === 'true';

      const [alerts, total] = await Promise.all([
        prisma.inventoryAlert.findMany({
          where,
          include: {
            variant: {
              include: {
                product: { select: { name: true, slug: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.inventoryAlert.count({ where }),
      ]);

      // Get alert counts by type
      const alertCounts = await prisma.inventoryAlert.groupBy({
        by: ['alertType'],
        where: { isRead: false },
        _count: true,
      });

      return NextResponse.json({
        alerts,
        stats: {
          byType: alertCounts.reduce((acc, item) => {
            acc[item.alertType] = item._count;
            return acc;
          }, {} as Record<string, number>),
        },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    if (view === 'forecasts') {
      // Get products with forecast data
      const variants = await prisma.productVariant.findMany({
        include: {
          product: { select: { name: true, slug: true } },
          orderItems: {
            where: {
              order: {
                createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
                status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
              },
            },
            select: {
              quantity: true,
              order: { select: { createdAt: true } },
            },
          },
        },
        orderBy: { stock: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      const total = await prisma.productVariant.count();

      // Calculate forecasts for each variant
      const forecasts = variants.map((variant) => {
        const salesLast90Days = variant.orderItems.reduce((sum, item) => sum + item.quantity, 0);
        const dailyAverage = salesLast90Days / 90;
        const weeklyAverage = dailyAverage * 7;
        const monthlyAverage = dailyAverage * 30;

        // Days until out of stock
        const daysUntilOut = dailyAverage > 0 ? Math.floor(variant.stock / dailyAverage) : null;

        // Recommended reorder (2 weeks of stock as safety)
        const recommendedReorder = Math.max(0, Math.ceil(monthlyAverage * 1.5 - variant.stock));

        // Reorder point (when to reorder - 2 weeks worth)
        const reorderPoint = Math.ceil(weeklyAverage * 2);

        return {
          id: variant.id,
          sku: variant.sku,
          name: variant.name,
          productName: variant.product.name,
          slug: variant.product.slug,
          currentStock: variant.stock,
          salesLast90Days,
          dailyAverage: Math.round(dailyAverage * 10) / 10,
          weeklyAverage: Math.round(weeklyAverage * 10) / 10,
          monthlyAverage: Math.round(monthlyAverage * 10) / 10,
          daysUntilOut,
          recommendedReorder,
          reorderPoint,
          stockStatus: variant.stock === 0
            ? 'out_of_stock'
            : variant.stock <= reorderPoint
              ? 'low_stock'
              : 'healthy',
        };
      });

      return NextResponse.json({
        forecasts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    return NextResponse.json({ error: 'Invalid view parameter' }, { status: 400 });
  } catch (error) {
    console.error('Fetch inventory forecast error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory forecast' },
      { status: 500 }
    );
  }
}

// POST - Generate forecasts or mark alerts as read
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, alertIds, variantId } = body;

    if (action === 'mark_read') {
      await prisma.inventoryAlert.updateMany({
        where: { id: { in: alertIds } },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'mark_all_read') {
      await prisma.inventoryAlert.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'generate_alerts') {
      // Generate alerts for low/out of stock items
      const variants = await prisma.productVariant.findMany({
        where: variantId ? { id: variantId } : {},
        include: {
          product: { select: { name: true } },
        },
      });

      let alertsCreated = 0;

      for (const variant of variants) {
        if (variant.stock === 0) {
          // Out of stock alert
          const existing = await prisma.inventoryAlert.findFirst({
            where: {
              variantId: variant.id,
              alertType: 'out_of_stock',
              resolvedAt: null,
            },
          });

          if (!existing) {
            await prisma.inventoryAlert.create({
              data: {
                variantId: variant.id,
                alertType: 'out_of_stock',
                severity: 'critical',
                message: `${variant.product.name} - ${variant.name} is out of stock`,
                currentStock: 0,
              },
            });
            alertsCreated++;
          }
        } else if (variant.stock <= 5) {
          // Critical low stock
          const existing = await prisma.inventoryAlert.findFirst({
            where: {
              variantId: variant.id,
              alertType: 'low_stock',
              resolvedAt: null,
            },
          });

          if (!existing) {
            await prisma.inventoryAlert.create({
              data: {
                variantId: variant.id,
                alertType: 'low_stock',
                severity: 'high',
                message: `${variant.product.name} - ${variant.name} has only ${variant.stock} units left`,
                currentStock: variant.stock,
                threshold: 5,
              },
            });
            alertsCreated++;
          }
        } else if (variant.stock <= 10) {
          // Low stock warning
          const existing = await prisma.inventoryAlert.findFirst({
            where: {
              variantId: variant.id,
              alertType: 'low_stock',
              resolvedAt: null,
            },
          });

          if (!existing) {
            await prisma.inventoryAlert.create({
              data: {
                variantId: variant.id,
                alertType: 'low_stock',
                severity: 'medium',
                message: `${variant.product.name} - ${variant.name} is running low (${variant.stock} units)`,
                currentStock: variant.stock,
                threshold: 10,
              },
            });
            alertsCreated++;
          }
        }
      }

      return NextResponse.json({ success: true, alertsCreated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Inventory forecast action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
