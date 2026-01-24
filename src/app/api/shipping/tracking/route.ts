import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export interface TrackingEvent {
  date: string;
  time: string;
  location: string;
  status: string;
  statusDetails: string;
}

export interface TrackingResult {
  carrier: string;
  trackingNumber: string;
  status: string;
  statusDetails: string;
  estimatedDelivery?: string;
  events: TrackingEvent[];
}

// GET - Fetch tracking info for a tracking number or order
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get('trackingNumber');
    const orderId = searchParams.get('orderId');

    // If orderId is provided, lookup tracking info from database
    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          trackingNumber: true,
          carrier: true,
          status: true,
          createdAt: true,
          shippedAt: true,
          deliveredAt: true,
        },
      });

      if (!order?.trackingNumber) {
        return NextResponse.json({
          error: 'No tracking information available for this order'
        }, { status: 404 });
      }

      // Build tracking events from order status
      const events: TrackingEvent[] = [];

      events.push({
        date: order.createdAt.toLocaleDateString(),
        time: order.createdAt.toLocaleTimeString(),
        location: 'South Padre Island, TX',
        status: 'ORDER_PLACED',
        statusDetails: 'Order has been placed and is being prepared',
      });

      if (order.shippedAt) {
        events.push({
          date: order.shippedAt.toLocaleDateString(),
          time: order.shippedAt.toLocaleTimeString(),
          location: 'South Padre Island, TX',
          status: 'SHIPPED',
          statusDetails: 'Package has been shipped',
        });
      }

      if (order.deliveredAt) {
        events.push({
          date: order.deliveredAt.toLocaleDateString(),
          time: order.deliveredAt.toLocaleTimeString(),
          location: 'Delivered',
          status: 'DELIVERED',
          statusDetails: 'Package has been delivered',
        });
      }

      // Estimate delivery (5-7 business days from order)
      const estimatedDelivery = new Date(order.createdAt);
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

      const result: TrackingResult = {
        carrier: order.carrier || 'USPS',
        trackingNumber: order.trackingNumber,
        status: order.status || 'PROCESSING',
        statusDetails: getStatusDetails(order.status),
        estimatedDelivery: estimatedDelivery.toLocaleDateString(),
        events: events.reverse(), // Most recent first
      };

      return NextResponse.json(result);
    }

    // Direct tracking lookup by tracking number
    if (!trackingNumber) {
      return NextResponse.json({
        error: 'Tracking number or order ID is required'
      }, { status: 400 });
    }

    // Find order by tracking number
    const order = await prisma.order.findFirst({
      where: { trackingNumber },
      select: {
        id: true,
        trackingNumber: true,
        carrier: true,
        status: true,
        createdAt: true,
        shippedAt: true,
        deliveredAt: true,
      },
    });

    if (!order) {
      return NextResponse.json({
        error: 'Tracking number not found'
      }, { status: 404 });
    }

    // Build tracking events
    const events: TrackingEvent[] = [];

    events.push({
      date: order.createdAt.toLocaleDateString(),
      time: order.createdAt.toLocaleTimeString(),
      location: 'South Padre Island, TX',
      status: 'ORDER_PLACED',
      statusDetails: 'Order has been placed and is being prepared',
    });

    if (order.shippedAt) {
      events.push({
        date: order.shippedAt.toLocaleDateString(),
        time: order.shippedAt.toLocaleTimeString(),
        location: 'South Padre Island, TX',
        status: 'SHIPPED',
        statusDetails: 'Package has been shipped',
      });
    }

    if (order.deliveredAt) {
      events.push({
        date: order.deliveredAt.toLocaleDateString(),
        time: order.deliveredAt.toLocaleTimeString(),
        location: 'Delivered',
        status: 'DELIVERED',
        statusDetails: 'Package has been delivered',
      });
    }

    const estimatedDelivery = new Date(order.createdAt);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

    const result: TrackingResult = {
      carrier: order.carrier || 'USPS',
      trackingNumber: order.trackingNumber!,
      status: order.status || 'PROCESSING',
      statusDetails: getStatusDetails(order.status),
      estimatedDelivery: estimatedDelivery.toLocaleDateString(),
      events: events.reverse(),
    };

    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error('Tracking Lookup Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch tracking';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function getStatusDetails(status: string | null): string {
  switch (status) {
    case 'PENDING':
      return 'Order is pending payment confirmation';
    case 'PROCESSING':
      return 'Order is being prepared for shipment';
    case 'SHIPPED':
      return 'Order has been shipped and is in transit';
    case 'DELIVERED':
      return 'Order has been delivered';
    case 'CANCELLED':
      return 'Order has been cancelled';
    default:
      return 'Order status is being updated';
  }
}

// POST - Manual tracking update (admin only)
export async function POST(request: NextRequest) {
  try {
    const { trackingNumber, status } = await request.json();

    if (!trackingNumber || !status) {
      return NextResponse.json({
        error: 'Tracking number and status are required'
      }, { status: 400 });
    }

    // Update order status
    const order = await prisma.order.findFirst({
      where: { trackingNumber },
    });

    if (!order) {
      return NextResponse.json({
        error: 'Order not found'
      }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { 
      status: status as 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
    };

    if (status === 'SHIPPED' && !order.shippedAt) {
      updateData.shippedAt = new Date();
    } else if (status === 'DELIVERED' && !order.deliveredAt) {
      updateData.deliveredAt = new Date();
    }

    await prisma.order.update({
      where: { id: order.id },
      data: updateData,
    });

    // Update shipping label status if exists
    await prisma.shippingLabel.updateMany({
      where: { orderId: order.id },
      data: {
        status: status === 'DELIVERED' ? 'delivered' : status === 'SHIPPED' ? 'shipped' : 'created',
        shippedAt: status === 'SHIPPED' ? new Date() : undefined,
        deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`
    });

  } catch (error: unknown) {
    console.error('Tracking Update Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update tracking';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
