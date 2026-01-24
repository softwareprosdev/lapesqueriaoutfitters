import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const adjustmentSchema = z.object({
  variantId: z.string(),
  type: z.enum(['RESTOCK', 'ADJUSTMENT', 'SALE']),
  quantity: z.number().int(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = adjustmentSchema.parse(body);

    const { variantId, type, quantity, notes } = validated;

    // Get current variant
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    // Calculate new stock
    let newStock = variant.stock;
    if (type === 'RESTOCK') {
      newStock += quantity;
    } else if (type === 'ADJUSTMENT') {
      newStock = quantity; // Set to exact value
    } else if (type === 'SALE') {
      newStock -= quantity;
    }

    if (newStock < 0) {
      return NextResponse.json(
        { error: 'Stock cannot be negative' },
        { status: 400 }
      );
    }

    // Update variant stock
    await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: newStock },
    });

    // Create inventory transaction
    const transaction = await prisma.inventoryTransaction.create({
      data: {
        variantId,
        type,
        quantity: Math.abs(quantity),
        notes: notes || `${type} adjustment`,
        userId: session.user.id,
      },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      newStock,
      transaction,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid adjustment data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Inventory adjustment error:', error);
    return NextResponse.json(
      { error: 'Failed to adjust inventory', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
