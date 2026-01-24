/**
 * Analytics Integration Examples
 *
 * This file demonstrates how to integrate the analytics tracking system
 * with the existing recommendation engine to improve recommendations.
 *
 * NOTE: This is an example file showing usage patterns.
 * Actual integration should be done in your components and API routes.
 */

import {
  getSimilarProducts,
  getPersonalizedRecommendations,
  type ProductWithScore,
} from './recommendation-engine';
import {
  getUserBrowsingPattern,
  getTrendingProductIds,
  getMostViewedProducts,
  getHighConversionProducts,
  getProductAnalytics,
} from './analytics-tracker';
import { prisma } from '@/lib/prisma';

// ============================================================================
// ENHANCED RECOMMENDATIONS WITH ANALYTICS
// ============================================================================

/**
 * Get personalized recommendations enhanced with analytics data
 *
 * Combines the existing recommendation engine with analytics insights
 * to provide better recommendations based on real user behavior.
 */
export async function getAnalyticsEnhancedRecommendations(
  userId?: string,
  limit: number = 6
): Promise<ProductWithScore[]> {
  // Get base recommendations from existing engine
  const baseRecommendations = await getPersonalizedRecommendations(
    userId,
    limit * 2 // Get more to allow for filtering
  );

  // If we have a user, enhance with their browsing pattern
  if (userId) {
    const pattern = await getUserBrowsingPattern(userId);

    if (pattern) {
      // Boost products in preferred categories
      const enhanced = baseRecommendations.map(product => {
        let boost = 0;

        // Category preference boost
        const categoryPref = pattern.categoryPreferences.find(
          p => p.categoryId === product.categoryId
        );
        if (categoryPref) {
          boost += categoryPref.score * 0.3; // Up to 30% boost
        }

        // Price preference boost (prefer products in user's price range)
        if (pattern.priceRange.avg) {
          const priceDiff = Math.abs(product.basePrice - pattern.priceRange.avg);
          const priceBoost = Math.max(0, 0.2 - (priceDiff / pattern.priceRange.avg));
          boost += priceBoost;
        }

        // Conservation interest boost
        if (
          product.conservationFocus &&
          pattern.conservationInterests.includes(product.conservationFocus)
        ) {
          boost += 0.2;
        }

        return {
          ...product,
          score: Math.min(product.score + boost, 1.0),
        };
      });

      // Re-sort by new scores
      return enhanced.sort((a, b) => b.score - a.score).slice(0, limit);
    }
  }

  return baseRecommendations.slice(0, limit);
}

/**
 * Get trending products with analytics backing
 *
 * Uses real analytics data instead of just featured products
 */
export async function getTrendingProductsWithAnalytics(
  limit: number = 10
): Promise<ProductWithScore[]> {
  const trendingIds = await getTrendingProductIds(limit);

  const products = await prisma.product.findMany({
    where: {
      id: { in: trendingIds },
      variants: {
        some: { stock: { gt: 0 } },
      },
    },
    include: {
      variants: {
        where: { stock: { gt: 0 } },
        take: 1,
      },
    },
  });

  // Get analytics for each product
  const productsWithAnalytics = await Promise.all(
    products.map(async product => {
      const analytics = await getProductAnalytics(product.id);

      return {
        ...product,
        score: analytics ? analytics.trendingScore / 100 : 0.5,
        reason: analytics
          ? `${analytics.viewsLast7Days} views, ${analytics.purchasesLast7Days} sales this week`
          : 'Trending product',
      };
    })
  );

  return productsWithAnalytics.sort((a, b) => b.score - a.score);
}

/**
 * Get "You Might Also Like" recommendations for cart
 *
 * Enhanced with analytics data about what products convert well together
 */
