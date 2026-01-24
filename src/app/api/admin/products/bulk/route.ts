import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const bulkEditSchema = z.object({
  productIds: z.array(z.string()).min(1),
  action: z.enum(['update_price', 'update_stock', 'update_status', 'delete']),
  data: z.object({
    priceAdjustment: z.number().optional(),
    priceType: z.enum(['percentage', 'fixed']).optional(),
    stockAdjustment: z.number().int().optional(),
    stockType: z.enum(['set', 'add', 'subtract']).optional(),
    featured: z.boolean().optional(),
  }).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = bulkEditSchema.parse(body);

    const { productIds, action, data } = validated;

    let updated = 0;
    const errors: { id: string; error: string }[] = [];

    switch (action) {
      case 'update_price':
        if (!data?.priceAdjustment || !data.priceType) {
          return NextResponse.json(
            { error: 'Price adjustment and type required' },
            { status: 400 }
          );
        }

        for (const productId of productIds) {
          try {
            const product = await prisma.product.findUnique({
              where: { id: productId },
              include: { variants: true },
            });

            if (!product) {
              errors.push({ id: productId, error: 'Product not found' });
              continue;
            }

            // Update base price
            let newBasePrice = product.basePrice;
            if (data.priceType === 'percentage') {
              newBasePrice = product.basePrice * (1 + data.priceAdjustment / 100);
            } else {
              newBasePrice = product.basePrice + data.priceAdjustment;
            }

            await prisma.product.update({
              where: { id: productId },
              data: { basePrice: Math.max(0.01, newBasePrice) },
            });

            // Update variant prices
            for (const variant of product.variants) {
              let newVariantPrice = variant.price;
              if (data.priceType === 'percentage') {
                newVariantPrice = variant.price * (1 + data.priceAdjustment / 100);
              } else {
                newVariantPrice = variant.price + data.priceAdjustment;
              }

              await prisma.productVariant.update({
                where: { id: variant.id },
                data: { price: Math.max(0.01, newVariantPrice) },
              });
            }

            updated++;
          } catch (error) {
            errors.push({ id: productId, error: error instanceof Error ? error.message : 'Unknown error' });
          }
        }
        break;

      case 'update_stock':
        if (data?.stockAdjustment === undefined || !data.stockType) {
          return NextResponse.json(
            { error: 'Stock adjustment and type required' },
            { status: 400 }
          );
        }

        for (const productId of productIds) {
          try {
            const variants = await prisma.productVariant.findMany({
              where: { productId },
            });

            for (const variant of variants) {
              let newStock = variant.stock;

              if (data.stockType === 'set') {
                newStock = data.stockAdjustment;
              } else if (data.stockType === 'add') {
                newStock = variant.stock + data.stockAdjustment;
              } else if (data.stockType === 'subtract') {
                newStock = variant.stock - data.stockAdjustment;
              }

              await prisma.productVariant.update({
                where: { id: variant.id },
                data: { stock: Math.max(0, newStock) },
              });

              // Create inventory transaction
              await prisma.inventoryTransaction.create({
                data: {
                  variantId: variant.id,
                  type: data.stockType === 'add' ? 'RESTOCK' : 'ADJUSTMENT',
                  quantity: Math.abs(newStock - variant.stock),
                  notes: `Bulk edit: ${data.stockType} ${data.stockAdjustment}`,
                  userId: session.user.id,
                },
              });
            }

            updated++;
          } catch (error) {
            errors.push({ id: productId, error: error instanceof Error ? error.message : 'Unknown error' });
          }
        }
        break;

      case 'update_status':
        if (data?.featured === undefined) {
          return NextResponse.json(
            { error: 'Featured status required' },
            { status: 400 }
          );
        }

        for (const productId of productIds) {
          try {
            await prisma.product.update({
              where: { id: productId },
              data: { featured: data.featured },
            });
            updated++;
          } catch (error) {
            errors.push({ id: productId, error: error instanceof Error ? error.message : 'Unknown error' });
          }
        }
        break;

      case 'delete':
        for (const productId of productIds) {
          try {
            // Check if product has orders
            const orderItems = await prisma.orderItem.count({
              where: {
                variant: {
                  productId,
                },
              },
            });

            if (orderItems > 0) {
              errors.push({
                id: productId,
                error: 'Cannot delete product with existing orders',
              });
              continue;
            }

            await prisma.product.delete({
              where: { id: productId },
            });
            updated++;
          } catch (error) {
            errors.push({ id: productId, error: error instanceof Error ? error.message : 'Unknown error' });
          }
        }
        break;
    }

    return NextResponse.json({
      success: true,
      updated,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Bulk edit error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk edit', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
