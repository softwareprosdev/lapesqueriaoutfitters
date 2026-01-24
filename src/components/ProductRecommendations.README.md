# ProductRecommendations Component

A reusable, ocean-themed React component for displaying product recommendations in the ShennaStudio e-commerce platform.

## Location

`/Users/miracle/Documents/Software/bead-bracelet-store/src/components/ProductRecommendations.tsx`

## Features

- **Responsive Grid Layout**: 2 columns on mobile, 3-4 columns on desktop
- **Ocean Theme Styling**: Teal/cyan color palette matching brand
- **Loading States**: Skeleton screens during data fetch
- **Error Handling**: Graceful fallback with user-friendly messages
- **Empty State Handling**: Component auto-hides when no recommendations
- **Next.js Image Optimization**: Proper sizing and lazy loading
- **Add to Cart Integration**: Direct cart functionality from recommendations
- **Stock Indicators**: Real-time stock level display
- **Conservation Badges**: Shows conservation impact
- **TypeScript**: Full type safety throughout

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `productId` | `string` | `undefined` | Conditional* | Product ID for similar/frequently-bought recommendations |
| `limit` | `number` | `4` | No | Number of recommendations to display |
| `recommendationType` | `'similar' \| 'personalized' \| 'trending' \| 'frequently-bought'` | `'similar'` | No | Type of recommendations to fetch |
| `title` | `string` | Auto-generated** | No | Custom section title |
| `showReason` | `boolean` | `false` | No | Display recommendation reason |
| `className` | `string` | `''` | No | Additional CSS classes for wrapper |

\* **Required** when `recommendationType` is `'similar'` or `'frequently-bought'`

\*\* Default titles:
- `similar`: "Similar Products"
- `personalized`: "Recommended for You"
- `trending`: "Trending Now"
- `frequently-bought`: "Frequently Bought Together"

## Usage Examples

### 1. Similar Products (Product Detail Page)

```tsx
import ProductRecommendations from '@/components/ProductRecommendations';

export default function ProductDetailPage({ productId }: { productId: string }) {
  return (
    <div>
      {/* Product details */}

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
```

### 2. Personalized Recommendations (Homepage)

```tsx
<ProductRecommendations
  limit={6}
  recommendationType="personalized"
  title="Recommended for You"
/>
```

### 3. Trending Products

```tsx
<ProductRecommendations
  limit={8}
  recommendationType="trending"
  title="Trending Ocean Bracelets"
/>
```

### 4. Frequently Bought Together (Cart Page)

```tsx
{cartItems.length > 0 && (
  <ProductRecommendations
    productId={cartItems[0].productId}
    limit={3}
    recommendationType="frequently-bought"
    title="Customers Also Bought"
    showReason={true}
  />
)}
```

## API Integration

The component fetches data from these endpoints:

### Similar Products
```
GET /api/recommendations/similar?productId={id}&limit={num}
```

### Personalized Recommendations
```
GET /api/recommendations/personalized?limit={num}
```

### Trending Products
```
GET /api/recommendations/trending?limit={num}
```

### Frequently Bought Together
```
GET /api/recommendations/frequently-bought?productId={id}&limit={num}
```

### Expected Response Format

```typescript
{
  success: boolean;
  recommendations: Array<{
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    categoryId: string | null;
    description: string | null;
    conservationFocus: string | null;
    featured: boolean;
    score: number;
    reason?: string;
    variants?: Array<{
      id: string;
      sku: string;
      price: number;
      stock: number;
      size?: string | null;
      color?: string | null;
      material?: string | null;
      images?: Array<{ url?: string | null }>;
    }>;
  }>;
  count: number;
}
```

## Styling

The component uses Tailwind CSS with the ShennaStudio ocean theme:

- **Primary Colors**: Teal-600, Cyan-50, Blue-50
- **Accent Colors**: Green (conservation), Yellow (featured), Red (out of stock)
- **Responsive Breakpoints**:
  - Mobile: 2 columns
  - Tablet (md): 3 columns
  - Desktop (lg): 4 columns
- **Animations**: Hover scale, pulse for featured, skeleton loading

### Custom Styling

Add custom classes via the `className` prop:

