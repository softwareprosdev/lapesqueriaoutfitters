# Analytics Tracking System

Privacy-conscious analytics system for improving product recommendations at ShennaStudio.

## Overview

This analytics system tracks user behavior to improve the AI recommendation engine while maintaining user privacy. It stores **aggregated behavioral data** without personally identifiable information (PII).

## Features

- **Product Views**: Track when users view products
- **Cart Actions**: Track add-to-cart and remove-from-cart events
- **Purchases**: Track completed orders for recommendation improvement
- **Category & Search**: Track browsing patterns
- **Privacy-First**: No PII stored, respects Do Not Track
- **Session-Based**: Anonymous session IDs that reset on browser restart
- **Aggregated Metrics**: Rolling windows (7-day, 30-day) for trending products
- **User Patterns**: Build preference profiles for personalization

## Database Schema

### Models Created

Three new Prisma models have been added:

1. **AnalyticsEvent**: Individual tracking events
   - Stores raw events with timestamps
   - Indexed for efficient querying
   - Auto-cleanup after 90 days (GDPR compliance)

2. **ProductAnalytics**: Aggregated product metrics
   - View counts, add-to-cart counts, purchases
   - Conversion rates
   - Trending scores
   - Updated in real-time

3. **UserBrowsingPattern**: User behavior summary
   - Category preferences
   - Price range preferences
   - Conservation interests
   - Browsing time patterns

## Setup

### 1. Run Prisma Migration

```bash
# Generate Prisma client with new models
npm run db:generate

# Create database migration (when ready)
npx prisma migrate dev --name add_analytics_system

# Or push to database directly
npm run db:push
```

### 2. Import Tracking Functions

**Server-side** (Next.js API routes):
```typescript
import {
  trackProductView,
  trackAddToCart,
  trackPurchase,
  getUserBrowsingPattern,
  getTrendingProductIds,
} from '@/lib/ai/analytics-tracker';
```

**Client-side** (React components):
```typescript
import {
  trackProductView,
  trackAddToCart,
  trackPurchase,
  trackCategoryView,
  trackSearch,
} from '@/lib/ai/analytics-client';
```

## Usage Examples

### Track Product Views

**In a Product Page Component:**

```tsx
'use client';

import { useEffect } from 'react';
import { trackProductView } from '@/lib/ai/analytics-client';

export default function ProductPage({ product }: { product: Product }) {
  useEffect(() => {
    // Track view when component mounts
    trackProductView(product.id, {
      categoryId: product.categoryId,
      price: product.basePrice,
      source: 'direct', // or 'search', 'category', 'recommendation'
    });
  }, [product.id]);

  return <div>{/* Product details */}</div>;
}
```

### Track Add to Cart

**In an Add to Cart Button:**

```tsx
'use client';

import { trackAddToCart } from '@/lib/ai/analytics-client';

export function AddToCartButton({ product, variant, quantity }: Props) {
  const handleClick = async () => {
    // Track the event BEFORE adding to cart
    trackAddToCart(
      product.id,
      variant.id,
      quantity,
      variant.price,
      { categoryId: product.categoryId }
    );

    // Then add to cart
    await addToCart({ variantId: variant.id, quantity });
  };

  return <button onClick={handleClick}>Add to Cart</button>;
}
```

### Track Purchases

**In a Checkout Success Page:**

```tsx
'use client';

import { useEffect } from 'react';
import { trackPurchase } from '@/lib/ai/analytics-client';

export default function OrderConfirmation({ order }: { order: Order }) {
  useEffect(() => {
    // Track purchase once when order is confirmed
    trackPurchase(
      order.id,
      order.total,
      order.items.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
      }))
    );
  }, [order.id]);

  return <div>Thank you for your order!</div>;
}
```

### Track Category Views

```tsx
'use client';

import { useEffect } from 'react';
import { trackCategoryView } from '@/lib/ai/analytics-client';

export default function CategoryPage({ category }: { category: Category }) {
  useEffect(() => {
    trackCategoryView(category.id);
  }, [category.id]);

  return <div>{/* Category products */}</div>;
}
```

### Track Search Queries

```tsx
'use client';

import { trackSearch } from '@/lib/ai/analytics-client';

export function SearchBar() {
  const handleSearch = (query: string) => {
    // Track the search
    trackSearch(query);

    // Perform the actual search
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return <input onSubmit={handleSearch} />;
}
```

## Using Analytics for Recommendations

### Get Trending Products

```typescript
import { getTrendingProductIds } from '@/lib/ai/analytics-tracker';
import { prisma } from '@/lib/prisma';

// In an API route or server component
export async function getTrendingProducts() {
  const trendingIds = await getTrendingProductIds(10);

  const products = await prisma.product.findMany({
    where: { id: { in: trendingIds } },
    include: { variants: true, images: true },
  });

  return products;
}
```

### Get User Browsing Pattern

```typescript
import { getUserBrowsingPattern } from '@/lib/ai/analytics-tracker';

// Get personalized insights for a user
const pattern = await getUserBrowsingPattern(userId);

if (pattern) {
  console.log('Preferred categories:', pattern.categoryPreferences);
  console.log('Average price viewed:', pattern.priceRange.avg);
  console.log('Total views:', pattern.behavior.totalViews);
}
```

### Get Product Analytics

