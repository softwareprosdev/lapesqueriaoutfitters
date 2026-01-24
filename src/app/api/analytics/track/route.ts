/**
 * Analytics Tracking API Endpoint
 *
 * Receives tracking events from the frontend and stores them
 * for recommendation engine improvement.
 *
 * POST /api/analytics/track
 *
 * Privacy-conscious: No PII stored, only behavioral patterns
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  trackProductView,
  trackAddToCart,
  trackPurchase,
  trackCategoryView,
  trackSearch,
  type ProductViewEvent,
  type AddToCartEvent,
  type PurchaseEvent,
} from '@/lib/ai/analytics-tracker';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Request body for tracking endpoint
 */
interface TrackingRequest {
  eventType:
    | 'PRODUCT_VIEW'
    | 'ADD_TO_CART'
    | 'REMOVE_FROM_CART'
    | 'PURCHASE'
    | 'CATEGORY_VIEW'
    | 'SEARCH';
  sessionId: string;
  data?: Record<string, unknown>;
}

// ============================================================================
// API HANDLERS
// ============================================================================

/**
 * POST /api/analytics/track
 *
 * Track analytics events from the frontend
 *
 * @example Request Body
 * ```json
 * {
 *   "eventType": "PRODUCT_VIEW",
 *   "sessionId": "anonymous-session-123",
 *   "data": {
 *     "productId": "prod-789",
 *     "variantId": "var-012",
 *     "categoryId": "cat-345",
 *     "price": 29.99,
 *     "source": "search"
 *   }
 * }
 * ```
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body = (await request.json()) as TrackingRequest;

    // Validate required fields
    if (!body.eventType || !body.sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: eventType, sessionId' },
        { status: 400 }
      );
    }

    // Get user session (optional - for logged-in users)
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Extract device type from user agent
    const userAgent = request.headers.get('user-agent') || '';
    const deviceType = getDeviceType(userAgent);

    // Extract referrer (internal pages only for privacy)
    const referrer = extractInternalReferrer(
      request.headers.get('referer') || ''
    );

    // Route to appropriate tracking function based on event type
    switch (body.eventType) {
      case 'PRODUCT_VIEW':
        await handleProductView(
          body.sessionId,
          userId,
          body.data,
          deviceType,
          referrer
        );
        break;

      case 'ADD_TO_CART':
        await handleAddToCart(
          body.sessionId,
          userId,
          body.data,
          deviceType,
          referrer
        );
        break;

      case 'PURCHASE':
        await handlePurchase(
          body.sessionId,
          userId,
          body.data,
          deviceType,
          referrer
        );
        break;

      case 'CATEGORY_VIEW':
        await handleCategoryView(body.sessionId, userId, body.data);
        break;

      case 'SEARCH':
        await handleSearch(body.sessionId, userId, body.data);
        break;

      case 'REMOVE_FROM_CART':
        // Track as event but don't need special handling for recommendations
        // Could be used for cart abandonment analysis in the future
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid event type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Analytics tracking error:', error);

    // Don't expose internal errors to client
    // Analytics failures shouldn't break user experience
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

// ============================================================================
// HANDLER FUNCTIONS
// ============================================================================

/**
 * Handle product view tracking
 */
async function handleProductView(
  sessionId: string,
  userId: string | undefined,
  data: Record<string, unknown> | undefined,
  deviceType: 'mobile' | 'tablet' | 'desktop',
  referrer?: string
): Promise<void> {
  if (!data?.productId) {
    throw new Error('Product ID required for PRODUCT_VIEW event');
  }

  const event: ProductViewEvent = {
    sessionId,
    userId,
    productId: data.productId as string,
    variantId: data.variantId as string | undefined,
    categoryId: data.categoryId as string | undefined,
    metadata: {
      price: data.price as number | undefined,
      source: data.source as string | undefined,
    },
    referrer,
    deviceType,
  };

  await trackProductView(event);
}

/**
 * Handle add to cart tracking
 */
async function handleAddToCart(
  sessionId: string,
  userId: string | undefined,
  data: Record<string, unknown> | undefined,
  deviceType: 'mobile' | 'tablet' | 'desktop',
  referrer?: string
): Promise<void> {
  if (!data?.productId || !data?.variantId || !data?.price || !data?.quantity) {
    throw new Error(
      'Product ID, variant ID, price, and quantity required for ADD_TO_CART event'
    );
  }

  const event: AddToCartEvent = {
    sessionId,
    userId,
    productId: data.productId as string,
    variantId: data.variantId as string,
    categoryId: data.categoryId as string | undefined,
    metadata: {
      price: data.price as number,
      quantity: data.quantity as number,
    },
    referrer,
    deviceType,
  };

  await trackAddToCart(event);
}

/**
 * Handle purchase tracking
 */
async function handlePurchase(
  sessionId: string,
  userId: string | undefined,
  data: Record<string, unknown> | undefined,
  deviceType: 'mobile' | 'tablet' | 'desktop',
  referrer?: string
): Promise<void> {
  if (!data?.orderId || !data?.totalAmount || !data?.products) {
    throw new Error(
      'Order ID, total amount, and products required for PURCHASE event'
    );
  }

  const event: PurchaseEvent = {
    sessionId,
    userId,
    metadata: {
      orderId: data.orderId as string,
      totalAmount: data.totalAmount as number,
      itemCount: data.itemCount as number,
      products: data.products as Array<{
        productId: string;
        variantId: string;
        quantity: number;
        price: number;
      }>,
    },
    referrer,
    deviceType,
  };

  await trackPurchase(event);
}

/**
 * Handle category view tracking
 */
async function handleCategoryView(
  sessionId: string,
  userId: string | undefined,
  data: Record<string, unknown> | undefined
): Promise<void> {
  if (!data?.categoryId) {
    throw new Error('Category ID required for CATEGORY_VIEW event');
  }

  await trackCategoryView(sessionId, data.categoryId as string, userId);
}

/**
 * Handle search tracking
 */
async function handleSearch(
  sessionId: string,
  userId: string | undefined,
  data: Record<string, unknown> | undefined
): Promise<void> {
  if (!data?.query) {
    throw new Error('Search query required for SEARCH event');
  }

  await trackSearch(sessionId, data.query as string, userId);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract device type from user agent string
 */
function getDeviceType(
  userAgent: string
): 'mobile' | 'tablet' | 'desktop' {
  const ua = userAgent.toLowerCase();

  // Check for mobile devices
  if (
    /mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)
  ) {
    return 'mobile';
  }

  // Check for tablets
  if (/ipad|tablet|kindle|playbook|silk/i.test(ua)) {
    return 'tablet';
  }

  return 'desktop';
}

/**
 * Extract internal referrer (privacy-conscious)
 * Only keeps path, removes domain and query params
 */
function extractInternalReferrer(referer: string): string | undefined {
  if (!referer) return undefined;

  try {
    const url = new URL(referer);

    // Only track internal referrers (same origin)
    // This prevents tracking users across different sites
    const isInternal =
      url.hostname === 'localhost' ||
      url.hostname.includes('lapesqueria') ||
      url.hostname.includes('vercel.app');

    if (!isInternal) return undefined;

    // Return only the pathname (no query params or domain)
    // Example: /products/ocean-bracelet instead of full URL
    return url.pathname;
  } catch {
    return undefined;
  }
}

// ============================================================================
// RATE LIMITING (Optional - add if needed)
// ============================================================================

/**
 * Simple in-memory rate limiter to prevent abuse
 * In production, consider using Redis or a proper rate limiting service
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Cleanup old entries periodically
setInterval(
  () => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  },
  5 * 60 * 1000
); // Every 5 minutes
