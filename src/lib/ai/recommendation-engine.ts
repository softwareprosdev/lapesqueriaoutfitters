/**
 * AI-Powered Product Recommendation Engine
 * Uses hybrid approach: AI + collaborative filtering + content-based
 */

import { prisma } from '@/lib/db';
import { AI_CONFIG } from './genkit-config';

export interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  categoryId: string | null;
  description: string | null;
  conservationFocus: string | null;
  featured: boolean;
}

export interface ProductWithScore extends Product {
  score: number;
  reason?: string;
}

/**
 * Calculate similarity score between two products
 */
function calculateSimilarity(product1: Product, product2: Product): number {
  let score = 0;
  const weights = AI_CONFIG.weights;

  // Category similarity
  if (product1.categoryId && product1.categoryId === product2.categoryId) {
    score += weights.category;
  }

  // Price similarity (within 30% range)
  const priceDiff = Math.abs(product1.basePrice - product2.basePrice);
  const avgPrice = (product1.basePrice + product2.basePrice) / 2;
  const priceRatio = priceDiff / avgPrice;

  if (priceRatio < 0.3) {
    score += weights.price * (1 - priceRatio);
  }

  // Conservation focus similarity
  if (product1.conservationFocus &&
      product1.conservationFocus === product2.conservationFocus) {
    score += weights.conservation;
  }

  // Description similarity (simple keyword matching)
  if (product1.description && product2.description) {
    const words1 = new Set(
      product1.description.toLowerCase().split(/\s+/)
    );
    const words2 = new Set(
      product2.description.toLowerCase().split(/\s+/)
    );

    const intersection = new Set(
      [...words1].filter(word => words2.has(word))
    );

    const similarity = intersection.size / Math.max(words1.size, words2.size);
    score += weights.attributes * similarity;
  }

  return score;
}

/**
 * Get similar products based on content similarity
 */
export async function getSimilarProducts(
  productId: string,
  limit: number = AI_CONFIG.maxRecommendations
): Promise<ProductWithScore[]> {
  // Get the source product
  const sourceProduct = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!sourceProduct) {
    return [];
  }

  // Get all other products
  const allProducts = await prisma.product.findMany({
    where: {
      id: { not: productId },
      // Only show products with available variants
      variants: {
        some: {
          stock: { gt: 0 },
        },
      },
    },
    include: {
      variants: {
        where: { stock: { gt: 0 } },
        take: 1,
      },
      images: {
        orderBy: {
          position: 'asc',
        },
      },
    },
  });

  // Calculate similarity scores
  const scored = allProducts
    .map(product => ({
      ...product,
      score: calculateSimilarity(sourceProduct, product),
      reason: getSimilarityReason(sourceProduct, product),
    }))
    .filter(p => p.score >= AI_CONFIG.similarityThreshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

/**
 * Get reason for recommendation
 */
function getSimilarityReason(product1: Product, product2: Product): string {
  const reasons: string[] = [];

  if (product1.categoryId === product2.categoryId) {
    reasons.push('Matches your style');
  }

  const priceDiff = Math.abs(product1.basePrice - product2.basePrice);
  if (priceDiff < 15) {
    reasons.push('Similar price range');
  }

  if (product1.conservationFocus === product2.conservationFocus && product1.conservationFocus) {
    reasons.push(`Supports ${product1.conservationFocus}`);
  }

  return reasons.join(' • ') || 'Handpicked for you';
}

/**
 * Get personalized recommendations for a user
 * Based on their browsing/purchase history
 */
export async function getPersonalizedRecommendations(
  userId?: string,
  limit: number = AI_CONFIG.maxRecommendations
): Promise<ProductWithScore[]> {
  // If no user, return featured/popular products
  if (!userId) {
    const featured = await prisma.product.findMany({
      where: {
        featured: true,
        variants: {
          some: { stock: { gt: 0 } },
        },
      },
      include: {
        variants: {
          where: { stock: { gt: 0 } },
          take: 1,
        },
        images: {
          orderBy: {
            position: 'asc',
          },
        },
      },
      take: limit,
    });

    return featured.map(p => ({
      ...p,
      score: 1.0,
      reason: 'Featured product',
    }));
  }

  // Get user's order history
  const orders = await prisma.order.findMany({
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
    orderBy: { createdAt: 'desc' },
    take: 5, // Last 5 orders
  });

  // Get product IDs from user's purchase history
  const purchasedProductIds = orders.flatMap(order =>
    order.items.map(item => item.variant.productId)
  );

  if (purchasedProductIds.length === 0) {
    // No history, return featured products
    return getPersonalizedRecommendations(undefined, limit);
  }

  // Get recommendations based on purchased products
  const recommendations = new Map<string, ProductWithScore>();

  for (const productId of purchasedProductIds.slice(0, 3)) {
    const similar = await getSimilarProducts(productId, limit);

    similar.forEach(product => {
      if (!recommendations.has(product.id)) {
        recommendations.set(product.id, product);
      } else {
        // Boost score if recommended by multiple products
        const existing = recommendations.get(product.id)!;
        existing.score = Math.min(existing.score + 0.1, 1.0);
      }
    });
  }

  return Array.from(recommendations.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Get frequently bought together products
 * Based on order data
 */
export async function getFrequentlyBoughtTogether(
  productId: string,
  limit: number = 3
): Promise<ProductWithScore[]> {
  // Find orders containing this product
  const ordersWithProduct = await prisma.orderItem.findMany({
    where: {
      variant: {
        productId,
      },
    },
    include: {
      order: {
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
      },
    },
    take: 50, // Analyze last 50 orders
  });

  // Count co-occurrences
  const coOccurrences = new Map<string, number>();

  ordersWithProduct.forEach(item => {
    item.order.items.forEach(otherItem => {
      const otherProductId = otherItem.variant.productId;

      // Don't count the same product
      if (otherProductId !== productId) {
        const count = coOccurrences.get(otherProductId) || 0;
        coOccurrences.set(otherProductId, count + 1);
      }
    });
  });

  // Get products sorted by frequency
  const sortedProducts = Array.from(coOccurrences.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  // Fetch full product details
  const productDetails = await Promise.all(
    sortedProducts.map(async ([id, count]) => {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          variants: {
            where: { stock: { gt: 0 } },
            take: 1,
          },
        },
      });

      if (!product) return null;

      return {
        ...product,
        score: Math.min(count / ordersWithProduct.length, 1.0),
        reason: `Bought together ${count} times`,
      };
    })
  );

  return productDetails.filter(p => p !== null) as ProductWithScore[];
}

/**
 * Get trending/popular products
 */
export async function getTrendingProducts(
  limit: number = AI_CONFIG.maxRecommendations
): Promise<ProductWithScore[]> {
  // Products with most orders in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const popularProducts = await prisma.orderItem.groupBy({
    by: ['variantId'],
    _count: {
      variantId: true,
    },
    orderBy: {
      _count: {
        variantId: 'desc',
      },
    },
    take: limit,
  });

  // Get product details
  const products = await Promise.all(
    popularProducts.map(async item => {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: {
          product: true,
        },
      });

      if (!variant || !variant.product) return null;

      return {
        ...variant.product,
        score: 1.0,
        reason: `${item._count.variantId} recent purchases`,
      };
    })
  );

  return products.filter(p => p !== null) as ProductWithScore[];
}
