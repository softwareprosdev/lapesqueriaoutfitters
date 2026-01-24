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
    const filter = searchParams.get('filter') || 'all';
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';
    const sortBy = searchParams.get('sortBy') || 'stock';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Build where clause
    const where: Record<string, unknown> = {};

    if (filter === 'low_stock') {
      where.stock = { lte: 10, gt: 0 };
    } else if (filter === 'out_of_stock') {
      where.stock = 0;
    }

    // Add search filter
    if (search) {
      where.OR = [
        { product: { name: { contains: search, mode: 'insensitive' } } },
        { sku: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Add category filter
    if (category !== 'all') {
      where.product = {
        ...(where.product as Record<string, unknown>),
        category: { name: category }
      };
    }

    // Get variants with enhanced data
    const variants = await prisma.productVariant.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: {
              select: { name: true }
            },
            images: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    // Get recent transactions
    const recentTransactions = await prisma.inventoryTransaction.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        variant: {
          include: {
            product: { select: { name: true } },
          },
        },
        user: { select: { name: true, email: true } },
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
      _sum: { stock: true },
    });

    // Stock value calculation
    const allVariants = await prisma.productVariant.findMany({
      select: { price: true, stock: true },
    });
    const stockValue = allVariants.reduce(
      (sum, v) => sum + v.price * v.stock,
      0
    );

    // Category breakdown
    const categoryBreakdown = await prisma.productVariant.groupBy({
      by: ['productId'],
      where: {
        product: {
          categoryId: { not: null }
        }
      },
      _count: { id: true },
      _sum: { stock: true },
    });

    // Get category names and calculate values
    const categoryDetails = await Promise.all(
      categoryBreakdown.map(async (group) => {
        const product = await prisma.product.findUnique({
          where: { id: group.productId },
          select: {
            category: { select: { name: true } },
            variants: { select: { price: true, stock: true } }
          }
        });

        if (!product?.category) return null;

        const categoryValue = product.variants.reduce(
          (sum, v) => sum + v.price * v.stock,
          0
        );

        return {
          category: product.category.name,
          count: group._count.id,
          value: categoryValue
        };
      })
    );

    const validCategories = categoryDetails.filter(Boolean);
    const categoryBreakdownSummary = validCategories.reduce((acc, cat) => {
      const existing = acc.find(c => c.category === cat!.category);
      if (existing) {
        existing.count += cat!.count;
        existing.value += cat!.value;
      } else {
        acc.push(cat!);
      }
      return acc;
    }, [] as Array<{ category: string; count: number; value: number }>);

    // Size breakdown (for t-shirts and similar)
    const sizeBreakdown = await prisma.productVariant.groupBy({
      by: ['size'],
      where: { size: { not: null } },
      _count: { id: true },
      _sum: { stock: true },
    });

    const sizeBreakdownSummary = await Promise.all(
      sizeBreakdown.map(async (group) => {
        const variants = await prisma.productVariant.findMany({
          where: { size: group.size },
          select: { price: true, stock: true }
        });

        const value = variants.reduce(
          (sum, v) => sum + v.price * v.stock,
          0
        );

        return {
          size: group.size!,
          count: group._sum.stock || 0,
          value
        };
      })
    );

    // T-shirt specific inventory
    const tshirtProducts = await prisma.product.findMany({
      where: {
        name: { contains: 't-shirt', mode: 'insensitive' }
      },
      include: {
        variants: {
          select: {
            size: true,
            color: true,
            stock: true,
            price: true
          }
        }
      }
    });

    const tshirtInventory = tshirtProducts.map(product => ({
      productName: product.name,
      variants: product.variants.filter(v => v.size && v.color),
      totalStock: product.variants.reduce((sum, v) => sum + v.stock, 0),
      totalValue: product.variants.reduce((sum, v) => sum + v.price * v.stock, 0)
    }));

    return NextResponse.json({
      variants,
      recentTransactions,
      summary: {
        totalVariants,
        lowStockCount,
        outOfStockCount,
        totalStock: totalStock._sum.stock || 0,
        stockValue,
        categoryBreakdown: categoryBreakdownSummary,
        sizeBreakdown: sizeBreakdownSummary,
      },
      tshirtInventory,
    });
  } catch (error) {
    console.error('Enhanced inventory fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enhanced inventory data' },
      { status: 500 }
    );
  }
}