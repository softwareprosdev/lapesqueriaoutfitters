/**
 * Import Historical Stripe Orders
 *
 * This script fetches ALL completed checkout sessions from Stripe and imports
 * any missing orders into the database. Runs automatically during seeding.
 *
 * Usage:
 *   npx tsx scripts/import_stripe_orders.ts [days]
 *
 * Examples:
 *   npx tsx scripts/import_stripe_orders.ts        # All orders (default)
 *   npx tsx scripts/import_stripe_orders.ts 7      # Last 7 days
 *   npx tsx scripts/import_stripe_orders.ts 90     # Last 90 days
 */

import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
});

const prisma = new PrismaClient();

// Get days from command line argument or default to 365 (fetch all)
const DAYS_TO_SYNC = parseInt(process.argv[2] || '365', 10);

interface ImportStats {
  totalFound: number;
  alreadyExists: number;
  imported: number;
  failed: number;
  errors: string[];
}

async function importStripeOrders(): Promise<ImportStats> {
  const stats: ImportStats = {
    totalFound: 0,
    alreadyExists: 0,
    imported: 0,
    failed: 0,
    errors: [],
  };

  console.log(`\n🔄 Importing Stripe orders from the last ${DAYS_TO_SYNC} days...\n`);

  const startDate = Math.floor(Date.now() / 1000) - (DAYS_TO_SYNC * 24 * 60 * 60);

  let hasMore = true;
  let startingAfter: string | undefined;
  const allSessions: Stripe.Checkout.Session[] = [];

  // Fetch all checkout sessions (paginated)
  while (hasMore) {
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      created: { gte: startDate },
      status: 'complete',
      starting_after: startingAfter,
    });

    allSessions.push(...sessions.data);
    hasMore = sessions.has_more;

    if (sessions.data.length > 0) {
      startingAfter = sessions.data[sessions.data.length - 1].id;
    }
  }

  stats.totalFound = allSessions.length;
  console.log(`📊 Found ${stats.totalFound} completed checkout sessions\n`);

  if (stats.totalFound === 0) {
    console.log('No completed checkout sessions found in this time period.');
    return stats;
  }

  // Process each session
  for (const session of allSessions) {
    const paymentIntentId = session.payment_intent as string;

    // Check if order already exists
    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [
          { stripePaymentId: paymentIntentId },
          { stripePaymentId: session.id },
        ],
      },
    });

    if (existingOrder) {
      stats.alreadyExists++;
      continue;
    }

    // Try to import this order
    try {
      await importOrder(session);
      stats.imported++;
      console.log(`✅ Imported: ${session.customer_email || session.customer_details?.email || 'Unknown'} - $${((session.amount_total || 0) / 100).toFixed(2)}`);
    } catch (error) {
      stats.failed++;
      const errorMsg = error instanceof Error ? error.message : String(error);
      stats.errors.push(`${session.id}: ${errorMsg}`);
      console.error(`❌ Failed: ${session.id} - ${errorMsg}`);
    }
  }

  return stats;
}

