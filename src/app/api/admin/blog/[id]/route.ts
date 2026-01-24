import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// GET /api/admin/blog/[id] - Get single blog post by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const post = await prisma.blogPost.findUnique({
      where: { id },
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

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error: unknown) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error) || 'Failed to fetch blog post'
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/blog/[id] - Update blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    // Check if blog post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // If slug is being changed, check if new slug is available
    if (data.slug && data.slug !== existingPost.slug) {
      const slugExists = await prisma.blogPost.findUnique({
        where: { slug: data.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'A blog post with this slug already exists' },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.featuredImage !== undefined) updateData.featuredImage = data.featuredImage;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.featured !== undefined) updateData.featured = data.featured;

    // Handle publishing
    if (data.published !== undefined) {
      updateData.published = data.published;

      // Set publishedAt when publishing for the first time
      if (data.published && !existingPost.publishedAt) {
        updateData.publishedAt = new Date();
      }

      // Clear publishedAt when unpublishing
      if (!data.published) {
        updateData.publishedAt = null;
      }
    }

    // Update blog post
    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData,
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
    revalidatePath(`/blog/${existingPost.slug}`);
    if (data.slug && data.slug !== existingPost.slug) {
      revalidatePath(`/blog/${data.slug}`);
    }

    return NextResponse.json(post);
  } catch (error: unknown) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error) || 'Failed to update blog post'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/blog/[id] - Delete blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get the blog post slug before deleting for revalidation
    const post = await prisma.blogPost.findUnique({
      where: { id },
      select: { slug: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Delete the blog post
    await prisma.blogPost.delete({
      where: { id },
    });

    // Revalidate blog pages
    revalidatePath('/blog');
    revalidatePath(`/blog/${post.slug}`);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error) || 'Failed to delete blog post'
      },
      { status: 500 }
    );
  }
}
