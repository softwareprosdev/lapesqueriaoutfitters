import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createOrder } from '@/lib/orders';
import { sendEmail } from '@/lib/email';
import OrderConfirmationEmail from '@/emails/OrderConfirmation';
import { z } from 'zod';

const cartItemSchema = z.object({
  productId: z.union([z.string(), z.number()]),
  variantId: z.string().nullable(),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
  name: z.string(),
  variantName: z.string().nullable().optional(),
  sku: z.string(),
});

const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1),
  subtotal: z.number().nonnegative(),
  shipping: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  total: z.number().positive(),
  customerEmail: z.string().email(),
  shippingAddress: z.object({
    name: z.string().min(1),
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1).default('US'),
  }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = checkoutSchema.parse(body);

    // Get optional userId from session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    // Create order using existing createOrder function
    // (handles inventory deduction, conservation donations, rewards points)
    const order = await createOrder({
      userId,
      items: validated.items,
      subtotal: validated.subtotal,
      shipping: validated.shipping,
      tax: validated.tax,
      total: validated.total,
      customerEmail: validated.customerEmail,
      shippingAddress: validated.shippingAddress,
    });

    // Create matching order on Clover if configured
    try {
      const accessToken = process.env.CLOVER_ACCESS_TOKEN;
      const merchantId = process.env.CLOVER_MERCHANT_ID;

      if (accessToken && merchantId) {
        const cloverResponse = await fetch(
          `https://api.clover.com/v3/merchants/${merchantId}/orders`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              state: 'open',
              total: Math.round(validated.total * 100), // Clover uses cents
              title: `Web Order #${order.id.slice(0, 8)}`,
              note: `Online order from ${validated.customerEmail}`,
            }),
          }
        );

        if (cloverResponse.ok) {
          const cloverOrder = await cloverResponse.json();
          // Store cloverOrderId on local order
          const { prisma } = await import('@/lib/prisma');
          await prisma.order.update({
            where: { id: order.id },
            data: { cloverOrderId: cloverOrder.id },
          });
        } else {
          console.error('Failed to create Clover order:', cloverResponse.statusText);
        }
      }
    } catch (cloverError) {
      // Don't fail the checkout if Clover sync fails
      console.error('Clover order creation failed:', cloverError);
    }

    // Send order confirmation email (don't block checkout on email failure)
    const conservationAmount = validated.subtotal * 0.10;
    try {
      await sendEmail({
        to: validated.customerEmail,
        subject: `Order Confirmed - #${order.id.slice(0, 8).toUpperCase()}`,
        react: OrderConfirmationEmail({
          orderId: order.id,
          customerName: validated.shippingAddress.name,
          customerEmail: validated.customerEmail,
          items: validated.items.map((item) => ({
            name: item.name,
            variantName: item.variantName,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal: validated.subtotal,
          shipping: validated.shipping,
          tax: validated.tax,
          total: validated.total,
          conservationAmount,
          rewardsPoints: userId ? 4 : 0,
          shippingAddress: validated.shippingAddress,
        }),
      });
    } catch (emailError) {
      console.error('Order confirmation email failed:', emailError);
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      url: `/checkout/success?session_id=${order.id}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid checkout data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
