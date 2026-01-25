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
      console.log('1. Clover integration not configured');
      console.log('2. Webhooks not reaching the server');
      console.log('3. Orders being processed in Clover POS but not syncing');
      console.log('4. Application wasn\'t running when purchases were made');
      console.log('\nNext steps:');
      console.log('- Check Clover Developer Dashboard for webhook health');
      console.log('- Verify CLOVER_MERCHANT_ID and CLOVER_ACCESS_TOKEN in .env');
      console.log('- Check your application logs for Clover sync errors');
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
        cloverPaymentId: {
          not: null
        }
      }
    });

    const withoutPayment = await prisma.order.count({
      where: {
        cloverPaymentId: null
      }
    });

    console.log('\n💳 Payment tracking:');
    console.log(`   With Clover Payment ID: ${withPayment}`);
    console.log(`   Without Clover Payment ID: ${withoutPayment}`);

    // Check environment configuration
    console.log('\n⚙️  Configuration check:');
    console.log(`   CLOVER_MERCHANT_ID: ${process.env.CLOVER_MERCHANT_ID ? '✅ Set' : '❌ NOT SET'}`);
    console.log(`   CLOVER_ACCESS_TOKEN: ${process.env.CLOVER_ACCESS_TOKEN ? '✅ Set' : '❌ NOT SET'}`);

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
