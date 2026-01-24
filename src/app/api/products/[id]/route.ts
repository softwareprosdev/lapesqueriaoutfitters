import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/products/[id]
 * Get public product details.
 * The path parameter is named 'id' to match the folder structure `api/products/[id]`,
 * but we support looking up by either Slug or ID to be flexible.
 * The Checkout "Quick Add" feature specifically passes a slug here.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try to find by Slug first (primary use case for "Quick Add"), then by ID
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: id },
          { id: id }
        ]
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
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Fetch product detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product details', success: false },
      { status: 500 }
    );
  }
}
