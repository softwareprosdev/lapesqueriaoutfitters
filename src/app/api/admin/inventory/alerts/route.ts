import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const threshold = parseInt(searchParams.get('threshold') || '10');
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    const lowStockItems = await prisma.productVariant.findMany({
      where: {
        stock: {
          lte: threshold,
          gte: 0,
        },
      },
      take: limit,
      orderBy: {
        stock: 'asc',
      },
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
    });

    const items = lowStockItems.map((variant) => ({
      id: variant.id,
      name: variant.name,
      sku: variant.sku,
      stock: variant.stock,
      threshold,
      productName: variant.product.name,
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch low stock alerts' },
      { status: 500 }
    );
  }
}
