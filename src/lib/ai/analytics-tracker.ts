/**
 * Analytics Tracking System for Recommendation Engine
 *
 * Privacy-conscious analytics that tracks user behavior to improve
 * product recommendations without storing personally identifiable information (PII).
 *
 * Features:
 * - Track product views, cart actions, and purchases
 * - Aggregate data for trending and popularity metrics
 * - Build user browsing patterns for personalization
 * - GDPR/privacy compliant (no PII stored)
 *
 * @module analytics-tracker
 */

import { prisma } from '@/lib/db';
import { AnalyticsEventType, Prisma } from '@prisma/client';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Base analytics event structure
 */
export interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  sessionId: string;
  userId?: string;
  productId?: string;
  variantId?: string;
  categoryId?: string;
  metadata?: Record<string, unknown>;
  referrer?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
}

/**
 * Product view event
 */
export interface ProductViewEvent extends Omit<AnalyticsEvent, 'eventType'> {
  productId: string;
  variantId?: string;
  metadata?: {
    price?: number;
    source?: string; // 'search', 'category', 'recommendation', 'direct'
  };
}

/**
 * Add to cart event
 */
export interface AddToCartEvent extends Omit<AnalyticsEvent, 'eventType'> {
  productId: string;
  variantId: string;
  metadata: {
    price: number;
    quantity: number;
  };
}

/**
 * Purchase event
 */
export interface PurchaseEvent extends Omit<AnalyticsEvent, 'eventType'> {
  metadata: {
    orderId: string;
    totalAmount: number;
    itemCount: number;
    products: Array<{
      productId: string;
      variantId: string;
      quantity: number;
      price: number;
    }>;
  };
}

/**
 * User browsing pattern summary
 */
export interface BrowsingPattern {
  userId: string;
  categoryPreferences: Array<{
    categoryId: string;
    score: number; // 0-1, higher = stronger preference
  }>;
  priceRange: {
    avg?: number;
    min?: number;
    max?: number;
  };
  conservationInterests: string[];
  behavior: {
    totalViews: number;
    totalAddToCarts: number;
    totalPurchases: number;
  };
  preferredBrowsingTimes: number[]; // Array of hour indices (0-23)
}

// ============================================================================
// EVENT TRACKING FUNCTIONS
// ============================================================================

/**
 * Track a product view event
 *
 * @param event - Product view event data
 * @example
 * ```ts
 * await trackProductView({
 *   sessionId: 'session-123',
 *   userId: 'user-456',
 *   productId: 'prod-789',
 *   metadata: { price: 29.99, source: 'search' }
 * });
 * ```
 */
export async function trackProductView(
  event: ProductViewEvent
): Promise<void> {
  try {
    // Create event record
    await prisma.analyticsEvent.create({
      data: {
        eventType: AnalyticsEventType.PRODUCT_VIEW,
        sessionId: event.sessionId,
        userId: event.userId,
        productId: event.productId,
        variantId: event.variantId,
        categoryId: event.categoryId,
        metadata: event.metadata as Prisma.JsonObject,
        referrer: event.referrer,
        deviceType: event.deviceType,
      },
    });

    // Update aggregated product analytics (non-blocking)
    updateProductAnalytics(event.productId, 'view').catch(err =>
      console.error('Failed to update product analytics:', err)
    );

    // Update user browsing pattern if user is logged in
    if (event.userId) {
      updateUserBrowsingPattern(event.userId, event).catch(err =>
        console.error('Failed to update user pattern:', err)
      );
    }
  } catch (error) {
    console.error('Failed to track product view:', error);
    // Don't throw - analytics failures shouldn't break user experience
  }
}

/**
 * Track an add-to-cart event
 *
 * @param event - Add to cart event data
 * @example
 * ```ts
 * await trackAddToCart({
 *   sessionId: 'session-123',
 *   userId: 'user-456',
 *   productId: 'prod-789',
 *   variantId: 'var-012',
 *   metadata: { price: 29.99, quantity: 2 }
 * });
 * ```
 */
export async function trackAddToCart(
  event: AddToCartEvent
): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventType: AnalyticsEventType.ADD_TO_CART,
        sessionId: event.sessionId,
        userId: event.userId,
        productId: event.productId,
        variantId: event.variantId,
        categoryId: event.categoryId,
        metadata: event.metadata as Prisma.JsonObject,
        referrer: event.referrer,
        deviceType: event.deviceType,
      },
    });

    // Update aggregated metrics
    updateProductAnalytics(event.productId, 'addToCart').catch(err =>
      console.error('Failed to update product analytics:', err)
    );

    if (event.userId) {
      updateUserBrowsingPattern(event.userId, event).catch(err =>
        console.error('Failed to update user pattern:', err)
      );
    }
  } catch (error) {
    console.error('Failed to track add to cart:', error);
  }
}

