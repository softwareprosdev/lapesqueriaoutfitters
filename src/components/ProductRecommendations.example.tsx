/**
 * ProductRecommendations Component - Usage Examples
 *
 * This file demonstrates how to use the ProductRecommendations component
 * in various scenarios throughout the application.
 */

import ProductRecommendations from '@/components/ProductRecommendations';

// ============================================================================
// Example 1: Similar Products on Product Detail Page
// ============================================================================
export function ProductDetailWithRecommendations({ productId }: { productId: string }) {
  return (
    <div>
      {/* Your product detail content here */}

      {/* Similar products based on category, price, conservation focus */}
      <ProductRecommendations
        productId={productId}
        limit={4}
        recommendationType="similar"
        title="You May Also Like"
        showReason={true}
        className="bg-gray-50"
      />
    </div>
  );
}

// ============================================================================
// Example 2: Personalized Recommendations on Homepage
// ============================================================================
export function HomepageWithRecommendations() {
  return (
    <div>
      {/* Hero section, featured products, etc. */}

      {/* Personalized recommendations based on user history */}
      <ProductRecommendations
        limit={6}
        recommendationType="personalized"
        title="Recommended for You"
        showReason={false}
        className="bg-white"
      />
    </div>
  );
}

// ============================================================================
// Example 3: Trending Products Section
// ============================================================================
export function TrendingSection() {
  return (
    <ProductRecommendations
      limit={8}
      recommendationType="trending"
      title="Trending Ocean Bracelets"
      showReason={false}
    />
  );
}

// ============================================================================
// Example 4: Frequently Bought Together in Cart
// ============================================================================
export function CartPageWithRecommendations({ productId }: { productId?: string }) {
  return (
    <div>
      {/* Cart items */}

      {/* Show frequently bought together if there's at least one item */}
      {productId && (
        <ProductRecommendations
          productId={productId}
          limit={3}
          recommendationType="frequently-bought"
          title="Customers Also Bought"
          showReason={true}
          className="border-t pt-8 mt-8"
        />
      )}
    </div>
  );
}

// ============================================================================
// Example 5: Minimal Similar Products (No Title, Auto-hide)
// ============================================================================
export function MinimalRecommendations({ productId }: { productId: string }) {
  return (
    <ProductRecommendations
      productId={productId}
      limit={4}
      recommendationType="similar"
      // Component automatically hides if no recommendations found
    />
  );
}

// ============================================================================
// API Endpoints Used
// ============================================================================
/**
 * The component fetches from these endpoints:
 *
 * - /api/recommendations/similar?productId=xxx&limit=4
 * - /api/recommendations/personalized?limit=6
 * - /api/recommendations/trending?limit=8
 * - /api/recommendations/frequently-bought?productId=xxx&limit=3
 *
 * Each endpoint returns:
 * {
 *   success: true,
 *   recommendations: Product[],
 *   count: number
 * }
 */

// ============================================================================
// Props Reference
// ============================================================================
/**
 * @prop productId - Optional. Required for 'similar' and 'frequently-bought' types
 * @prop limit - Number of recommendations to show (default: 4)
 * @prop recommendationType - Type of recommendations:
 *   - 'similar': Products similar to the given productId
 *   - 'personalized': Based on user browsing/purchase history
 *   - 'trending': Popular products based on recent sales
 *   - 'frequently-bought': Products bought together with given productId
 * @prop title - Custom section title (defaults based on recommendationType)
 * @prop showReason - Show reason for recommendation (e.g., "Similar category")
 * @prop className - Additional CSS classes for the section wrapper
 */

// ============================================================================
// Features
// ============================================================================
/**
 * Responsive grid layout (2 cols mobile, 3-4 cols desktop)
 * Ocean theme styling with teal/cyan colors
 * Loading state with skeleton screens
 * Error handling with graceful fallback
 * Empty state (component auto-hides)
 * Next.js Image optimization with proper sizes
 * Links to product detail pages using slug
 * Add to Cart functionality integrated
 * Stock level indicators
 * Conservation badge display
 * Featured product badges
 * Hover effects and animations
 * TypeScript with proper type safety
 */
