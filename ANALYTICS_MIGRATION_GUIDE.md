# Analytics System Migration Guide

This guide helps you integrate the new analytics tracking system into your ShennaStudio e-commerce platform.

## Overview

The analytics system has been created but **NOT yet migrated to the database**. This allows you to review the code and run the migration when ready.

## What Was Created

### 1. Database Schema (Prisma)
Location: `/prisma/schema.prisma`

**New Models:**
- `AnalyticsEvent` - Individual tracking events
- `ProductAnalytics` - Aggregated product metrics
- `UserBrowsingPattern` - User behavior summaries
- `AnalyticsEventType` - Enum for event types

**Status:** Schema updated, migration NOT created yet

### 2. Server-Side Tracking Library
Location: `/src/lib/ai/analytics-tracker.ts`

**Features:**
- `trackProductView()` - Track product views
- `trackAddToCart()` - Track cart additions
- `trackPurchase()` - Track completed orders
- `getUserBrowsingPattern()` - Get user preferences
- `getTrendingProductIds()` - Get trending products
- `cleanupOldEvents()` - GDPR-compliant cleanup

### 3. Client-Side Tracking Library
Location: `/src/lib/ai/analytics-client.ts`

**Features:**
- Browser-friendly tracking functions
- Automatic session management
- Privacy controls (Do Not Track, opt-out)
- SendBeacon for critical events

### 4. API Endpoint
Location: `/src/app/api/analytics/track/route.ts`

**Endpoint:** `POST /api/analytics/track`

**Features:**
- Receives tracking events from frontend
- Rate limiting
- Privacy-conscious referrer extraction
- Device type detection

### 5. TypeScript Types
Location: `/src/types/index.ts`

**Added Types:**
- `AnalyticsEvent`
- `ProductAnalytics`
- `UserBrowsingPattern`
- `AnalyticsTrackingRequest`
- And more...

### 6. Documentation
- `/src/lib/ai/ANALYTICS_README.md` - Complete usage guide
- `/src/lib/ai/analytics-integration-example.ts` - Integration examples

## Migration Steps

### Step 1: Review the Code

1. Review the Prisma schema changes:
   ```bash
   cat prisma/schema.prisma | grep -A 50 "Analytics"
   ```

2. Review the tracking library:
   ```bash
   cat src/lib/ai/analytics-tracker.ts
   ```

3. Review the API endpoint:
   ```bash
   cat src/app/api/analytics/track/route.ts
   ```

### Step 2: Generate Prisma Client

This generates TypeScript types from the schema:

```bash
npm run db:generate
```

**Expected Output:**
```
✔ Generated Prisma Client (X.X.X) to ./node_modules/@prisma/client
```

### Step 3: Create Database Migration

**Option A: Development (recommended for first time):**

```bash
npx prisma migrate dev --name add_analytics_system
```

This will:
- Create a new migration file
- Apply it to your development database
- Regenerate Prisma Client

**Option B: Production (for deployed database):**

```bash
npm run db:push
```

This will:
- Push schema changes directly to database
- Skip migration file creation
- Useful for quick testing

### Step 4: Verify Database Tables

Open Prisma Studio to verify the tables were created:

```bash
npm run db:studio
```

Look for:
- `analytics_events`
- `product_analytics`
- `user_browsing_patterns`

### Step 5: Test the API Endpoint

Test that the tracking endpoint works:

```bash
curl -X POST http://localhost:3000/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "PRODUCT_VIEW",
    "sessionId": "test-session-123",
    "data": {
      "productId": "test-product",
      "price": 29.99
    }
  }'
```

**Expected Response:**
```json
{"success":true}
```

### Step 6: Integrate into Frontend

Add tracking to your product pages:

**Example: Product Page**
```tsx
// src/app/products/[slug]/page.tsx
'use client';

import { useEffect } from 'react';
import { trackProductView } from '@/lib/ai/analytics-client';

export default function ProductPage({ product }) {
  useEffect(() => {
    trackProductView(product.id, {
      categoryId: product.categoryId,
      price: product.basePrice,
      source: 'direct'
    });
  }, [product.id]);

  return (
    <div>{/* Your product page */}</div>
  );
}
```

**Example: Add to Cart Button**
```tsx
// src/components/AddToCartButton.tsx
'use client';

import { trackAddToCart } from '@/lib/ai/analytics-client';

export function AddToCartButton({ product, variant, quantity }) {
  const handleClick = () => {
    trackAddToCart(product.id, variant.id, quantity, variant.price);
    // ... your existing add to cart logic
  };

  return <button onClick={handleClick}>Add to Cart</button>;
}
```

### Step 7: Set Up Cleanup Cron Job (Optional)

For GDPR compliance, clean up old events periodically:

**Create:** `/src/app/api/cron/cleanup-analytics/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { cleanupOldEvents } from '@/lib/ai/analytics-tracker';

export async function GET() {
  const deleted = await cleanupOldEvents(90); // Keep 90 days
  return NextResponse.json({ deleted });
}
```

**Configure in Vercel:**
1. Go to Vercel Dashboard
2. Add Cron Job: `0 2 * * *` (runs at 2 AM daily)
3. URL: `/api/cron/cleanup-analytics`

## Integration Points

### Where to Add Tracking

1. **Product Pages** - `trackProductView()`
2. **Category Pages** - `trackCategoryView()`
3. **Search Bar** - `trackSearch()`
4. **Add to Cart** - `trackAddToCart()`
5. **Checkout Success** - `trackPurchase()`
6. **Remove from Cart** - `trackRemoveFromCart()`

