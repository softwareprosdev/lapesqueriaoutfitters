import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateDiscountSchema = z.object({
  code: z.string().min(3).max(50).toUpperCase().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BUY_X_GET_Y']).optional(),
  value: z.number().positive().optional(),
  description: z.string().optional(),
  internalNote: z.string().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  usageLimitPerCustomer: z.number().int().positive().nullable().optional(),
  minPurchaseAmount: z.number().positive().nullable().optional(),
  applicableProducts: z.array(z.string()).optional(),
  applicableCategories: z.array(z.string()).optional(),
  startsAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

// GET - Get single discount code
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const discount = await prisma.discountCode.findUnique({
      where: { id },
      include: {
        usages: true,
      },
    });

    if (!discount) {
      return NextResponse.json(
        { error: 'Discount code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(discount);
  } catch (error) {
    console.error('Fetch discount error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discount code' },
      { status: 500 }
    );
  }
}

// PATCH - Update discount code
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validatedData = updateDiscountSchema.parse(body);

    // Check if discount exists
    const existingDiscount = await prisma.discountCode.findUnique({
      where: { id },
    });

    if (!existingDiscount) {
      return NextResponse.json(
        { error: 'Discount code not found' },
        { status: 404 }
      );
    }

    // If updating code, check it's not already taken
    if (validatedData.code && validatedData.code !== existingDiscount.code) {
      const codeExists = await prisma.discountCode.findUnique({
        where: { code: validatedData.code },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: 'Discount code already exists' },
          { status: 400 }
        );
      }
    }

    // Build update data explicitly to handle null values correctly
    const updateData: Record<string, unknown> = {};

    if (validatedData.code !== undefined) updateData.code = validatedData.code;
    if (validatedData.type !== undefined) updateData.type = validatedData.type;
    if (validatedData.value !== undefined) updateData.value = validatedData.value;
    if (validatedData.description !== undefined) updateData.description = validatedData.description || null;
    if (validatedData.internalNote !== undefined) updateData.internalNote = validatedData.internalNote || null;
    if (validatedData.usageLimit !== undefined) updateData.usageLimit = validatedData.usageLimit;
    if (validatedData.usageLimitPerCustomer !== undefined) updateData.usageLimitPerCustomer = validatedData.usageLimitPerCustomer;
    if (validatedData.minPurchaseAmount !== undefined) updateData.minPurchaseAmount = validatedData.minPurchaseAmount;
    if (validatedData.applicableProducts !== undefined) updateData.applicableProducts = validatedData.applicableProducts;
    if (validatedData.applicableCategories !== undefined) updateData.applicableCategories = validatedData.applicableCategories;
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;

    // Handle dates - convert strings to Date or set to null
    if (validatedData.startsAt !== undefined) {
      updateData.startsAt = validatedData.startsAt ? new Date(validatedData.startsAt) : null;
    }
    if (validatedData.expiresAt !== undefined) {
      updateData.expiresAt = validatedData.expiresAt ? new Date(validatedData.expiresAt) : null;
    }

    const discount = await prisma.discountCode.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(discount);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid discount data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Update discount error:', error);
    return NextResponse.json(
      { error: 'Failed to update discount code' },
      { status: 500 }
    );
  }
}

// DELETE - Delete discount code
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    // Check if discount exists
    const existingDiscount = await prisma.discountCode.findUnique({
      where: { id },
    });

    if (!existingDiscount) {
      return NextResponse.json(
        { error: 'Discount code not found' },
        { status: 404 }
      );
    }

    await prisma.discountCode.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Discount code deleted successfully' });
  } catch (error) {
    console.error('Delete discount error:', error);
    return NextResponse.json(
      { error: 'Failed to delete discount code' },
      { status: 500 }
    );
  }
}