async function importOrder(session: Stripe.Checkout.Session): Promise<void> {
  const customerEmail = session.customer_email || session.customer_details?.email || '';
  const customerName = session.customer_details?.name || session.shipping_details?.name || 'Guest';

  // Get shipping address
  const shipping = session.shipping_details?.address || session.customer_details?.address;

  // Calculate amounts
  const total = (session.amount_total || 0) / 100;
  const subtotal = (session.amount_subtotal || session.amount_total || 0) / 100;

  // Estimate tax and shipping from total (if not available separately)
  // Default: 8.25% tax, $5.95 shipping for orders under $50
  let tax = 0;
  let shippingCost = 0;

  // Try to get line items for more accurate breakdown
  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });

    for (const item of lineItems.data) {
      if (item.description === 'Sales tax (8.25%)' || item.description?.toLowerCase().includes('tax')) {
        tax = (item.amount_total || 0) / 100;
      } else if (item.description === 'Standard shipping' || item.description?.toLowerCase().includes('shipping')) {
        shippingCost = (item.amount_total || 0) / 100;
      }
    }
  } catch {
    // If we can't get line items, estimate
    const productSubtotal = subtotal - tax - shippingCost;
    if (tax === 0) {
      tax = productSubtotal * 0.0825; // 8.25% estimate
    }
    if (shippingCost === 0 && total < 50) {
      shippingCost = 5.95; // Default shipping
    }
  }

  // Recalculate subtotal (product total without tax/shipping)
  const productSubtotal = total - tax - shippingCost;

  // Create the order
  const order = await prisma.order.create({
    data: {
      customerEmail,
      customerName,
      status: 'PENDING', // Can be updated later
      subtotal: productSubtotal > 0 ? productSubtotal : subtotal,
      shipping: shippingCost,
      tax,
      total,
      stripePaymentId: session.payment_intent as string || session.id,
      shippingAddress: shipping ? `${shipping.line1 || ''}${shipping.line2 ? '\n' + shipping.line2 : ''}` : '',
      shippingCity: shipping?.city || '',
      shippingState: shipping?.state || '',
      shippingZip: shipping?.postal_code || '',
      shippingCountry: shipping?.country || 'US',
      createdAt: new Date(session.created * 1000), // Use Stripe's timestamp
    },
  });

  // Create conservation donation record
  const conservationAmount = productSubtotal * 0.10;
  await prisma.conservationDonation.create({
    data: {
      orderId: order.id,
      amount: conservationAmount,
      percentage: 10.0,
      status: 'PLEDGED',
      region: 'South Padre Island',
    },
  });

  // Try to get line items and create order items
  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });

    for (const item of lineItems.data) {
      // Skip tax and shipping line items
      if (item.description?.toLowerCase().includes('tax') ||
          item.description?.toLowerCase().includes('shipping')) {
        continue;
      }

      const itemPrice = (item.amount_total || 0) / 100 / (item.quantity || 1);
      const variantId = item.price?.metadata?.variantId;

      // If we have a variantId from metadata, use it
      if (variantId) {
        // Verify variant exists
        const variant = await prisma.productVariant.findUnique({
          where: { id: variantId },
        });

        if (variant) {
          await prisma.orderItem.create({
            data: {
              orderId: order.id,
              variantId: variantId,
              quantity: item.quantity || 1,
              price: itemPrice,
            },
          });
          continue;
        }
      }

      // Otherwise, try to find variant by product name/description
      const description = item.description || '';
      const nameParts = description.split(' - ');
      const productName = nameParts[0];
      const variantName = nameParts.length > 1 ? nameParts.slice(1).join(' - ') : null;

      // Try to find matching product/variant
      const matchingVariant = await prisma.productVariant.findFirst({
        where: {
          OR: [
            // Match by variant name
            variantName ? { name: { contains: variantName, mode: 'insensitive' } } : {},
            // Match by product name
            { product: { name: { contains: productName, mode: 'insensitive' } } },
          ],
        },
        include: { product: true },
      });

      if (matchingVariant) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            variantId: matchingVariant.id,
            quantity: item.quantity || 1,
            price: itemPrice,
          },
        });
      }
      // If no match found, we still have the order but without item details
    }
  } catch {
    // If we can't get line items, order is still created
    console.warn(`   ⚠️  Could not fetch line items for order, order created without item details`);
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log("           STRIPE ORDER IMPORT TOOL - Shenna's Studio");
  console.log('═══════════════════════════════════════════════════════════');

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('\n❌ Error: STRIPE_SECRET_KEY environment variable is not set');
    console.error('   Please set it and try again.\n');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('\n❌ Error: DATABASE_URL environment variable is not set');
    console.error('   Please set it and try again.\n');
    process.exit(1);
  }

  try {
    const stats = await importStripeOrders();

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('                        SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  📊 Total checkout sessions found: ${stats.totalFound}`);
    console.log(`  ✅ Already in database:           ${stats.alreadyExists}`);
    console.log(`  📥 Newly imported:                ${stats.imported}`);
    console.log(`  ❌ Failed to import:              ${stats.failed}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    if (stats.errors.length > 0) {
      console.log('Errors encountered:');
      stats.errors.forEach(err => console.log(`  - ${err}`));
      console.log('');
    }

    if (stats.imported > 0) {
      console.log('✨ Orders imported successfully! Check your admin panel.\n');
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
