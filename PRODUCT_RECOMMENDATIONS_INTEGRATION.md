# ProductRecommendations Component Integration Guide

## Overview

The ProductRecommendations component has been successfully created at:
`/Users/miracle/Documents/Software/bead-bracelet-store/src/components/ProductRecommendations.tsx`

This guide shows how to integrate it into your existing pages.

---

## Component Files Created

1. **Main Component**
   - `/Users/miracle/Documents/Software/bead-bracelet-store/src/components/ProductRecommendations.tsx`
   - The reusable React component

2. **Usage Examples**
   - `/Users/miracle/Documents/Software/bead-bracelet-store/src/components/ProductRecommendations.example.tsx`
   - Code examples for different scenarios

3. **Documentation**
   - `/Users/miracle/Documents/Software/bead-bracelet-store/src/components/ProductRecommendations.README.md`
   - Complete API reference and guide

---

## Quick Start - Integration Examples

### Example 1: Add to Product Detail Page

**File**: `/Users/miracle/Documents/Software/bead-bracelet-store/src/app/products/[slug]/page.tsx`

```tsx
import Link from 'next/link';
import Image from 'next/image';
import { fetchProductBySlug } from '@/app/actions';
import { notFound } from 'next/navigation';
import ProductRecommendations from '@/components/ProductRecommendations'; // ADD THIS

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const productData = await fetchProductBySlug(slug);

  if (!productData) {
    notFound();
  }

  const { product, variant, displayPrice, displayStock, displayImages } = productData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Existing breadcrumb */}
      <div className="bg-white border-b">
        {/* ... breadcrumb code ... */}
      </div>

      {/* Existing product detail section */}
      <section className="py-12">
        {/* ... product detail code ... */}
      </section>

      {/* ADD THIS: Similar Products Section */}
      <ProductRecommendations
        productId={product.id}
        limit={4}
        recommendationType="similar"
        title="You May Also Like"
        showReason={true}
        className="bg-white"
      />

      {/* Existing conservation CTA */}
      <section className="bg-gradient-to-r from-teal-600 to-blue-600 py-12">
        {/* ... conservation CTA code ... */}
      </section>
    </div>
  );
}
```

---

### Example 2: Add to Homepage

**File**: `/Users/miracle/Documents/Software/bead-bracelet-store/src/app/page.tsx`

```tsx
import ProductRecommendations from '@/components/ProductRecommendations';

export default function HomePage() {
  return (
    <div>
      {/* Hero section */}
      <section>{/* ... */}</section>

      {/* Featured Products */}
      <section>{/* ... */}</section>

      {/* ADD THIS: Personalized Recommendations */}
      <ProductRecommendations
        limit={6}
        recommendationType="personalized"
        title="Recommended for You"
        className="bg-gray-50"
      />

      {/* ADD THIS: Trending Products */}
      <ProductRecommendations
        limit={8}
        recommendationType="trending"
        title="Trending Ocean Bracelets"
        className="bg-white"
      />

      {/* Conservation Info */}
      <section>{/* ... */}</section>
    </div>
  );
}
```

---

### Example 3: Add to Products Listing Page

**File**: `/Users/miracle/Documents/Software/bead-bracelet-store/src/app/products/page.tsx`

```tsx
import Link from 'next/link';
import Image from 'next/image';
import { fetchProducts } from '@/app/actions';
import ProductRecommendations from '@/components/ProductRecommendations'; // ADD THIS

export default async function ProductsPage() {
  const { data: products, total } = await fetchProducts({}, { page: 1, limit: 50 });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-cyan-400 via-blue-500 to-teal-600 py-12">
        {/* ... */}
      </section>

      {/* Products Grid */}
      <section className="py-12">
        {/* ... existing products grid ... */}
      </section>

      {/* ADD THIS: Trending Products */}
      <ProductRecommendations
        limit={8}
        recommendationType="trending"
        title="Popular Right Now"
        className="bg-white py-12"
      />

      {/* Conservation Info Section */}
      <section className="bg-gradient-to-br from-blue-50 to-cyan-50 py-12">
        {/* ... */}
      </section>
    </div>
  );
}
```

---

### Example 4: Add to Cart Page

**File**: `/Users/miracle/Documents/Software/bead-bracelet-store/src/app/cart/page.tsx`

```tsx
'use client';

import { useCart } from '@/context/CartContext';
import ProductRecommendations from '@/components/ProductRecommendations'; // ADD THIS

export default function CartPage() {
  const { state: cart } = useCart();

  // Get first product ID for recommendations
  const firstProductId = cart.items[0]?.productId?.toString();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cart Items */}
      <section className="py-12">
        {/* ... cart items display ... */}
      </section>

      {/* ADD THIS: Frequently Bought Together */}
      {firstProductId && (
        <ProductRecommendations
          productId={firstProductId}
          limit={3}
          recommendationType="frequently-bought"
          title="Customers Also Bought"
          showReason={true}
          className="border-t bg-white py-12"
        />
      )}

      {/* ADD THIS: Or show trending if cart is empty */}
      {cart.items.length === 0 && (
        <ProductRecommendations
          limit={6}
          recommendationType="trending"
          title="Popular Products"
          className="bg-white py-12"
        />
      )}
    </div>
  );
}
```

---

## Component API Reference

### Props