### Recommendation Engine Integration

Update your existing recommendation API routes to use analytics:

```typescript
// src/app/api/recommendations/personalized/route.ts
import { getAnalyticsEnhancedRecommendations } from '@/lib/ai/analytics-integration-example';

export async function GET(request: Request) {
  const userId = getUserIdFromSession(request);
  const recommendations = await getAnalyticsEnhancedRecommendations(userId);
  return Response.json({ recommendations });
}
```

## Rollback Plan

If you need to rollback:

### Rollback Migration (Development)

```bash
npx prisma migrate reset
```

⚠️ **WARNING:** This will delete all data in your database!

### Rollback Migration (Production)

1. Create a down migration:
   ```sql
   DROP TABLE IF EXISTS "analytics_events";
   DROP TABLE IF EXISTS "product_analytics";
   DROP TABLE IF EXISTS "user_browsing_patterns";
   DROP TYPE IF EXISTS "AnalyticsEventType";
   ```

2. Run manually in production database

### Remove Code Changes

```bash
git checkout HEAD -- prisma/schema.prisma
git checkout HEAD -- src/lib/ai/analytics-tracker.ts
git checkout HEAD -- src/lib/ai/analytics-client.ts
git checkout HEAD -- src/app/api/analytics/track/route.ts
git checkout HEAD -- src/types/index.ts
```

## Testing Checklist

Before deploying to production:

- [ ] Prisma client generated successfully
- [ ] Database migration completed
- [ ] Tables created in database
- [ ] API endpoint responds to POST requests
- [ ] Product view tracking works
- [ ] Add to cart tracking works
- [ ] Purchase tracking works
- [ ] Session IDs are being generated
- [ ] Analytics data appears in Prisma Studio
- [ ] getUserBrowsingPattern() returns data
- [ ] getTrendingProductIds() returns data
- [ ] Cleanup function removes old events
- [ ] Frontend tracking doesn't cause errors
- [ ] Tracking works for logged-in users
- [ ] Tracking works for anonymous users
- [ ] Rate limiting prevents abuse

## Performance Considerations

### Database Indexes

The schema includes these indexes (automatically created):
- `analytics_events`: `[eventType, timestamp]`
- `analytics_events`: `[userId, timestamp]`
- `analytics_events`: `[sessionId, timestamp]`
- `analytics_events`: `[productId, timestamp]`

### Expected Load

- **Low traffic** (100 visitors/day): ~500 events/day
- **Medium traffic** (1000 visitors/day): ~5K events/day
- **High traffic** (10K visitors/day): ~50K events/day

### Storage Estimates

With 90-day retention:
- Low traffic: ~45K events = ~45 MB
- Medium traffic: ~450K events = ~450 MB
- High traffic: ~4.5M events = ~4.5 GB

## Monitoring

### Check Analytics Health

```typescript
// Check if events are being tracked
const recentEvents = await prisma.analyticsEvent.findMany({
  take: 10,
  orderBy: { timestamp: 'desc' }
});

// Check if aggregations are working
const productsWithAnalytics = await prisma.productAnalytics.count();

// Check if user patterns are being built
const usersWithPatterns = await prisma.userBrowsingPattern.count();
```

### Dashboard Queries

```typescript
// Most viewed products today
const today = new Date();
today.setHours(0, 0, 0, 0);

const topToday = await prisma.analyticsEvent.groupBy({
  by: ['productId'],
  where: {
    eventType: 'PRODUCT_VIEW',
    timestamp: { gte: today }
  },
  _count: true,
  orderBy: { _count: { productId: 'desc' } },
  take: 10
});
```

## Troubleshooting

### "Table does not exist" Error

**Problem:** Trying to use analytics before migration
**Solution:** Run `npm run db:push` or `npx prisma migrate dev`

### "Session is not defined" Error

**Problem:** Using client-side code on server
**Solution:** Ensure `'use client'` directive at top of file

### No Analytics Data Showing

**Problem:** Events not being tracked
**Solution:**
1. Check browser console for errors
2. Verify API endpoint is reachable
3. Check that tracking functions are being called
4. Verify database tables exist

### Slow Queries

**Problem:** Analytics queries taking too long
**Solution:**
1. Verify indexes are created: `\d analytics_events` in psql
2. Run `EXPLAIN ANALYZE` on slow queries
3. Consider reducing retention period

## Next Steps

After successful migration:

1. **Monitor Performance**: Watch database size and query times
2. **Add More Tracking**: Identify additional tracking points
3. **Build Dashboard**: Create admin analytics dashboard
4. **Optimize Recommendations**: Use analytics to improve suggestions
5. **A/B Testing**: Test different recommendation strategies

## Support & Questions

- Check `/src/lib/ai/ANALYTICS_README.md` for detailed usage
- Review `/src/lib/ai/analytics-integration-example.ts` for examples
- Check code comments in implementation files

## Privacy & Legal

This analytics system is designed to be:
- **GDPR Compliant**: No PII stored, 90-day retention
- **Privacy-First**: Respects Do Not Track
- **Transparent**: Users can opt out
- **Secure**: Rate limited, no SQL injection risk

Ensure your privacy policy mentions:
- Anonymous behavioral tracking
- Session-based analytics
- 90-day data retention
- User opt-out options

## Summary

The analytics system is **ready to deploy** but requires:
1. Database migration (`npm run db:push`)
2. Frontend integration (add tracking calls)
3. Testing (verify data flows correctly)

Take your time reviewing the code and test thoroughly before deploying to production.
