import { NextRequest, NextResponse } from 'next/server';
import { getSimilarProducts } from '@/lib/ai/recommendation-engine';

/**
 * GET /api/recommendations/similar?productId=xxx&limit=6
 * Get similar/related products for a given product
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const limit = parseInt(searchParams.get('limit') || '6');

    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      );
    }

    const recommendations = await getSimilarProducts(productId, limit);

    return NextResponse.json({
      success: true,
      recommendations,
      count: recommendations.length,
    });
  } catch (error: unknown) {
    console.error('Similar products error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get recommendations',
        success: false,
      },
      { status: 500 }
    );
  }
}
