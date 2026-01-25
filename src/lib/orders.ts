import { prisma } from '@/lib/db';
import type { CartItem } from '@/types';

interface CreateOrderParams {
  userId?: string | null; // Optional for guest checkout
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  cloverPaymentId?: string;
  customerEmail: string;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export async function createOrder(params: CreateOrderParams) {
  const {
    userId,
    items,
    subtotal,
    shipping,
    tax,
    total,
cloverPaymentId,
    customerEmail,
    shippingAddress,
  } = params;

  // Calculate conservation donation (10% of subtotal by default)
  const conservationAmount = subtotal * 0.10;

  // Calculate rewards points (4 points per purchase)
  const rewardsPoints = 4;

  // Create order in database
  const order = await prisma.order.create({
    data: {
      userId,
      customerEmail,
      status: 'PENDING',
      subtotal,
      shipping,
      tax,
      total,
      cloverPaymentId: cloverPaymentId,
      customerName: shippingAddress.name,
      shippingAddress: `${shippingAddress.line1}${shippingAddress.line2 ? '\n' + shippingAddress.line2 : ''}`,
      shippingCity: shippingAddress.city,
      shippingState: shippingAddress.state,
      shippingZip: shippingAddress.postalCode,
      shippingCountry: shippingAddress.country,
      items: {
        create: items
          .filter((item) => item.variantId !== null)
          .map((item) => ({
            variantId: item.variantId as string,
            quantity: item.quantity,
            price: item.price,
          })),
      },
    },
    include: {
      items: true,
    },
  });

  // Create conservation donation record
  await prisma.conservationDonation.create({
    data: {
      orderId: order.id,
      amount: conservationAmount,
      percentage: 10.0,
      status: 'PLEDGED',
      region: 'South Padre Island', // Default region
    },
  });

  // Award customer rewards points (only for logged-in users)
  if (userId) {
    // Find or create customer reward record
    const customerReward = await prisma.customerReward.upsert({
      where: { userId },
      create: {
        userId,
        points: rewardsPoints,
        totalSpent: total,
        totalOrders: 1,
      },
      update: {
        points: {
          increment: rewardsPoints,
        },
        totalSpent: {
          increment: total,
        },
        totalOrders: {
          increment: 1,
        },
      },
    });

    // Create point transaction record
    await prisma.pointTransaction.create({
      data: {
        customerId: customerReward.id,
        points: rewardsPoints,
        type: 'PURCHASE',
        description: `Purchase #${order.id.slice(0, 8)}`,
        orderId: order.id,
      },
    });
  }

  // Deduct inventory for each item
  for (const item of items) {
    if (!item.variantId) continue; // Skip items without variant

    await prisma.inventoryTransaction.create({
      data: {
        variantId: item.variantId,
        quantity: -item.quantity, // Negative for deduction
        type: 'SALE',
        userId: userId || null, // null for guest orders
        notes: `Order #${order.id.slice(0, 8)}`,
      },
    });

    // Update variant stock
    await prisma.productVariant.update({
      where: { id: item.variantId },
      data: {
        stock: {
          decrement: item.quantity,
        },
      },
    });
  }

  return order;
}

export async function updateOrderStatus(
  orderId: string,
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
) {
  return await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
}

export async function getOrderById(orderId: string) {
  return await prisma.order.findUnique({
    where: { id: orderId },
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
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function getOrdersByUserId(userId: string) {
  return await prisma.order.findMany({
    where: { userId },
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
    orderBy: {
      createdAt: 'desc',
    },
  });
}
