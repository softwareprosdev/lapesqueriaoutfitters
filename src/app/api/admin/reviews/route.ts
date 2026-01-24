import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const reviewActionSchema = z.object({
  reviewId: z.string(),
  action: z.enum(['approve', 'reject', 'delete']),
});

// GET - List all reviews with filters
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // all, pending, approved, rejected

    const where: Record<string, unknown> = {};

    if (status === 'pending') {
      where.isApproved = false;
      where.isRejected = false;
    } else if (status === 'approved') {
      where.isApproved = true;
    } else if (status === 'rejected') {
      where.isRejected = true;
    }

    const reviews = await prisma.productReview.findMany({
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate summary stats
    const totalReviews = await prisma.productReview.count();
    const pendingReviews = await prisma.productReview.count({
      where: { isApproved: false, isRejected: false },
    });
    const approvedReviews = await prisma.productReview.count({
      where: { isApproved: true },
    });

    const averageRating = await prisma.productReview.aggregate({
      _avg: {
        rating: true,
      },
      where: {
        isApproved: true,
      },
    });

    return NextResponse.json({
      reviews,
      summary: {
        totalReviews,
        pendingReviews,
        approvedReviews,
        averageRating: averageRating._avg.rating || 0,
      },
    });
  } catch (error) {
    console.error('Fetch reviews error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST - Moderate review (approve/reject/delete)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = reviewActionSchema.parse(body);

    const { reviewId, action } = validated;

    if (action === 'delete') {
      await prisma.productReview.delete({
        where: { id: reviewId },
      });

      return NextResponse.json({
        success: true,
        message: 'Review deleted',
      });
    }

    const updateData: Record<string, unknown> = {};

    if (action === 'approve') {
      updateData.isApproved = true;
      updateData.isRejected = false;
      updateData.moderatedAt = new Date();
      updateData.moderatedBy = session.user.id;
    } else if (action === 'reject') {
      updateData.isApproved = false;
      updateData.isRejected = true;
      updateData.moderatedAt = new Date();
      updateData.moderatedBy = session.user.id;
    }

    const review = await prisma.productReview.update({
      where: { id: reviewId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Review moderation error:', error);
    return NextResponse.json(
      { error: 'Failed to moderate review', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
