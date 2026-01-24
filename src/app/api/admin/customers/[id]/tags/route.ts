import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET tags for a specific customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const customerTags = await prisma.customerTags.findMany({
      where: { userId: id },
      include: { tag: true },
    });

    const tags = customerTags.map((ct) => ct.tag);

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error fetching customer tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

// PUT - Update tags for a customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { tagIds } = await request.json();

    // Delete existing tags
    await prisma.customerTags.deleteMany({
      where: { userId: id },
    });

    // Add new tags
    if (tagIds && tagIds.length > 0) {
      await prisma.customerTags.createMany({
        data: tagIds.map((tagId: string) => ({
          userId: id,
          tagId,
        })),
      });
    }

    // Update tag counts
    const allTags = await prisma.customerTag.findMany();
    for (const tag of allTags) {
      const count = await prisma.customerTags.count({
        where: { tagId: tag.id },
      });
      await prisma.customerTag.update({
        where: { id: tag.id },
        data: { customerCount: count },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating customer tags:', error);
    return NextResponse.json({ error: 'Failed to update tags' }, { status: 500 });
  }
}
