import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// POST /api/admin/blog/[id]/publish - Toggle publish status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get current post
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        published: true,
        publishedAt: true,
      },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Toggle published status
    const newPublishedStatus = !existingPost.published;

    // Update the post
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        published: newPublishedStatus,
        publishedAt: newPublishedStatus
          ? (existingPost.publishedAt || new Date()) // Keep existing publishedAt if available
          : null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Revalidate blog pages
    revalidatePath('/blog');
    revalidatePath(`/blog/${post.slug}`);

    return NextResponse.json({
      success: true,
      published: post.published,
      publishedAt: post.publishedAt,
      message: post.published
        ? 'Blog post published successfully'
        : 'Blog post unpublished successfully',
      post,
    });
  } catch (error: unknown) {
    console.error('Error toggling publish status:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error) || 'Failed to toggle publish status'
      },
      { status: 500 }
    );
  }
}
