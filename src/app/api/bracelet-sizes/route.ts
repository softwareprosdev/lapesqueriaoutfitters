import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public API endpoint for bracelet sizes - used by frontend components
export async function GET() {
  try {
    const sizes = await prisma.braceletSize.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        name: true,
        label: true,
        inches: true,
        description: true,
        displayOrder: true,
      },
    });

    // Set cache headers for better performance
    return NextResponse.json(sizes, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching bracelet sizes:', error);
    return NextResponse.json({ error: 'Failed to fetch sizes' }, { status: 500 });
  }
}
