import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tags = await prisma.customerTag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { customers: true },
        },
      },
    });

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, color, description, isAutomatic, rules } = body;

    // Check for duplicate name
    const existing = await prisma.customerTag.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json({ error: 'Tag with this name already exists' }, { status: 400 });
    }

    const tag = await prisma.customerTag.create({
      data: {
        name,
        color: color || '#3B82F6',
        description,
        isAutomatic: isAutomatic || false,
        rules: rules || null,
      },
    });

    return NextResponse.json({ tag });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}