/**
 * Track a purchase event
 *
 * @param event - Purchase event data
 * @example
 * ```ts
 * await trackPurchase({
 *   sessionId: 'session-123',
 *   userId: 'user-456',
 *   metadata: {
 *     orderId: 'order-789',
 *     totalAmount: 89.97,
 *     itemCount: 3,
 *     products: [
 *       { productId: 'prod-1', variantId: 'var-1', quantity: 2, price: 29.99 }
 *     ]
 *   }
 * });
 * ```
 */
export async function trackPurchase(
  event: PurchaseEvent
): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventType: AnalyticsEventType.PURCHASE,
        sessionId: event.sessionId,
        userId: event.userId,
        metadata: event.metadata as Prisma.JsonObject,
        referrer: event.referrer,
        deviceType: event.deviceType,
      },
    });

    // Update analytics for each purchased product
    const products = event.metadata.products || [];
    for (const product of products) {
      updateProductAnalytics(product.productId, 'purchase').catch(err =>
        console.error('Failed to update product analytics:', err)
      );
    }

    if (event.userId) {
      updateUserBrowsingPattern(event.userId, event).catch(err =>
        console.error('Failed to update user pattern:', err)
      );
    }
  } catch (error) {
    console.error('Failed to track purchase:', error);
  }
}

/**
 * Track a category view event
 *
 * @param sessionId - Anonymous session identifier
 * @param categoryId - Category being viewed
 * @param userId - Optional user ID if logged in
 */
export async function trackCategoryView(
  sessionId: string,
  categoryId: string,
  userId?: string
): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventType: AnalyticsEventType.CATEGORY_VIEW,
        sessionId,
        userId,
        categoryId,
      },
    });
  } catch (error) {
    console.error('Failed to track category view:', error);
  }
}

/**
 * Track a search event
 *
 * @param sessionId - Anonymous session identifier
 * @param searchQuery - Search query (stored for analysis, not user attribution)
 * @param userId - Optional user ID if logged in
 */
export async function trackSearch(
  sessionId: string,
  searchQuery: string,
  userId?: string
): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventType: AnalyticsEventType.SEARCH,
        sessionId,
        userId,
        metadata: { query: searchQuery } as Prisma.JsonObject,
      },
    });
  } catch (error) {
    console.error('Failed to track search:', error);
  }
}

// ============================================================================
// AGGREGATION FUNCTIONS (Internal - run periodically or on-demand)
// ============================================================================

/**
 * Update aggregated product analytics
 * Internal function called when events are tracked
 *
 * @param productId - Product to update analytics for
 * @param eventType - Type of event ('view', 'addToCart', 'purchase')
 */
async function updateProductAnalytics(
  productId: string,
  eventType: 'view' | 'addToCart' | 'purchase'
): Promise<void> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get or create product analytics record
  let analytics = await prisma.productAnalytics.findUnique({
    where: { productId },
  });

  if (!analytics) {
    analytics = await prisma.productAnalytics.create({
      data: { productId },
    });
  }

  // Count events in time windows
  const counts = await Promise.all([
    // 7 days
    prisma.analyticsEvent.count({
      where: {
        productId,
        eventType: eventTypeToEnum(eventType),
        timestamp: { gte: sevenDaysAgo },
      },
    }),
    // 30 days
    prisma.analyticsEvent.count({
      where: {
        productId,
        eventType: eventTypeToEnum(eventType),
        timestamp: { gte: thirtyDaysAgo },
      },
    }),
  ]);

  // Update the appropriate fields
  const updateData: Prisma.ProductAnalyticsUpdateInput = {};

  if (eventType === 'view') {
    updateData.viewsLast7Days = counts[0];
    updateData.viewsLast30Days = counts[1];
  } else if (eventType === 'addToCart') {
    updateData.addToCartLast7Days = counts[0];
    updateData.addToCartLast30Days = counts[1];
  } else if (eventType === 'purchase') {
    updateData.purchasesLast7Days = counts[0];
    updateData.purchasesLast30Days = counts[1];
  }

  // Calculate conversion rates
  const views = analytics.viewsLast30Days;
  const addToCarts = analytics.addToCartLast30Days;

  if (views > 0) {
    updateData.viewToCartRate = addToCarts / views;
  }

  if (addToCarts > 0) {
    updateData.cartToPurchaseRate = analytics.purchasesLast30Days / addToCarts;
  }

  // Calculate trending score (weighted by recency)
  const viewScore = (counts[0] * 2 + counts[1]) / 3; // Weight recent views more
  const purchaseScore = (counts[0] * 10 + counts[1] * 5); // Purchases worth more
  updateData.trendingScore = Math.min(viewScore + purchaseScore, 100);

  await prisma.productAnalytics.update({
    where: { productId },
    data: updateData,
  });
}

