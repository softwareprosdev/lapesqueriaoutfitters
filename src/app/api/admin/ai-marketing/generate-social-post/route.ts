import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateSocialCaption } from '@/lib/ai/social-media-manager';
import { z } from 'zod';

const generatePostSchema = z.object({
  product: z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    price: z.number().positive(),
    category: z.string(),
    imageUrl: z.string().optional()
  }),
  platform: z.enum(['instagram', 'facebook', 'twitter', 'pinterest']),
  tone: z.enum(['casual', 'professional', 'enthusiastic']).optional().default('enthusiastic')
});

/**
 * POST /api/admin/ai-marketing/generate-social-post
 * Generate AI-powered social media post
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = generatePostSchema.parse(body);

    // Check if AI key is configured
    if (!process.env.GOOGLE_GENERATIVE_AI_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured. Please add GOOGLE_GENERATIVE_AI_KEY to environment variables.' },
        { status: 500 }
      );
    }

    // Generate caption and hashtags using AI
    const { caption, hashtags } = await generateSocialCaption(
      {
        name: validated.product.name,
        description: validated.product.description,
        price: validated.product.price,
        imageUrl: validated.product.imageUrl || '',
        category: validated.product.category
      },
      validated.platform,
      validated.tone
    );

    // Log the generation for analytics
    console.log(`[AI Marketing] Generated ${validated.platform} post for ${validated.product.name}`);

    return NextResponse.json({
      success: true,
      caption,
      hashtags,
      platform: validated.platform,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('[AI Marketing] Generate post error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to generate social post';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
