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
    const filter = searchParams.get('filter') || 'all'; // all, low_stock, out_of_stock

    // Get all variants with product info
    const where: Record<string, unknown> = {};

    if (filter === 'low_stock') {
      where.stock = { lte: 10, gt: 0 };
    } else if (filter === 'out_of_stock') {
      where.stock = 0;
    }

    const variants = await prisma.productVariant.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
          },
        },
      },
      orderBy: {
        stock: 'asc',
      },
    });

    // Get inventory transactions for recent activity
    const recentTransactions = await prisma.inventoryTransaction.findMany({
      take: 20,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        variant: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Calculate summary stats
    const totalVariants = await prisma.productVariant.count();
    const lowStockCount = await prisma.productVariant.count({
      where: { stock: { lte: 10, gt: 0 } },
    });
    const outOfStockCount = await prisma.productVariant.count({
      where: { stock: 0 },
    });

    const totalStock = await prisma.productVariant.aggregate({
      _sum: {
        stock: true,
      },
    });

    // Get stock value (price * stock)
    const allVariants = await prisma.productVariant.findMany({
      select: {
        price: true,
        stock: true,
      },
    });

    const stockValue = allVariants.reduce(
      (sum, v) => sum + v.price * v.stock,
      0
    );

    return NextResponse.json({
      variants,
      recentTransactions,
      summary: {
        totalVariants,
        lowStockCount,
        outOfStockCount,
        totalStock: totalStock._sum.stock || 0,
        stockValue,
      },
    });
  } catch (error) {
    console.error('Inventory fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory data' },
      { status: 500 }
    );
  }
}
