/**
 * Analytics Client for Frontend
 *
 * Browser-side helper utilities for tracking analytics events.
 * Automatically manages session IDs and provides simple tracking functions.
 *
 * @module analytics-client
 */

'use client';

import type { AnalyticsTrackingRequest } from '@/types';

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Get or create an anonymous session ID
 * Stored in sessionStorage to persist across page reloads but not browser restarts
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server-side';

  const SESSION_KEY = 'analytics_session_id';
  let sessionId = sessionStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
}

// ============================================================================
// TRACKING FUNCTIONS
// ============================================================================

/**
 * Send analytics event to server
 * Internal function used by all tracking methods
 */
async function sendEvent(
  eventType: AnalyticsTrackingRequest['eventType'],
  data?: AnalyticsTrackingRequest['data']
): Promise<void> {
  try {
    const payload: AnalyticsTrackingRequest = {
      eventType,
      sessionId: getSessionId(),
      data,
    };

    // Use sendBeacon for critical events (purchase, add to cart)
    // to ensure they're sent even if user navigates away
    const useSendBeacon = eventType === 'PURCHASE' || eventType === 'ADD_TO_CART';

    if (useSendBeacon && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], {
        type: 'application/json',
      });
      navigator.sendBeacon('/api/analytics/track', blob);
    } else {
      // Use fetch for non-critical events
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        // Don't wait for response to avoid blocking UI
        keepalive: true,
      }).catch(err => {
        // Silently fail - analytics shouldn't break user experience
        if (process.env.NODE_ENV === 'development') {
          console.warn('Analytics tracking failed:', err);
        }
      });
    }
  } catch (error) {
    // Silently fail in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Analytics error:', error);
    }
  }
}

/**
 * Track a product view
 *
 * @param productId - Product being viewed
 * @param options - Additional tracking data
 *
 * @example
 * ```tsx
 * import { trackProductView } from '@/lib/ai/analytics-client';
 *
 * function ProductPage({ product }) {
 *   useEffect(() => {
 *     trackProductView(product.id, {
 *       price: product.basePrice,
 *       categoryId: product.categoryId,
 *       source: 'search'
 *     });
 *   }, [product.id]);
 * }
 * ```
 */
export function trackProductView(
  productId: string,
  options?: {
    variantId?: string;
    categoryId?: string;
    price?: number;
    source?: 'search' | 'category' | 'recommendation' | 'direct' | 'featured';
  }
): void {
  sendEvent('PRODUCT_VIEW', {
    productId,
    ...options,
  });
}

/**
 * Track an add-to-cart event
 *
 * @param productId - Product being added
 * @param variantId - Variant being added
 * @param quantity - Quantity being added
 * @param price - Price per item
 *
 * @example
 * ```tsx
 * import { trackAddToCart } from '@/lib/ai/analytics-client';
 *
 * function AddToCartButton({ product, variant, quantity }) {
 *   const handleClick = () => {
 *     trackAddToCart(product.id, variant.id, quantity, variant.price);
 *     // ... add to cart logic
 *   };
 * }
 * ```
 */
export function trackAddToCart(
  productId: string,
  variantId: string,
  quantity: number,
  price: number,
  options?: {
    categoryId?: string;
  }
): void {
  sendEvent('ADD_TO_CART', {
    productId,
    variantId,
    quantity,
    price,
    ...options,
  });
}

/**
 * Track a purchase/order completion
 *
 * @param orderId - Order ID that was created
 * @param totalAmount - Total order amount
 * @param products - Products that were purchased
 *
 * @example
 * ```tsx
 * import { trackPurchase } from '@/lib/ai/analytics-client';
 *
 * function CheckoutSuccess({ order }) {
 *   useEffect(() => {
 *     trackPurchase(
 *       order.id,
 *       order.total,
 *       order.items.map(item => ({
 *         productId: item.productId,
 *         variantId: item.variantId,
 *         quantity: item.quantity,
 *         price: item.price
 *       }))
 *     );
 *   }, []);
 * }
 * ```
 */
export function trackPurchase(
  orderId: string,
  totalAmount: number,
  products: Array<{
    productId: string;
    variantId: string;
    quantity: number;
    price: number;
  }>
): void {
  sendEvent('PURCHASE', {
    orderId,
    totalAmount,
    itemCount: products.reduce((sum, p) => sum + p.quantity, 0),
    products,
  });
}

/**
 * Track a category view
 *
 * @param categoryId - Category being viewed
 *
 * @example
 * ```tsx
 * import { trackCategoryView } from '@/lib/ai/analytics-client';
 *
 * function CategoryPage({ category }) {
 *   useEffect(() => {
 *     trackCategoryView(category.id);
 *   }, [category.id]);
 * }
 * ```
 */
export function trackCategoryView(categoryId: string): void {
  sendEvent('CATEGORY_VIEW', {
    categoryId,
  });
}

/**
 * Track a search query
 *
 * @param query - Search query entered by user
 *
 * @example
 * ```tsx
 * import { trackSearch } from '@/lib/ai/analytics-client';
 *
 * function SearchBar() {
 *   const handleSearch = (query: string) => {
 *     trackSearch(query);
 *     // ... perform search
 *   };
 * }
 * ```
 */
export function trackSearch(query: string): void {
  sendEvent('SEARCH', {
    query,
  });
}

/**
 * Track a remove-from-cart event
 *
 * @param productId - Product being removed
 * @param variantId - Variant being removed
 * @param quantity - Quantity being removed
 *
 * @example
 * ```tsx
 * import { trackRemoveFromCart } from '@/lib/ai/analytics-client';
 *
 * function CartItem({ item }) {
 *   const handleRemove = () => {
 *     trackRemoveFromCart(item.productId, item.variantId, item.quantity);
 *     // ... remove from cart logic
 *   };
 * }
 * ```
 */
export function trackRemoveFromCart(
  productId: string,
  variantId: string,
  quantity: number
): void {
  sendEvent('REMOVE_FROM_CART', {
    productId,
    variantId,
    quantity,
  });
}

// ============================================================================
// BATCH TRACKING (Advanced)
// ============================================================================

/**
 * Batch multiple events together
 * Useful when multiple events happen at once (e.g., page load with multiple product views)
 *
 * Note: This requires a separate batch endpoint to be implemented
 */
export function batchTrackEvents(
  events: Array<{
    eventType: AnalyticsTrackingRequest['eventType'];
    data?: AnalyticsTrackingRequest['data'];
  }>
): void {
  // For now, just send them individually
  // In the future, this could be optimized with a batch endpoint
  events.forEach(event => {
    sendEvent(event.eventType, event.data);
  });
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Check if analytics are enabled
 * Useful for respecting user privacy preferences
 */
export function isAnalyticsEnabled(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for Do Not Track browser setting
  const dnt = navigator.doNotTrack || (window as { doNotTrack?: string }).doNotTrack;
  if (dnt === '1' || dnt === 'yes') {
    return false;
  }

  // Check for user preferences (if you implement a cookie consent banner)
  const consent = localStorage.getItem('analytics_consent');
  if (consent === 'false') {
    return false;
  }

  return true;
}

/**
 * Opt out of analytics tracking
 * Sets a flag to disable all tracking
 */
export function optOutOfAnalytics(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('analytics_consent', 'false');
}

/**
 * Opt in to analytics tracking
 * Clears the opt-out flag
 */
export function optInToAnalytics(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('analytics_consent', 'true');
}
