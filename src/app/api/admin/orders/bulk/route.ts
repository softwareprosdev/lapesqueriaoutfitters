import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendShippingNotificationEmail } from '@/lib/email/send-email';

const bulkOrderSchema = z.object({
  orderIds: z.array(z.string()).min(1),
  action: z.enum(['mark_shipped', 'mark_delivered', 'cancel', 'mark_processing']),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = bulkOrderSchema.parse(body);

    const { orderIds, action, trackingNumber, carrier } = validated;

    let updated = 0;
    const errors: { id: string; error: string }[] = [];

    for (const orderId of orderIds) {
      try {
        const updateData: Record<string, unknown> = {};

        switch (action) {
          case 'mark_shipped':
            updateData.status = 'SHIPPED';
            updateData.shippedAt = new Date();
            if (trackingNumber) {
              updateData.trackingNumber = trackingNumber;
            }
            if (carrier) {
              updateData.carrier = carrier;
            }
            break;

          case 'mark_delivered':
            updateData.status = 'DELIVERED';
            updateData.deliveredAt = new Date();
            break;

          case 'cancel':
            // Check if order can be cancelled
            const order = await prisma.order.findUnique({
              where: { id: orderId },
            });

            if (order?.status === 'DELIVERED') {
              errors.push({
                id: orderId,
                error: 'Cannot cancel delivered order',
              });
              continue;
            }

            updateData.status = 'CANCELLED';
            break;

          case 'mark_processing':
            updateData.status = 'PROCESSING';
            break;
        }

        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: updateData,
          include: {
            items: {
              include: {
                variant: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
        });

        // Send shipping notification email if order was marked as shipped
        if (action === 'mark_shipped' && trackingNumber) {
          try {
            await sendShippingNotificationEmail(updatedOrder);
          } catch (emailError) {
            console.error('Failed to send shipping notification:', emailError);
            // Don't fail the order update if email fails
          }
        }

        updated++;
      } catch (error) {
        errors.push({ id: orderId, error: error instanceof Error ? error.message : 'Unknown error' });
      }
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

    console.error('Bulk order action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk action', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
