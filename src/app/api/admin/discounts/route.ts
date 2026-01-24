import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const discountSchema = z.object({
  code: z.string().min(3).max(50).toUpperCase(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BUY_X_GET_Y']),
  value: z.number().positive(),
  description: z.string().optional(),
  internalNote: z.string().optional(),
  usageLimit: z.number().int().positive().optional(),
  usageLimitPerCustomer: z.number().int().positive().optional(),
  minPurchaseAmount: z.number().positive().optional(),
  applicableProducts: z.array(z.string()).optional(),
  applicableCategories: z.array(z.string()).optional(),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().default(true),
});

// GET - List all discount codes
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // active, expired, all

    const now = new Date();

    let where: Record<string, unknown> = {};

    if (status === 'active') {
      where = {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: now } },
        ],
      };
    } else if (status === 'expired') {
      where = {
        expiresAt: { lt: now },
      };
    }

    const discounts = await prisma.discountCode.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        usages: {
          select: {
            id: true,
          },
        },
      },
    });

    // Add usage stats to each discount
    const discountsWithStats = discounts.map((discount) => ({
      ...discount,
      totalUsages: discount.usages.length,
      remainingUses: discount.usageLimit
        ? Math.max(0, discount.usageLimit - discount.usages.length)
        : null,
    }));

    return NextResponse.json(discountsWithStats);
  } catch (error) {
    console.error('Fetch discounts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discount codes' },
      { status: 500 }
    );
  }
}

// POST - Create new discount code
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = discountSchema.parse(body);

    // Check if code already exists
    const existingCode = await prisma.discountCode.findUnique({
      where: { code: validatedData.code },
    });

    if (existingCode) {
      return NextResponse.json(
        { error: 'Discount code already exists' },
        { status: 400 }
      );
    }

    // Validate discount type and value
    if (validatedData.type === 'PERCENTAGE' && validatedData.value > 100) {
      return NextResponse.json(
        { error: 'Percentage discount cannot exceed 100%' },
        { status: 400 }
      );
    }

    const discount = await prisma.discountCode.create({
      data: {
        ...validatedData,
        startsAt: validatedData.startsAt ? new Date(validatedData.startsAt) : null,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json(discount, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid discount data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Create discount error:', error);
    return NextResponse.json(
      { error: 'Failed to create discount code' },
      { status: 500 }
    );
  }
}
