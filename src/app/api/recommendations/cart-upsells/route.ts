import { NextRequest, NextResponse } from 'next/server';
import { getFrequentlyBoughtTogether } from '@/lib/ai/recommendation-engine';

/**
 * GET /api/recommendations/cart-upsells?productId=xxx&limit=3
 * Get frequently bought together products
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const limit = parseInt(searchParams.get('limit') || '3');

    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      );
    }

    const recommendations = await getFrequentlyBoughtTogether(productId, limit);

    return NextResponse.json({
      success: true,
      recommendations,
      count: recommendations.length,
    });
  } catch (error: unknown) {
    console.error('Cart upsells error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get recommendations',
        success: false,
      },
      { status: 500 }
    );
  }
}
