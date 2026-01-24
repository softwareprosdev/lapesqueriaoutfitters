import { prisma } from '@/lib/prisma';
import { sendShippingNotificationEmail } from './send-email';

interface OrderWithItems {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  createdAt: Date;
  subtotal: number;
  shippingCost?: number;
  tax: number;
  total: number;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry: string;
  trackingNumber?: string | null;
  carrier?: string | null;
  items: Array<{
    quantity: number;
    price: number;
    variant: {
      product: {
        id?: string;
        name: string;
        slug?: string;
        images?: Array<{ url: string }>;
      };
      size?: string | null;
      color?: string | null;
      material?: string | null;
    };
  }>;
  conservationDonation?: {
    amount: number;
    percentage: number;
  } | null;
}

interface ShippingNotificationOptions {
  order: OrderWithItems;
  trackingNumber: string;
  carrier: string;
}

/**
 * Send a shipping notification email with tracking info and upsell products
 */
export async function sendShippingNotification({
  order,
  trackingNumber,
  carrier,
}: ShippingNotificationOptions) {
  // Get upsell products - featured products different from what was ordered
  const orderedProductIds = order.items
    .map((item) => item.variant.product.id)
    .filter(Boolean) as string[];

  let upsellProducts: Array<{
    name: string;
    price: number;
    imageUrl: string;
    slug: string;
  }> = [];

  try {
    // Fetch featured products for upsell
    const products = await prisma.product.findMany({
      where: {
        featured: true,
        id: { notIn: orderedProductIds },
      },
      take: 3,
      select: {
        name: true,
        slug: true,
        basePrice: true,
        images: {
          take: 1,
          select: { url: true },
        },
        variants: {
          take: 1,
          select: { price: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    upsellProducts = products.map((p) => ({
      name: p.name,
      price: p.variants[0]?.price || p.basePrice,
      imageUrl: p.images[0]?.url || '/images/placeholder.png',
      slug: p.slug,
    }));
  } catch (error) {
    console.error('Failed to fetch upsell products:', error);
    // Continue without upsell products
  }

  // Log the email for the database
  try {
    await prisma.emailLog.create({
      data: {
        to: order.customerEmail,
        subject: `Your Order Has Shipped - ${order.orderNumber}`,
        template: 'SHIPPING_NOTIFICATION',
        status: 'pending',
        variables: JSON.stringify({
          orderNumber: order.orderNumber,
          trackingNumber,
          carrier,
          upsellProducts: upsellProducts.map((p) => p.name),
        }),
      },
    });
  } catch {
    // Don't fail if logging fails
  }

  // Send the email
  const emailData = {
    ...order,
    shippingCost: order.shippingCost ?? 0,
    trackingNumber,
    carrier,
  };

  const result = await sendShippingNotificationEmail(emailData);

  // Update email log status
  if (result.success) {
    try {
      await prisma.emailLog.updateMany({
        where: {
          to: order.customerEmail,
          template: 'SHIPPING_NOTIFICATION',
          status: 'pending',
        },
        data: {
          status: 'sent',
          sentAt: new Date(),
        },
      });
    } catch {
      // Don't fail if logging fails
    }
  }

  return result;
}