```typescript
interface ProductRecommendationsProps {
  productId?: string;           // Required for 'similar' and 'frequently-bought'
  limit?: number;               // Default: 4
  recommendationType?:          // Default: 'similar'
    | 'similar'                 // Products similar to productId
    | 'personalized'            // Based on user history
    | 'trending'                // Popular products
    | 'frequently-bought';      // Bought together with productId
  title?: string;               // Custom title (auto-generated if not provided)
  showReason?: boolean;         // Show recommendation reason (default: false)
  className?: string;           // Additional CSS classes (default: '')
}
```

### Recommendation Types

| Type | Requires productId | Best Used On | Description |
|------|-------------------|--------------|-------------|
| `similar` | ✅ Yes | Product detail pages | Products similar by category, price, conservation focus |
| `personalized` | ❌ No | Homepage, account | Based on user's browsing/purchase history |
| `trending` | ❌ No | Homepage, empty cart | Popular products by recent sales |
| `frequently-bought` | ✅ Yes | Cart, checkout | Products often bought together |

---

## Features Checklist

✅ **Responsive Design**
- 2 columns on mobile
- 3 columns on tablet
- 4 columns on desktop

✅ **Ocean Theme Styling**
- Teal/cyan color palette
- Marine life icons (🌊 🐢)
- Gradient backgrounds

✅ **Loading States**
- Skeleton screens during fetch
- Smooth animations

✅ **Error Handling**
- Graceful fallback
- User-friendly messages
- No crashes

✅ **Empty State**
- Component auto-hides
- No empty boxes

✅ **Next.js Optimizations**
- Image component with sizes
- Lazy loading
- Proper alt text

✅ **Add to Cart**
- Direct cart integration
- Stock validation
- Conservation info preserved

✅ **TypeScript**
- Full type safety
- IntelliSense support
- Type inference

✅ **Accessibility**
- Semantic HTML
- Keyboard navigation
- WCAG color contrast

---

## API Endpoints Required

The component expects these endpoints to exist:

1. **Similar Products**
   ```
   GET /api/recommendations/similar?productId={id}&limit={num}
   ```
   ✅ Already exists at: `/Users/miracle/Documents/Software/bead-bracelet-store/src/app/api/recommendations/similar/route.ts`

2. **Personalized Recommendations**
   ```
   GET /api/recommendations/personalized?limit={num}
   ```
   ❌ Need to create: `/src/app/api/recommendations/personalized/route.ts`

3. **Trending Products**
   ```
   GET /api/recommendations/trending?limit={num}
   ```
   ❌ Need to create: `/src/app/api/recommendations/trending/route.ts`

4. **Frequently Bought Together**
   ```
   GET /api/recommendations/frequently-bought?productId={id}&limit={num}
   ```
   ❌ Need to create: `/src/app/api/recommendations/frequently-bought/route.ts`

### Creating Missing API Endpoints

The recommendation engine already has the functions. Just need to create API routes:

**Example for personalized endpoint:**

```typescript
// src/app/api/recommendations/personalized/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPersonalizedRecommendations } from '@/lib/ai/recommendation-engine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');
    const userId = searchParams.get('userId') || undefined;

    const recommendations = await getPersonalizedRecommendations(userId, limit);

    return NextResponse.json({
      success: true,
      recommendations,
      count: recommendations.length,
    });
  } catch (error: unknown) {
    console.error('Personalized recommendations error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get recommendations',
        success: false,
      },
      { status: 500 }
    );
  }
}
```

---

## Testing the Component

### Development Testing

```bash
# Start dev server
npm run dev

# Open browser to http://localhost:3000
# Navigate to a page where you added the component
```

### Check for Errors

```bash
# Run ESLint
npm run lint

# Build for production
npm run build
```

### Browser Console

Open browser DevTools and check:
1. Network tab - API calls to `/api/recommendations/*`
2. Console tab - Any error messages
3. React DevTools - Component props and state

---

## Styling Customization

### Change Colors

Edit the component's Tailwind classes:

```tsx
// Change primary color from teal to blue
className="bg-blue-600 hover:bg-blue-700"

// Change gradient background
className="bg-gradient-to-br from-blue-50 to-purple-50"
```

### Change Layout

Modify the grid:

```tsx
// 3 columns on desktop instead of 4
className="grid grid-cols-2 md:grid-cols-3 gap-6"

// More spacing
className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
```

---

## Performance Tips

1. **Limit Recommendations**: Keep `limit` prop reasonable (4-8 items)
2. **Lazy Load**: Consider using below-fold for less critical recommendations
3. **Cache API Responses**: Implement caching in API routes
4. **Prefetch**: Use Next.js `prefetch` for recommendation links

---

## Common Issues & Solutions

### Issue: No recommendations showing
**Solution**: Check if API endpoint exists and returns data

### Issue: Images not loading
**Solution**: Verify image URLs are in `next.config.ts` remotePatterns

### Issue: Add to Cart not working
**Solution**: Ensure CartContext is provided at app root

### Issue: TypeScript errors
**Solution**: Ensure all types match the recommendation engine

---

## Next Steps

1. ✅ Component created
2. ✅ Documentation written
3. ⬜ Create missing API endpoints (personalized, trending, frequently-bought)
4. ⬜ Add component to product detail page
5. ⬜ Add component to homepage
6. ⬜ Add component to cart page
7. ⬜ Test in development
8. ⬜ Deploy to production

---

## Support

For questions or issues:
- Check the main README: `/Users/miracle/Documents/Software/bead-bracelet-store/src/components/ProductRecommendations.README.md`
- Review examples: `/Users/miracle/Documents/Software/bead-bracelet-store/src/components/ProductRecommendations.example.tsx`
- Check project docs: `/Users/miracle/Documents/Software/bead-bracelet-store/CLAUDE.md`