```tsx
<ProductRecommendations
  productId={id}
  className="my-8 bg-blue-50 py-12"
/>
```

## Component Behavior

### Loading State
- Displays skeleton screens matching the grid layout
- Number of skeletons matches the `limit` prop
- Animated pulse effect

### Error State
- Shows a user-friendly error message
- Red-themed alert box
- Does not crash the page

### Empty State
- Component returns `null` (completely hidden)
- No empty box or placeholder shown
- Graceful degradation

### Stock Handling
- Products with no stock show "Out of Stock" badge
- Add to Cart button disabled for out-of-stock items
- Stock count displayed for available items
- Gray overlay on out-of-stock product images

## Add to Cart Integration

The component integrates with the global cart context:

```tsx
import { useCart } from '@/context/CartContext';

// Inside component
const { addItem } = useCart();

// When user clicks "Add to Cart"
addItem(cartProduct, cartVariant, 1);
```

Automatically handles:
- Product and variant data transformation
- Cart state updates
- Inventory tracking
- Conservation info preservation

## Dependencies

- `react`: Hooks (useState, useEffect)
- `next/link`: Client-side navigation
- `next/image`: Optimized images
- `@/context/CartContext`: Shopping cart state

## TypeScript Types

All types are defined inline in the component:

- `RecommendedProduct`: Product data from API
- `ProductRecommendationsProps`: Component props

Types are compatible with the existing schema in:
- `/Users/miracle/Documents/Software/bead-bracelet-store/src/types/index.ts`
- `/Users/miracle/Documents/Software/bead-bracelet-store/src/lib/ai/recommendation-engine.ts`

## Browser Compatibility

- Modern browsers (ES6+)
- Responsive design works on all screen sizes
- Touch-friendly on mobile devices
- Hover effects gracefully degrade on touch devices

## Performance Considerations

- **Image Optimization**: Uses Next.js Image with proper sizes
- **Lazy Loading**: Images load as they enter viewport
- **Memoization**: Could add React.memo if performance issues arise
- **API Caching**: Consider implementing SWR or React Query for data caching

## Accessibility

- Semantic HTML structure
- Proper alt text on images
- Keyboard navigation support
- Color contrast meets WCAG standards
- Touch targets are 44x44px minimum

## Future Enhancements

Potential improvements:

1. **Pagination**: Load more recommendations on scroll/click
2. **Filtering**: Allow users to filter recommendations by category/price
3. **Quick View**: Modal with product details without navigation
4. **Wishlist**: Add to wishlist button
5. **Comparison**: Select multiple products to compare
6. **Analytics**: Track which recommendations get clicked
7. **A/B Testing**: Test different recommendation algorithms
8. **Caching**: Implement client-side caching with SWR

## Testing

To test the component:

```bash
# Run ESLint
npm run lint

# Run in development
npm run dev

# Build for production
npm run build
```

## Troubleshooting

### No recommendations showing
- Check API endpoint is returning data
- Verify productId is valid (for similar/frequently-bought)
- Check browser console for errors
- Ensure products have variants with stock > 0

### Images not loading
- Verify image URLs are in next.config.ts remotePatterns
- Check browser console for image errors
- Ensure Vercel Blob is configured correctly

### Add to Cart not working
- Verify CartContext is provided at app root
- Check variant has valid stock level
- Console log to verify cart state updates

## Related Files

- `/Users/miracle/Documents/Software/bead-bracelet-store/src/components/ProductRecommendations.tsx` - Main component
- `/Users/miracle/Documents/Software/bead-bracelet-store/src/components/ProductRecommendations.example.tsx` - Usage examples
- `/Users/miracle/Documents/Software/bead-bracelet-store/src/app/api/recommendations/similar/route.ts` - Similar products API
- `/Users/miracle/Documents/Software/bead-bracelet-store/src/lib/ai/recommendation-engine.ts` - Recommendation logic
- `/Users/miracle/Documents/Software/bead-bracelet-store/src/context/CartContext.tsx` - Cart state management

## Support

For questions or issues with this component, refer to the main project documentation in `/Users/miracle/Documents/Software/bead-bracelet-store/CLAUDE.md`.