export async function getCartRecommendations(
  cartProductIds: string[],
  limit: number = 4
): Promise<ProductWithScore[]> {
  if (cartProductIds.length === 0) {
    // If cart is empty, show high-conversion products
    const highConversionIds = await getHighConversionProducts(limit);

    const products = await prisma.product.findMany({
      where: {
        id: { in: highConversionIds },
        variants: { some: { stock: { gt: 0 } } },
      },
      include: {
        variants: {
          where: { stock: { gt: 0 } },
          take: 1,
        },
      },
    });

    return products.map(p => ({
      ...p,
      score: 0.9,
      reason: 'Popular choice - High conversion rate',
    }));
  }

  // Get similar products for items in cart
  const recommendations = new Map<string, ProductWithScore>();

  for (const productId of cartProductIds) {
    const similar = await getSimilarProducts(productId, limit);

    similar.forEach(product => {
      if (
        !recommendations.has(product.id) &&
        !cartProductIds.includes(product.id)
      ) {
        recommendations.set(product.id, product);
      } else if (!cartProductIds.includes(product.id)) {
        // Boost score if recommended by multiple cart items
        const existing = recommendations.get(product.id)!;
        existing.score = Math.min(existing.score + 0.15, 1.0);
        existing.reason = 'Pairs well with multiple items in your cart';
      }
    });
  }

  // Enhance with analytics data
  const enhanced = await Promise.all(
    Array.from(recommendations.values()).map(async product => {
      const analytics = await getProductAnalytics(product.id);

      if (analytics && analytics.cartToPurchaseRate > 0.5) {
        // High cart-to-purchase rate = likely to convert
        return {
          ...product,
          score: product.score + 0.1,
          reason: product.reason + ' • Customers who add this often buy it',
        };
      }

      return product;
    })
  );

  return enhanced.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Get new arrival recommendations for a user
 *
 * Shows new products that match user's preferences
 */
export async function getNewArrivalsForUser(
  userId?: string,
  limit: number = 6
): Promise<ProductWithScore[]> {
  // Get products from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newProducts = await prisma.product.findMany({
    where: {
      createdAt: { gte: thirtyDaysAgo },
      variants: { some: { stock: { gt: 0 } } },
    },
    include: {
      variants: {
        where: { stock: { gt: 0 } },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit * 2,
  });

  // If user exists, personalize new arrivals
  if (userId) {
    const pattern = await getUserBrowsingPattern(userId);

    if (pattern && pattern.categoryPreferences.length > 0) {
      // Prioritize new products in preferred categories
      const scored = newProducts.map(product => {
        const categoryPref = pattern.categoryPreferences.find(
          p => p.categoryId === product.categoryId
        );

        return {
          ...product,
          score: categoryPref ? categoryPref.score : 0.3,
          reason: categoryPref
            ? 'New arrival in your favorite category'
            : 'Just added',
        };
      });

      return scored.sort((a, b) => b.score - a.score).slice(0, limit);
    }
  }

  // Default: return newest first
  return newProducts.slice(0, limit).map(p => ({
    ...p,
    score: 0.8,
    reason: 'Just added',
  }));
}

/**
 * Get "Popular This Week" products
 *
 * Based on real view and purchase data from the last 7 days
 */
export async function getPopularThisWeek(
  limit: number = 8
): Promise<ProductWithScore[]> {
  const popularIds = await getMostViewedProducts(7, limit);

  const products = await prisma.product.findMany({
    where: {
      id: { in: popularIds },
      variants: { some: { stock: { gt: 0 } } },
    },
    include: {
      variants: {
        where: { stock: { gt: 0 } },
        take: 1,
      },
    },
  });

  // Enhance with analytics
  const enhanced = await Promise.all(
    products.map(async product => {
      const analytics = await getProductAnalytics(product.id);

      return {
        ...product,
        score: analytics ? analytics.viewsLast7Days / 100 : 0.5,
        reason: analytics
          ? `${analytics.viewsLast7Days} people viewed this week`
          : 'Popular this week',
      };
    })
  );

  return enhanced.sort((a, b) => b.score - a.score);
}

/**
 * Get smart homepage recommendations
 *
 * Mixes trending, personalized, and high-conversion products
 * for an optimal homepage experience
 */
export async function getHomepageRecommendations(
  userId?: string
): Promise<{
  personalized: ProductWithScore[];
  trending: ProductWithScore[];
  popular: ProductWithScore[];
  highConversion: ProductWithScore[];
}> {
  const [personalized, trending, popular, highConversionIds] = await Promise.all([
    getAnalyticsEnhancedRecommendations(userId, 6),
    getTrendingProductsWithAnalytics(6),
    getPopularThisWeek(6),
    getHighConversionProducts(6),
  ]);

  // Get full product data for high conversion
  const highConversion = await prisma.product.findMany({
    where: {
      id: { in: highConversionIds },
      variants: { some: { stock: { gt: 0 } } },
    },
    include: {
      variants: {
        where: { stock: { gt: 0 } },
        take: 1,
      },
    },
  });

  return {
    personalized: userId ? personalized : [],
    trending,
    popular,
    highConversion: highConversion.map(p => ({
      ...p,
      score: 0.95,
      reason: 'Customers love this',
    })),
  };
}

// ============================================================================
// ANALYTICS-BASED PRODUCT SORTING
// ============================================================================

/**
 * Sort products by analytics performance
 *
 * Useful for category pages and search results
 */
export async function sortProductsByPerformance(
  products: Array<{ id: string; [key: string]: unknown }>,
  sortBy: 'trending' | 'popular' | 'conversion' = 'trending'
): Promise<typeof products> {
  const productsWithAnalytics = await Promise.all(
    products.map(async product => {
      const analytics = await getProductAnalytics(product.id);

      let score = 0;
      if (analytics) {
        switch (sortBy) {
          case 'trending':
            score = analytics.trendingScore;
            break;
          case 'popular':
            score = analytics.viewsLast7Days;
            break;
          case 'conversion':
            score = analytics.viewToCartRate * 100;
            break;
        }
      }

      return { ...product, _analyticsScore: score };
    })
  );

  return productsWithAnalytics.sort((a, b) => b._analyticsScore - a._analyticsScore);
}

// ============================================================================
// USAGE IN API ROUTES
// ============================================================================

/**
 * Example API route handler for personalized recommendations
 *
 * GET /api/recommendations/personalized
 */
export async function GET_PersonalizedRecommendations(userId?: string) {
  const recommendations = await getAnalyticsEnhancedRecommendations(userId, 6);
  return { recommendations };
}

/**
 * Example API route handler for homepage
 *
 * GET /api/recommendations/homepage
 */
export async function GET_HomepageRecommendations(userId?: string) {
  const sections = await getHomepageRecommendations(userId);
  return sections;
}

/**
 * Example API route handler for cart upsells
 *
 * GET /api/recommendations/cart?productIds=id1,id2,id3
 */
export async function GET_CartRecommendations(productIds: string[]) {
  const recommendations = await getCartRecommendations(productIds, 4);
  return { recommendations };
}
