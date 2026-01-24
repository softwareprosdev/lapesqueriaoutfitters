import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Public API to fetch active discount codes for display
export async function GET() {
  try {
    const now = new Date();

    // Fetch active discount codes that haven't expired
    const discounts = await prisma.discountCode.findMany({
      where: {
        isActive: true,
        OR: [
          { startsAt: null },
          { startsAt: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: now } },
            ],
          },
        ],
      },
      select: {
        code: true,
        type: true,
        value: true,
        description: true,
        expiresAt: true,
        minPurchaseAmount: true,
      },
      orderBy: {
        value: 'desc', // Show highest value discounts first
      },
      take: 3, // Only show top 3 discount codes
    });

    return NextResponse.json({ discounts });
  } catch (error) {
    console.error('Fetch public discounts error:', error);
    return NextResponse.json(
      { discounts: [] },
      { status: 200 } // Return empty array instead of error for UX
    );
  }
}