/**
 * Helper to convert event type string to enum
 */
function eventTypeToEnum(type: string): AnalyticsEventType {
  const map: Record<string, AnalyticsEventType> = {
    view: AnalyticsEventType.PRODUCT_VIEW,
    addToCart: AnalyticsEventType.ADD_TO_CART,
    purchase: AnalyticsEventType.PURCHASE,
  };
  return map[type] || AnalyticsEventType.PRODUCT_VIEW;
}

/**
 * Update user browsing pattern based on events
 * Internal function called when events are tracked
 *
 * @param userId - User ID to update pattern for
 * @param event - Event that triggered the update
 */
async function updateUserBrowsingPattern(
  userId: string,
  event: AnalyticsEvent | ProductViewEvent | AddToCartEvent | PurchaseEvent
): Promise<void> {
  // Get or create user pattern
  let pattern = await prisma.userBrowsingPattern.findUnique({
    where: { userId },
  });

  if (!pattern) {
    pattern = await prisma.userBrowsingPattern.create({
      data: { userId },
    });
  }

  // Update based on event type
  const updateData: Prisma.UserBrowsingPatternUpdateInput = {
    lastActivity: new Date(),
  };

  // Track category preferences if product/category is present
  if (event.categoryId) {
    const prefs = (pattern.categoryPreferences as Array<{
      categoryId: string;
      score: number;
    }>) || [];

    const existingPref = prefs.find(p => p.categoryId === event.categoryId);
    if (existingPref) {
      existingPref.score = Math.min(existingPref.score + 0.1, 1.0);
    } else {
      prefs.push({ categoryId: event.categoryId, score: 0.1 });
    }

    updateData.categoryPreferences = prefs as Prisma.JsonArray;
  }

  // Update price preferences if metadata contains price
  if (event.metadata && 'price' in event.metadata) {
    const price = event.metadata.price as number;
    const currentAvg = pattern.avgPriceViewed || price;
    const currentMin = pattern.minPriceViewed || price;
    const currentMax = pattern.maxPriceViewed || price;

    updateData.avgPriceViewed = (currentAvg + price) / 2;
    updateData.minPriceViewed = Math.min(currentMin, price);
    updateData.maxPriceViewed = Math.max(currentMax, price);
  }

  // Increment behavior counters
  if ('eventType' in event && event.eventType === AnalyticsEventType.PRODUCT_VIEW) {
    updateData.totalViews = pattern.totalViews + 1;
  } else if ('eventType' in event && event.eventType === AnalyticsEventType.ADD_TO_CART) {
    updateData.totalAddToCarts = pattern.totalAddToCarts + 1;
  } else if ('eventType' in event && event.eventType === AnalyticsEventType.PURCHASE) {
    updateData.totalPurchases = pattern.totalPurchases + 1;
  }

  // Track browsing time preferences
  const currentHour = new Date().getHours();
  const browsingTimes = (pattern.preferredBrowsingTimes as number[]) || [];
  if (!browsingTimes.includes(currentHour)) {
    browsingTimes.push(currentHour);
    updateData.preferredBrowsingTimes = browsingTimes as Prisma.JsonArray;
  }

  await prisma.userBrowsingPattern.update({
    where: { userId },
    data: updateData,
  });
}

// ============================================================================
// QUERY FUNCTIONS - Get analytics data for recommendations
// ============================================================================

/**
 * Get user browsing pattern for personalization
 *
 * @param userId - User ID to get pattern for
 * @returns User's browsing pattern or null if not found
 *
 * @example
 * ```ts
 * const pattern = await getUserBrowsingPattern('user-123');
 * if (pattern) {
 *   console.log('User prefers categories:', pattern.categoryPreferences);
 *   console.log('Average price viewed:', pattern.priceRange.avg);
 * }
 * ```
 */
