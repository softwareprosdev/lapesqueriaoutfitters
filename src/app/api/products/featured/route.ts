import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/products/featured?limit=4
 * Get featured products for client-side components
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');

    // Get featured products
    const featured = await prisma.product.findMany({
      where: {
        featured: true,
      },
      include: {
        category: true,
        variants: {
          include: {
            images: {
              orderBy: { position: 'asc' },
            },
          },
        },
        images: {
          orderBy: { position: 'asc' },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit + 4, // Get extra in case some are filtered out
    });

    // If not enough featured, get latest products
    let products = featured;
    if (featured.length < limit) {
      const latest = await prisma.product.findMany({
        where: {
          featured: false,
        },
        include: {
          category: true,
          variants: {
            include: {
              images: {
                orderBy: { position: 'asc' },
              },
            },
          },
          images: {
            orderBy: { position: 'asc' },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit - featured.length,
      });
      products = [...featured, ...latest];
    }

    // Transform to display format
    const transformed = products.slice(0, limit).map((product) => {
      const firstVariant = product.variants[0];
      const displayPrice = firstVariant?.price || product.basePrice;
      const displayStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
      
      // Collect images from product and variants
      const images: string[] = [];
      product.images.forEach(img => images.push(img.url));
      product.variants.forEach(v => {
        v.images.forEach(img => {
          if (img.url && !images.includes(img.url)) {
            images.push(img.url);
          }
        });
      });

      return {
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          basePrice: product.basePrice,
          featured: product.featured,
        },
        displayPrice,
        displayStock,
        displayImages: images,
      };
    });

    return NextResponse.json({
      success: true,
      products: transformed,
      count: transformed.length,
    });
  } catch (error) {
    console.error('Featured products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured products', success: false },
      { status: 500 }
    );
  }
}
