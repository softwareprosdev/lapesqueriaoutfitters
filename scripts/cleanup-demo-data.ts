/**
 * Production Cleanup Script
 *
 * Removes all demo/dummy data before going live.
 *
 * Usage:
 *   npx tsx scripts/cleanup-demo-data.ts
 *
 * Or with Coolify:
 *   npx tsx -T scripts/cleanup-demo-data.ts
 *
 * WARNING: This will permanently delete demo data!
 * Make sure to backup your database before running.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Demo reviewer names from seed-content.ts
const DEMO_REVIEWER_NAMES = [
  'Maria G.', 'Carlos R.', 'Ashley M.', 'Jennifer K.', 'Brandon T.',
  'Rachel S.', 'Michael D.', 'Stephanie L.', 'David W.', 'Emily H.',
  'Jessica P.', 'Amanda C.', 'Sarah J.', 'Michelle B.', 'Laura V.',
  'Christina M.', 'Nicole F.', 'Amber R.', 'Heather W.', 'Megan S.',
  'Brittany L.', 'Danielle K.', 'Tiffany H.', 'Samantha G.', 'Courtney P.',
  'Lauren T.', 'Kayla M.', 'Hannah B.', 'Alyssa D.', 'Taylor R.',
  'Alexis W.', 'Elizabeth C.', 'Katherine J.', 'Victoria S.', 'Rebecca N.',
  'Melissa A.', 'Andrea F.', 'Kimberly L.', 'Lisa M.', 'Patricia G.',
  'Sandra H.', 'Nancy K.', 'Betty T.', 'Dorothy W.', 'Margaret S.',
  'Ruth B.', 'Sharon D.', 'Deborah R.', 'Carol M.', 'Helen P.',
  'Anna K.', 'Grace L.', 'Lily H.', 'Sofia T.'
];

async function cleanupDemoData() {
  console.log('🧹 Starting demo data cleanup...\n');

  try {
    // 1. Delete demo reviews
    console.log('📝 Deleting demo reviews...');
    const deletedReviews = await prisma.review.deleteMany({
      where: {
        customerName: { in: DEMO_REVIEWER_NAMES }
      }
    });
    console.log(`   Deleted ${deletedReviews.count} demo reviews\n`);

    // 2. Find demo orders (SHENA-* order numbers from seed-shipping-labels.ts)
    console.log('📦 Finding demo orders...');
    const demoOrders = await prisma.order.findMany({
      where: {
        orderNumber: { startsWith: 'SHENA-' }
      },
      select: { id: true, orderNumber: true }
    });
    console.log(`   Found ${demoOrders.length} demo orders\n`);

    if (demoOrders.length > 0) {
      const demoOrderIds = demoOrders.map(o => o.id);

      // Delete shipping labels for demo orders
      console.log('🏷️  Deleting demo shipping labels...');
      const deletedLabels = await prisma.shippingLabel.deleteMany({
        where: { orderId: { in: demoOrderIds } }
      });
      console.log(`   Deleted ${deletedLabels.count} demo shipping labels\n`);

      // Delete order items for demo orders
      console.log('🛒 Deleting demo order items...');
      const deletedItems = await prisma.orderItem.deleteMany({
        where: { orderId: { in: demoOrderIds } }
      });
      console.log(`   Deleted ${deletedItems.count} demo order items\n`);

      // Delete demo orders
      console.log('📋 Deleting demo orders...');
      const deletedOrders = await prisma.order.deleteMany({
        where: { id: { in: demoOrderIds } }
      });
      console.log(`   Deleted ${deletedOrders.count} demo orders\n`);
    }

    // 3. Delete synthetic analytics data
    console.log('📊 Deleting synthetic analytics data...');
    const deletedAnalytics = await prisma.productAnalytics.deleteMany({});
    console.log(`   Deleted ${deletedAnalytics.count} analytics records\n`);

    // 4. Delete dummy products
    console.log('👕 Finding dummy products...');
    const dummyProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'dummy', mode: 'insensitive' } },
          { sku: { startsWith: 'DUMMY-' } }
        ]
      },
      select: { id: true, name: true }
    });
    console.log(`   Found ${dummyProducts.length} dummy products\n`);

    if (dummyProducts.length > 0) {
      const dummyProductIds = dummyProducts.map(p => p.id);

      // Delete variants first
      console.log('🔢 Deleting dummy product variants...');
      const deletedVariants = await prisma.productVariant.deleteMany({
        where: { productId: { in: dummyProductIds } }
      });
      console.log(`   Deleted ${deletedVariants.count} dummy variants\n`);

      // Delete products
      console.log('🗑️  Deleting dummy products...');
      const deletedProducts = await prisma.product.deleteMany({
        where: { id: { in: dummyProductIds } }
      });
      console.log(`   Deleted ${deletedProducts.count} dummy products\n`);
    }

    // 5. Delete dummy category
    console.log('📁 Deleting dummy category...');
    const deletedCategory = await prisma.category.deleteMany({
      where: { slug: 'dummy-t-shirts' }
    });
    console.log(`   Deleted ${deletedCategory.count} dummy categories\n`);

    // 6. Summary
    console.log('✅ Demo data cleanup completed successfully!\n');

    // Show remaining counts
    console.log('📈 Remaining data summary:');
    const [reviews, orders, products, variants] = await Promise.all([
      prisma.review.count(),
      prisma.order.count(),
      prisma.product.count(),
      prisma.productVariant.count(),
    ]);
    console.log(`   Reviews: ${reviews}`);
    console.log(`   Orders: ${orders}`);
    console.log(`   Products: ${products}`);
    console.log(`   Variants: ${variants}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupDemoData()
  .then(() => {
    console.log('🎉 Your database is now ready for production!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to cleanup demo data:', error);
    process.exit(1);
  });