export async function getUserBrowsingPattern(
  userId: string
): Promise<BrowsingPattern | null> {
  try {
    const pattern = await prisma.userBrowsingPattern.findUnique({
      where: { userId },
    });

    if (!pattern) return null;

    return {
      userId: pattern.userId,
      categoryPreferences: (pattern.categoryPreferences as Array<{
        categoryId: string;
        score: number;
      }>) || [],
      priceRange: {
        avg: pattern.avgPriceViewed || undefined,
        min: pattern.minPriceViewed || undefined,
        max: pattern.maxPriceViewed || undefined,
      },
      conservationInterests: (pattern.conservationInterests as string[]) || [],
      behavior: {
        totalViews: pattern.totalViews,
        totalAddToCarts: pattern.totalAddToCarts,
        totalPurchases: pattern.totalPurchases,
      },
      preferredBrowsingTimes: (pattern.preferredBrowsingTimes as number[]) || [],
    };
  } catch (error) {
    console.error('Failed to get user browsing pattern:', error);
    return null;
  }
}

/**
 * Get trending products based on analytics
 *
 * @param limit - Maximum number of products to return
 * @returns Array of product IDs sorted by trending score
 *
 * @example
 * ```ts
 * const trending = await getTrendingProductIds(10);
 * // Use these IDs to fetch full product details
 * ```
 */
export async function getTrendingProductIds(
  limit: number = 10
): Promise<string[]> {
  try {
    const analytics = await prisma.productAnalytics.findMany({
      where: {
        trendingScore: { gt: 0 },
      },
      orderBy: {
        trendingScore: 'desc',
      },
      take: limit,
      select: {
        productId: true,
      },
    });

    return analytics.map(a => a.productId);
  } catch (error) {
    console.error('Failed to get trending products:', error);
    return [];
  }
}

/**
 * Get product analytics for a specific product
 *
 * @param productId - Product ID to get analytics for
 * @returns Product analytics or null if not found
 */
export async function getProductAnalytics(productId: string) {
  try {
    return await prisma.productAnalytics.findUnique({
      where: { productId },
    });
  } catch (error) {
    console.error('Failed to get product analytics:', error);
    return null;
  }
}

/**
 * Get most viewed products in a time period
 *
 * @param days - Number of days to look back (7 or 30)
 * @param limit - Maximum number of products to return
 * @returns Array of product IDs sorted by view count
 */
export async function getMostViewedProducts(
  days: 7 | 30 = 7,
  limit: number = 10
): Promise<string[]> {
  try {
    const field = days === 7 ? 'viewsLast7Days' : 'viewsLast30Days';

    const analytics = await prisma.productAnalytics.findMany({
      where: {
        [field]: { gt: 0 },
      },
      orderBy: {
        [field]: 'desc',
      },
      take: limit,
      select: {
        productId: true,
      },
    });

    return analytics.map(a => a.productId);
  } catch (error) {
    console.error('Failed to get most viewed products:', error);
    return [];
  }
}

/**
 * Get products with highest conversion rates
 *
 * @param limit - Maximum number of products to return
 * @returns Array of product IDs sorted by conversion rate
 */
export async function getHighConversionProducts(
  limit: number = 10
): Promise<string[]> {
  try {
    const analytics = await prisma.productAnalytics.findMany({
      where: {
        viewToCartRate: { gt: 0 },
      },
      orderBy: {
        viewToCartRate: 'desc',
      },
      take: limit,
      select: {
        productId: true,
      },
    });

    return analytics.map(a => a.productId);
  } catch (error) {
    console.error('Failed to get high conversion products:', error);
    return [];
  }
}

// ============================================================================
// CLEANUP & MAINTENANCE
// ============================================================================

/**
 * Clean up old analytics events (GDPR compliance)
 * Should be run periodically (e.g., daily cron job)
 *
 * @param daysToKeep - Number of days of events to keep (default: 90)
 * @returns Number of events deleted
 */
export async function cleanupOldEvents(
  daysToKeep: number = 90
): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.analyticsEvent.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`Cleaned up ${result.count} old analytics events`);
    return result.count;
  } catch (error) {
    console.error('Failed to cleanup old events:', error);
    return 0;
  }
}

/**
 * Recalculate all product analytics
 * Use for batch updates or after data changes
 */
export async function recalculateProductAnalytics(): Promise<void> {
  try {
    const products = await prisma.product.findMany({
      select: { id: true },
    });

    for (const product of products) {
      await updateProductAnalytics(product.id, 'view');
      await updateProductAnalytics(product.id, 'addToCart');
      await updateProductAnalytics(product.id, 'purchase');
    }

    console.log(`Recalculated analytics for ${products.length} products`);
  } catch (error) {
    console.error('Failed to recalculate product analytics:', error);
  }
}
