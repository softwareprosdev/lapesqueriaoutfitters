import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    // Fetch order with all timeline-related data
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                  },
                },
              },
            },
          },
        },
        conservationDonation: true,
        notes: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Build timeline events
    const timeline = [];

    // Order created
    timeline.push({
      type: 'order_created',
      title: 'Order Created',
      description: `Order #${order.orderNumber} was placed`,
      timestamp: order.createdAt,
      icon: 'shopping-bag',
    });

    // Order status changes
    if (order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'DELIVERED') {
      timeline.push({
        type: 'status_change',
        title: 'Order Processing',
        description: 'Order moved to processing',
        timestamp: order.updatedAt,
        icon: 'clock',
      });
    }

    if (order.shippedAt) {
      timeline.push({
        type: 'shipped',
        title: 'Order Shipped',
        description: order.trackingNumber
          ? `Shipped via ${order.carrier || 'carrier'} - Tracking: ${order.trackingNumber}`
          : 'Order has been shipped',
        timestamp: order.shippedAt,
        icon: 'truck',
      });
    }

    if (order.deliveredAt) {
      timeline.push({
        type: 'delivered',
        title: 'Order Delivered',
        description: 'Order was successfully delivered',
        timestamp: order.deliveredAt,
        icon: 'check-circle',
      });
    }

    if (order.status === 'CANCELLED') {
      timeline.push({
        type: 'cancelled',
        title: 'Order Cancelled',
        description: 'Order was cancelled',
        timestamp: order.updatedAt,
        icon: 'x-circle',
      });
    }

    // Add notes as timeline events
    order.notes.forEach((note) => {
      timeline.push({
        type: 'note',
        title: 'Note Added',
        description: note.content,
        timestamp: note.createdAt,
        icon: 'message-square',
        user: note.user.name,
      });
    });

    // Sort by timestamp
    timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        subtotal: order.subtotal,
        shipping: order.shipping,
        tax: order.tax,
        total: order.total,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        shippingAddress: order.shippingAddress,
        shippingCity: order.shippingCity,
        shippingState: order.shippingState,
        shippingZip: order.shippingZip,
        shippingCountry: order.shippingCountry,
        cloverPaymentId: order.cloverPaymentId,
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
        createdAt: order.createdAt,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
        items: order.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          variant: {
            id: item.variant.id,
            name: item.variant.name,
            sku: item.variant.sku,
            size: item.variant.size,
            color: item.variant.color,
            material: item.variant.material,
            product: item.variant.product,
          },
        })),
        conservationDonation: order.conservationDonation ? {
          amount: order.conservationDonation.amount,
          percentage: order.conservationDonation.percentage,
          status: order.conservationDonation.status,
        } : null,
      },
      timeline
    });
  } catch (error) {
    console.error('Fetch order timeline error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeline' },
      { status: 500 }
    );
  }
}
