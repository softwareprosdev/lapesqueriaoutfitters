#!/usr/bin/env tsx

/**
 * Diagnostic script to check for orders in the database
 * This helps identify if orders were created but aren't showing in admin panel
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking for orders in database...\n');

  try {
    // Get total order count
    const totalOrders = await prisma.order.count();
    console.log(`📦 Total orders in database: ${totalOrders}`);

    if (totalOrders === 0) {
      console.log('\n❌ No orders found in database!');
      console.log('\nPossible reasons:');
      console.log('1. Webhook secret is incorrect/placeholder');
      console.log('2. Webhook endpoint not configured in Stripe Dashboard');
      console.log('3. Webhooks are failing but orders are being processed in Stripe');
      console.log('4. Application wasn\'t running when purchases were made');
      console.log('\nNext steps:');
      console.log('- Check Stripe Dashboard → Developers → Webhooks for failed delivery attempts');
      console.log('- Verify STRIPE_WEBHOOK_SECRET in .env is your actual secret (not placeholder)');
      console.log('- Check your application logs for webhook errors');
      return;
    }

    // Get recent orders
    console.log('\n📋 Recent orders (last 10):');
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: { name: true }
                }
              }
            }
          }
        }
      }
    });

    recentOrders.forEach((order, index) => {
      console.log(`\n${index + 1}. Order #${order.orderNumber.slice(0, 8)}`);
      console.log(`   Email: ${order.customerEmail}`);
      console.log(`   Name: ${order.customerName}`);
      console.log(`   Total: $${order.total.toFixed(2)}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Created: ${order.createdAt.toLocaleString()}`);
      console.log(`   Items: ${order.items.length}`);
      order.items.forEach(item => {
        console.log(`      - ${item.variant.product.name} x${item.quantity} @ $${item.price}`);
      });
    });

    // Check for orders in last 48 hours
    const twoDaysAgo = new Date();
    twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);

    const recentCount = await prisma.order.count({
      where: {
        createdAt: {
          gte: twoDaysAgo
        }
      }
    });

    console.log(`\n⏱️  Orders in last 48 hours: ${recentCount}`);

    // Check order status breakdown
    const statusBreakdown = await prisma.order.groupBy({
      by: ['status'],
      _count: true
    });

    console.log('\n📊 Orders by status:');
    statusBreakdown.forEach(stat => {
      console.log(`   ${stat.status}: ${stat._count}`);
    });

    // Check for orders with payment intent
    const withPayment = await prisma.order.count({
      where: {
        stripePaymentId: {
          not: null
        }
      }
    });

    const withoutPayment = await prisma.order.count({
      where: {
        stripePaymentId: null
      }
    });

    console.log('\n💳 Payment tracking:');
    console.log(`   With Stripe Payment ID: ${withPayment}`);
    console.log(`   Without Stripe Payment ID: ${withoutPayment}`);

    // Check environment configuration
    console.log('\n⚙️  Configuration check:');
    console.log(`   STRIPE_WEBHOOK_SECRET: ${process.env.STRIPE_WEBHOOK_SECRET ? 
      (process.env.STRIPE_WEBHOOK_SECRET === 'whsec_your_webhook_signing_secret' ? 
        '❌ PLACEHOLDER VALUE - UPDATE THIS!' : 
        '✅ Set (starts with ' + process.env.STRIPE_WEBHOOK_SECRET.slice(0, 10) + '...)'
      ) : 
      '❌ NOT SET'
    }`);

    if (process.env.STRIPE_WEBHOOK_SECRET === 'whsec_your_webhook_signing_secret') {
      console.log('\n⚠️  WARNING: Your STRIPE_WEBHOOK_SECRET is still the placeholder value!');
      console.log('   This means webhooks will FAIL signature verification.');
      console.log('\n   To fix:');
      console.log('   1. Go to Stripe Dashboard → Developers → Webhooks');
      console.log('   2. Click on your webhook endpoint');
      console.log('   3. Click "Reveal" on the Signing secret');
      console.log('   4. Copy the value (starts with whsec_...)');
      console.log('   5. Update STRIPE_WEBHOOK_SECRET in your .env file');
      console.log('   6. Restart your application');
    }

  } catch (error) {
    console.error('\n❌ Error checking orders:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
