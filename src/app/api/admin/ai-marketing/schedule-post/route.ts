import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schedulePostSchema = z.object({
  platform: z.enum(['instagram', 'facebook', 'twitter', 'pinterest']),
  caption: z.string().min(1),
  hashtags: z.array(z.string()),
  scheduledAt: z.string().datetime().optional(),
  imageUrl: z.string().optional()
});

/**
 * POST /api/admin/ai-marketing/schedule-post
 * Schedule a social media post
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = schedulePostSchema.parse(body);

    // Calculate scheduled time (default to next optimal time for platform)
    const scheduledAt = validated.scheduledAt 
      ? new Date(validated.scheduledAt)
      : getNextOptimalTime(validated.platform);

    // Store in database for processing
    const post = await prisma.socialMediaPost.create({
      data: {
        platform: validated.platform,
        content: validated.caption,
        hashtags: validated.hashtags,
        imageUrl: validated.imageUrl || null,
        scheduledAt,
        status: 'scheduled',
        createdById: session.user.id
      }
    });

    console.log(`[Social Media] Scheduled ${validated.platform} post for ${scheduledAt.toISOString()}`);

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        platform: post.platform,
        scheduledAt: post.scheduledAt.toISOString()
      }
    });

  } catch (error) {
    console.error('[Social Media] Schedule post error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to schedule post' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/ai-marketing/schedule-post
 * Get all scheduled posts
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const posts = await prisma.socialMediaPost.findMany({
      where: {
        status: { in: ['scheduled', 'posted'] }
      },
      orderBy: { scheduledAt: 'asc' },
      take: 50
    });

    return NextResponse.json({ posts });

  } catch (error) {
    console.error('[Social Media] Fetch posts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

/**
 * Helper: Get next optimal posting time for platform
 */
function getNextOptimalTime(platform: string): Date {
  const now = new Date();
  const optimal = new Date(now);

  // Set to next optimal hour based on platform
  const optimalHours = {
    instagram: [9, 14, 19], // 9 AM, 2 PM, 7 PM
    facebook: [10, 13, 20], // 10 AM, 1 PM, 8 PM
    pinterest: [8, 15, 21], // 8:30 AM, 3 PM, 9 PM
    twitter: [8, 12, 17]    // 8 AM, 12 PM, 5 PM
  };

  const hours = optimalHours[platform as keyof typeof optimalHours] || optimalHours.instagram;
  const currentHour = now.getHours();

  // Find next optimal hour
  const nextHour = hours.find(h => h > currentHour) || hours[0];
  
  if (nextHour <= currentHour) {
    optimal.setDate(optimal.getDate() + 1); // Next day
  }
  
  optimal.setHours(nextHour, 0, 0, 0);

  return optimal;
}
