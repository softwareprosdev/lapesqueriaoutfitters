import { NextRequest, NextResponse } from 'next/server';
import { getPersonalizedRecommendations } from '@/lib/ai/recommendation-engine';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/recommendations/personalized?limit=6
 * Get personalized recommendations based on user history
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');

    const userId = session?.user?.id;

    const recommendations = await getPersonalizedRecommendations(userId, limit);

    return NextResponse.json({
      success: true,
      recommendations,
      count: recommendations.length,
      personalized: !!userId,
    });
  } catch (error: unknown) {
    console.error('Personalized recommendations error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get recommendations',
        success: false,
      },
      { status: 500 }
    );
  }
}
