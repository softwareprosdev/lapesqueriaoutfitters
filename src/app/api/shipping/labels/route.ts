import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SHIPPING_RATES } from '@/lib/shipping';

export interface LabelPurchaseRequest {
  orderId: string;
  shippingType: 'standard' | 'express' | 'free';
}

export interface LabelPurchaseResult {
  success: boolean;
  label?: {
    id: string;
    trackingNumber: string;
    carrier: string;
    service: string;
    cost: number;
  };
  error?: string;
}

// Generate a mock tracking number (in production, this would come from the carrier API)
function generateTrackingNumber(): string {
  const prefix = 'LP'; // La Pesqueria's Studio prefix
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

// GET - Fetch label for an order
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const label = await prisma.shippingLabel.findFirst({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    if (!label) {
      return NextResponse.json({ label: null });
    }

    return NextResponse.json({ label });
  } catch (error: unknown) {
    console.error('Get Label Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch label';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST - Create a shipping label
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, shippingType }: LabelPurchaseRequest = await request.json();

    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: 'Order ID is required'
      } as LabelPurchaseResult, { status: 400 });
    }

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      } as LabelPurchaseResult, { status: 404 });
    }

    // Check for existing label
    const existingLabel = await prisma.shippingLabel.findFirst({
      where: { orderId },
    });

    if (existingLabel) {
      return NextResponse.json({
        success: false,
        error: 'A label has already been created for this order'
      } as LabelPurchaseResult, { status: 400 });
    }

    // Get shipping rate
    const shippingRate = SHIPPING_RATES.find(r => r.type === (shippingType || 'standard')) || SHIPPING_RATES[0];
    const trackingNumber = generateTrackingNumber();

    // Create label in database
    const shippingLabel = await prisma.shippingLabel.create({
      data: {
        orderId,
        carrier: 'USPS', // Default carrier
        service: shippingRate.name,
        trackingNumber,
        cost: shippingRate.amount / 100, // Convert from cents
        status: 'created',
      },
    });

    // Update order with tracking info
    await prisma.order.update({
      where: { id: orderId },
      data: {
        trackingNumber,
        carrier: 'USPS',
        shippingCost: shippingRate.amount / 100,
      },
    });

    return NextResponse.json({
      success: true,
      label: {
        id: shippingLabel.id,
        trackingNumber,
        carrier: 'USPS',
        service: shippingRate.name,
        cost: shippingRate.amount / 100,
      }
    } as LabelPurchaseResult);

  } catch (error: unknown) {
    console.error('Label Creation Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create label';
    return NextResponse.json({
      success: false,
      error: message
    } as LabelPurchaseResult, { status: 500 });
  }
}