```typescript
import { getProductAnalytics } from '@/lib/ai/analytics-tracker';

const analytics = await getProductAnalytics(productId);

if (analytics) {
  console.log('Views last 7 days:', analytics.viewsLast7Days);
  console.log('Conversion rate:', analytics.viewToCartRate);
  console.log('Trending score:', analytics.trendingScore);
}
```

## API Endpoint

### POST /api/analytics/track

Receives tracking events from the frontend.

**Request:**
```json
{
  "eventType": "PRODUCT_VIEW",
  "sessionId": "session_1234567890_abc123",
  "data": {
    "productId": "clx1234567890",
    "categoryId": "clx0987654321",
    "price": 29.99,
    "source": "search"
  }
}
```

**Response:**
```json
{
  "success": true
}
```

## Privacy & GDPR Compliance

### Privacy Features

1. **Anonymous Sessions**: Session IDs are random and reset on browser restart
2. **No PII**: Email, names, addresses are never stored in analytics
3. **Aggregated Data**: Individual events are rolled up into summaries
4. **Auto-Cleanup**: Events older than 90 days are automatically deleted
5. **Do Not Track**: Respects browser DNT settings
6. **Opt-Out**: Users can opt out via `optOutOfAnalytics()`

### Cleanup Maintenance

Run periodically (e.g., daily cron job):

```typescript
import { cleanupOldEvents } from '@/lib/ai/analytics-tracker';

// Delete events older than 90 days
const deleted = await cleanupOldEvents(90);
console.log(`Cleaned up ${deleted} old events`);
```

## Best Practices

### 1. Track Early, Track Often

Track events as soon as they happen, not in batches. This ensures real-time data.

```typescript
// ✅ Good - track immediately
trackProductView(productId);

// ❌ Bad - waiting or batching
setTimeout(() => trackProductView(productId), 1000);
```

### 2. Use SendBeacon for Critical Events

The client library automatically uses `navigator.sendBeacon` for purchases and cart events to ensure they're sent even if the user navigates away.

### 3. Don't Block on Analytics

Analytics are non-blocking. Don't await tracking functions:

```typescript
// ✅ Good - fire and forget
trackAddToCart(productId, variantId, quantity, price);
addToCart({ variantId, quantity });

// ❌ Bad - blocking on analytics
await trackAddToCart(productId, variantId, quantity, price);
await addToCart({ variantId, quantity });
```

### 4. Handle Errors Gracefully

Analytics failures should never break the user experience. All tracking functions handle errors internally.

### 5. Respect User Privacy

Always check consent before tracking:

```typescript
import { isAnalyticsEnabled } from '@/lib/ai/analytics-client';

if (isAnalyticsEnabled()) {
  trackProductView(productId);
}
```

## Maintenance & Monitoring

### Recalculate Analytics

If you need to recalculate all product analytics (e.g., after a data migration):

```typescript
import { recalculateProductAnalytics } from '@/lib/ai/analytics-tracker';

await recalculateProductAnalytics();
```

### Monitor Performance

Analytics queries are optimized with database indexes:
- `[eventType, timestamp]`
- `[userId, timestamp]`
- `[sessionId, timestamp]`
- `[productId, timestamp]`

### Database Size

With auto-cleanup enabled (90 days), expect:
- ~1000 events/day = ~90K records
- ~10K events/day = ~900K records

Each event is ~1KB, so 90K records ≈ 90MB

## Integration with Recommendation Engine

The analytics system integrates with the existing recommendation engine in `/src/lib/ai/recommendation-engine.ts`:

1. **Trending Products**: Use `getTrendingProductIds()` to boost trending items
2. **Personalization**: Use `getUserBrowsingPattern()` to personalize recommendations
3. **Conversion Optimization**: Use `getHighConversionProducts()` for upsells
4. **Popular Items**: Use `getMostViewedProducts()` for new users

## Troubleshooting

### Events Not Being Tracked

1. Check browser console for errors
2. Verify API endpoint is reachable: `curl -X POST http://localhost:3000/api/analytics/track`
3. Check Prisma client is generated: `npm run db:generate`
4. Verify database tables exist: `npx prisma studio`

### Missing Analytics Data

1. Check if auto-cleanup removed old data
2. Verify `updateProductAnalytics()` is running
3. Check database indexes are created

### Performance Issues

1. Ensure database indexes are present
2. Consider running `cleanupOldEvents()` more frequently
3. Use `EXPLAIN ANALYZE` on slow queries

## Future Enhancements

Potential improvements to consider:

1. **Batch API Endpoint**: Reduce network requests by batching events
2. **Real-time Dashboard**: Admin analytics dashboard
3. **A/B Testing**: Track recommendation algorithm performance
4. **Session Replay**: Record user journeys (privacy-conscious)
5. **Funnel Analysis**: Cart abandonment tracking
6. **Cohort Analysis**: User retention metrics

## Security Notes

- Rate limiting is implemented (100 requests/minute per session)
- No SQL injection risk (Prisma ORM used)
- No XSS risk (no user-generated content displayed)
- CORS restricted to same origin
- Session IDs are cryptographically random

## Support

For questions or issues:
1. Check this README
2. Review code comments in:
   - `/src/lib/ai/analytics-tracker.ts` (server-side)
   - `/src/lib/ai/analytics-client.ts` (client-side)
   - `/src/app/api/analytics/track/route.ts` (API endpoint)
3. Check Prisma schema: `/prisma/schema.prisma`
