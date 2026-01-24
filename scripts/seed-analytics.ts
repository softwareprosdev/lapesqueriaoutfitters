import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Add explicit types
interface SeedProduct {
  id: string;
  name: string;
  basePrice: number;
}

interface SeedOrder {
  id: string;
  createdAt: Date;
  total: number;
  status: string;
}

async function main() {
  console.log('🌱 Seeding analytics data...');

  // Get products
  const products = await prisma.product.findMany({
    select: { id: true, name: true, basePrice: true },
    take: 20
  }) as SeedProduct[];

  if (products.length === 0) {
    console.log('❌ No products found. Please seed products first.');
    return;
  }

  // Get users
  const users = await prisma.user.findMany({
    select: { id: true },
    take: 10
  });

  // 1. Seed Product Analytics
  console.log('📊 Seeding product analytics...');
  for (const product of products) {
    const views7 = Math.floor(Math.random() * 100) + 20;
    const views30 = views7 * 4 + Math.floor(Math.random() * 50);
    const carts7 = Math.floor(views7 * 0.15);
    const carts30 = Math.floor(views30 * 0.15);
    const purchases7 = Math.floor(carts7 * 0.4);
    const purchases30 = Math.floor(carts30 * 0.4);

    // Calculate trending score based on recent views and conversion
    const recentActivity = views7 + (carts7 * 2) + (purchases7 * 5);
    const trendingScore = Math.min(100, Math.floor(recentActivity / 2));

    await prisma.productAnalytics.upsert({
      where: { productId: product.id },
      update: {
        viewsLast7Days: views7,
        viewsLast30Days: views30,
        addToCartLast7Days: carts7,
        addToCartLast30Days: carts30,
        purchasesLast7Days: purchases7,
        purchasesLast30Days: purchases30,
        trendingScore: trendingScore,
        viewToCartRate: views30 > 0 ? carts30 / views30 : 0,
        cartToPurchaseRate: carts30 > 0 ? purchases30 / carts30 : 0,
      },
      create: {
        productId: product.id,
        viewsLast7Days: views7,
        viewsLast30Days: views30,
        addToCartLast7Days: carts7,
        addToCartLast30Days: carts30,
        purchasesLast7Days: purchases7,
        purchasesLast30Days: purchases30,
        trendingScore: trendingScore,
        viewToCartRate: views30 > 0 ? carts30 / views30 : 0,
        cartToPurchaseRate: carts30 > 0 ? purchases30 / carts30 : 0,
      }
    });
  }

  // 2. Seed Analytics Events (Historical)
  console.log('🕰️ Seeding historical events...');
  const eventTypes = ['PRODUCT_VIEW', 'ADD_TO_CART', 'PURCHASE', 'CATEGORY_VIEW'];
  const now = new Date();
  
  // Create 200 random events over the last 30 days
  for (let i = 0; i < 200; i++) {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const randomUser = users.length > 0 ? users[Math.floor(Math.random() * users.length)] : null;
    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)] as 'PRODUCT_VIEW' | 'ADD_TO_CART' | 'PURCHASE' | 'CATEGORY_VIEW';
    const daysAgo = Math.floor(Math.random() * 30);
    const eventDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

    await prisma.analyticsEvent.create({
      data: {
        eventType: randomType,
        timestamp: eventDate,
        sessionId: `session_${Math.random().toString(36).substring(7)}`,
        userId: randomUser?.id,
        productId: randomProduct.id,
        metadata: {
          price: randomProduct.basePrice,
          source: 'seed_script'
        }
      }
    });
  }

  // 3. Seed Conservation Impact
  console.log('🐢 Seeding conservation impact...');
  const periods = ['daily', 'weekly', 'monthly', 'yearly'];
  
  for (const period of periods) {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['DELIVERED', 'SHIPPED', 'PROCESSING'] }
      },
      select: { id: true, createdAt: true, total: true, status: true }
    }) as SeedOrder[];

    const totalDonations = orders.reduce((sum, order) => sum + (order.total * 0.1), 0);
    const orderCount = orders.length;

    await prisma.conservationImpact.create({
      data: {
        periodStart: new Date(now.getFullYear(), 0, 1),
        periodEnd: now,
        periodType: period,
        totalDonations,
        orderCount,
        turtlesSaved: Math.floor(totalDonations / 50), // Approx $50 per turtle
        oceanCleaned: totalDonations * 2, // 2 sqm per dollar
        coralRestored: totalDonations * 0.5, // 0.5 sqm per dollar
        focusBreakdown: {
          "Sea Turtles": Math.floor(totalDonations * 0.6),
          "Ocean Cleanup": Math.floor(totalDonations * 0.2),
          "Coral Reefs": Math.floor(totalDonations * 0.2)
        }
      }
    });
  }

  console.log('✅ Analytics seeding completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });