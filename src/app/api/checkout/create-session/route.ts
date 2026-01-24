import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { PayloadCartItem } from '@/context/CartContext';

// Make this route dynamic to avoid build-time evaluation
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface CheckoutSessionRequest {
  items: PayloadCartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  customerEmail: string;
}

export async function POST(request: NextRequest) {
  try {
    // Lazy load Stripe modules to avoid build-time errors
    const { stripe, STRIPE_CONFIG, isStripeEnabled } = await import('@/lib/stripe');

    // Check if Stripe is enabled
    if (!isStripeEnabled() || !stripe) {
      return NextResponse.json(
        { error: 'Payment processing is not currently available. Stripe is not configured.' },
        { status: 503 }
      );
    }

    // Get session if available (optional - supports guest checkout)
    const session = await getServerSession(authOptions);

    const data: CheckoutSessionRequest = await request.json();
    const { items, subtotal, shipping, tax, total, shippingAddress, customerEmail } = data;

    // Validate request
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!shippingAddress || !customerEmail) {
      return NextResponse.json({ error: 'Missing shipping information' }, { status: 400 });
    }

    // Calculate conservation donation (10% of subtotal)
    const conservationAmount = subtotal * 0.10;

    // Calculate rewards points (4 points per purchase)
    const rewardsPoints = 4;

    // Create Stripe line items from cart items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lineItems: any[] = items.map((item) => ({
      price_data: {
        currency: STRIPE_CONFIG.currency,
        product_data: {
          name: item.variantName
            ? `${item.productName} - ${item.variantName}`
            : item.productName,
          description: item.variantSku || item.productSku,
          images: item.imageUrl ? [item.imageUrl] : [],
          metadata: {
            productId: String(item.productId),
            variantId: item.variantId || '',
            sku: item.variantSku || item.productSku,
          },
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if applicable
    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: STRIPE_CONFIG.currency,
          product_data: {
            name: 'Shipping',
            description: 'Standard shipping',
          },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      });
    }

    // Add tax as a line item
    lineItems.push({
      price_data: {
        currency: STRIPE_CONFIG.currency,
        product_data: {
          name: 'Tax',
          description: 'Sales tax (8.25%)',
        },
        unit_amount: Math.round(tax * 100),
      },
      quantity: 1,
    });

    // Create compact item references for metadata (Stripe has 500 char limit per value)
    // Format: "variantId:qty:price" for each item, separated by "|"
    const itemsCompact = items.map(item =>
      `${item.variantId || item.productId}:${item.quantity}:${item.price}`
    ).join('|');

    // Store item count for validation
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: STRIPE_CONFIG.mode,
      line_items: lineItems,
      customer_email: customerEmail,
      success_url: `${request.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/cart`,
      metadata: {
        // Include userId only if user is logged in (supports guest checkout)
        ...(session?.user?.id && { userId: session.user.id }),
        customerEmail,
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        conservationAmount: conservationAmount.toFixed(2),
        rewardsPoints: String(rewardsPoints),
        itemCount: String(itemCount),
        shippingName: shippingAddress.name,
        shippingLine1: shippingAddress.line1,
        shippingLine2: shippingAddress.line2 || '',
        shippingCity: shippingAddress.city,
        shippingState: shippingAddress.state,
        shippingPostalCode: shippingAddress.postalCode,
        shippingCountry: shippingAddress.country,
        // Compact format: "variantId:qty:price|variantId:qty:price|..."
        items: itemsCompact,
      },
    });

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
  } catch (error: unknown) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
