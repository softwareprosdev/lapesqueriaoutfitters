# CartContext - Payload CMS Integration

Updated CartContext for **ShennaStudio** e-commerce platform with full Payload CMS integration.

---

## Overview

The CartContext provides a robust shopping cart implementation with:

- **Payload CMS Integration**: Uses `Product` types from `payload-types.ts`
- **Variant Support**: Handles both base products and product variants
- **Automatic Persistence**: Cart saved to localStorage automatically
- **Conservation Tracking**: Tracks donation percentages per item
- **Guest Checkout**: Support for non-logged-in users
- **Price Calculations**: Automatic subtotal, shipping, tax, and total calculations
- **API Sync Ready**: Prepared for Payload API synchronization

---

## Quick Start

### 1. Wrap Your App

The CartProvider is already set up in the root layout:

```typescript
// src/app/layout.tsx
import { CartProvider } from '@/context/CartContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
```

### 2. Use the Cart Hook

```typescript
import { useCart } from '@/context/CartContext';
import type { Product } from '@payload-types';

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <button onClick={() => addItem(product, null, 1)}>
      Add to Cart - ${product.basePrice}
    </button>
  );
}
```

---

## API Reference

### Hook: `useCart()`

Returns cart state and methods for managing the cart.

#### State Properties

```typescript
interface CartState {
  items: PayloadCartItem[];           // Cart items
  subtotal: number;                   // Sum of all items
  shipping: number;                   // $5.95 if under $50, otherwise $0
  tax: number;                        // 8.25% of subtotal
  total: number;                      // subtotal + shipping + tax
  isOpen: boolean;                    // Cart modal/sidebar open state
  guestEmail?: string | null;         // Guest user email
  guestName?: string | null;          // Guest user name
}
```

#### Methods

```typescript
{
  // Core cart operations
  addItem: (product: Product, variant?: PayloadProductVariant | null, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;

  // UI state
  toggleCart: () => void;

  // Guest checkout
  setGuestInfo: (email?: string, name?: string) => void;

  // Sync with backend (for logged-in users)
  syncWithPayload: (userId?: number) => Promise<void>;

  // Manual recalculation (usually not needed - automatic)
  recalculateTotals: () => void;

  // Direct access to state and dispatch (advanced usage)
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
}
```

---

## Types

### `PayloadCartItem`

Cart item with flattened structure for easy access:

```typescript
interface PayloadCartItem {
  id: string;                                    // Unique cart item ID
  productId: number;                             // Payload product ID
  productName: string;                           // Product name
  productSku: string;                            // Product SKU
  variantId?: string | null;                     // Variant ID (if variant selected)
  variantName?: string | null;                   // e.g., "Medium - Blue"
  variantSku?: string | null;                    // Variant SKU
  price: number;                                 // Effective price (variant or base)
  quantity: number;                              // Quantity in cart
  stock: number;                                 // Available stock
  imageUrl?: string | null;                      // Pre-extracted image URL
  conservationDonationPercentage?: number | null; // e.g., 10 (for 10%)
  conservationFocus?: string | null;             // e.g., "Coral Reef Restoration"
}
```

### `PayloadProductVariant`

Product variant from Payload CMS:

```typescript
interface PayloadProductVariant {
  id?: string | null;
  variantName: string;                          // e.g., "Medium - Blue"
  sku: string;                                  // Unique SKU
  price: number;                                // Variant price
  stock: number;                                // Stock quantity
  size?: 'small' | 'medium' | 'large' | null;
  color?: string | null;
  material?: string | null;
  images?: {
    image?: number | Media;
    id?: string | null;
  }[] | null;
}
```

---

## Usage Examples

### Basic Product (No Variants)

```typescript
import { useCart } from '@/context/CartContext';
import type { Product } from '@payload-types';

function SimpleProduct({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <button onClick={() => addItem(product, null, 1)}>
      Add to Cart - ${product.basePrice}
    </button>
  );
}
```

### Product with Variants

```typescript
function VariantProduct({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants?.[0]?.id || null
  );

  const selectedVariant = product.variants?.find(v => v.id === selectedVariantId);

  return (
    <div>
      <select onChange={(e) => setSelectedVariantId(e.target.value)}>
        {product.variants?.map((variant) => (
          <option key={variant.id} value={variant.id!}>
            {variant.variantName} - ${variant.price}
          </option>
        ))}
      </select>

      <button
        onClick={() => addItem(product, selectedVariant, 1)}
        disabled={!selectedVariant || selectedVariant.stock === 0}
      >
        Add to Cart
      </button>
    </div>
  );
}
```

### Cart Display

```typescript
function ShoppingCart() {
  const { state, removeItem, updateQuantity } = useCart();

  return (
    <div>
      <h2>Cart ({state.items.length})</h2>

      {state.items.map((item) => (
        <div key={item.id}>
          <img src={item.imageUrl || '/placeholder.jpg'} alt={item.productName} />
          <div>
            <h4>{item.productName}</h4>
            {item.variantName && <p>{item.variantName}</p>}
            <p>${item.price} × {item.quantity}</p>
          </div>
          <input
            type="number"
            min="1"
            max={item.stock}
            value={item.quantity}
            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
          />
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}

      <div>
        <p>Subtotal: ${state.subtotal.toFixed(2)}</p>
        <p>Shipping: {state.shipping === 0 ? 'FREE' : `$${state.shipping.toFixed(2)}`}</p>
        <p>Tax: ${state.tax.toFixed(2)}</p>
        <p><strong>Total: ${state.total.toFixed(2)}</strong></p>
      </div>
    </div>
  );
}
```

### Guest Checkout

```typescript
function GuestCheckout() {
  const { setGuestInfo, state } = useCart();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGuestInfo(email, name);
    // Proceed to payment...
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Continue to Payment</button>
    </form>
  );
}
```

### Conservation Tracking

```typescript
function ConservationImpact() {
  const { state } = useCart();

  const totalDonation = state.items.reduce((sum, item) => {
    if (item.conservationDonationPercentage) {
      const itemTotal = item.price * item.quantity;
      return sum + (itemTotal * (item.conservationDonationPercentage / 100));
    }
    return sum;
  }, 0);

  if (totalDonation === 0) return null;

  return (
    <div className="conservation-impact">
      <h4>Your Conservation Impact</h4>
      <p>
        ${totalDonation.toFixed(2)} will be donated to marine conservation!
      </p>
    </div>
  );
}
```

---

## Features

### 1. Automatic Price Calculations

All calculations happen automatically when items are added, removed, or quantities change:

- **Subtotal**: Sum of all items (price × quantity)
- **Shipping**: $5.95 if subtotal < $50, otherwise FREE
- **Tax**: 8.25% of subtotal
- **Total**: subtotal + shipping + tax

No need to manually call `recalculateTotals()` - it's automatic!

### 2. LocalStorage Persistence

Cart automatically saves to localStorage on every change and loads on mount:

```typescript
// Saved automatically
addItem(product, variant, 1);

// Loaded automatically on next visit
// User's cart persists across page refreshes
```

### 3. Image URL Extraction

The cart automatically extracts the best image URL:
1. Tries variant images first (if variant selected)
2. Falls back to product images
3. Returns `null` if no images available

```typescript
// No need to manually handle Media objects
<img src={item.imageUrl || '/placeholder.jpg'} />
```

### 4. Conservation Info

Products with conservation information automatically include it in cart items:

```typescript
{item.conservationDonationPercentage && (
  <span>
    {item.conservationDonationPercentage}% supports {item.conservationFocus}
  </span>
)}
```

### 5. Stock Tracking

Each cart item includes current stock level for validation:

```typescript
<input
  type="number"
  max={item.stock}  // Prevent over-ordering
  value={item.quantity}
  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
/>
```

---

## Business Logic

### Shipping Threshold

```typescript
const shipping = subtotal > 50 ? 0 : 5.95;
```

- Orders **under $50**: $5.95 shipping
- Orders **$50 or more**: FREE shipping

### Tax Rate

```typescript
const tax = subtotal * 0.0825; // 8.25%
```

Fixed at **8.25%** (Texas state sales tax rate).

### Conservation Donations

Default: **10%** of product price (configurable per product in Payload admin)

```typescript
const donation = itemTotal * (donationPercentage / 100);
```

---

## Cart Item IDs

Cart items are uniquely identified:

- **With variant**: `variantId` (e.g., `"var-abc123"`)
- **Without variant**: `"product-{productId}"` (e.g., `"product-42"`)

This ensures:
- Same product with different variants = separate cart items
- Same product without variant = single cart item (quantity increments)

---

## Integration with Payload CMS

### Current Implementation

- Uses Payload `Product` type from `payload-types.ts`
- Cart stored client-side in localStorage
- Conservation info from `product.conservationInfo`
- Media objects automatically resolved to URLs

### Future: API Sync

The `syncWithPayload()` function is prepared for backend integration:

```typescript
// When user logs in
useEffect(() => {
  if (userId) {
    syncWithPayload(userId);
  }
}, [userId]);
```

This will:
1. Send local cart to Payload API
2. Merge with user's saved cart (if any)
3. Update local cart with merged result
4. Keep carts synced across devices

**API endpoint to implement**: `POST /api/cart/sync`

---

## File Structure

```
src/context/
├── CartContext.tsx              # Main implementation
├── CartContext.example.tsx      # Usage examples
├── CartContext.test.md          # Test scenarios
├── MIGRATION_GUIDE.md           # Migration from old CartContext
└── README.md                    # This file
```

---

## Testing

See `CartContext.test.md` for comprehensive test scenarios covering:
- Adding products (base and variants)
- Removing items
- Updating quantities
- Price calculations
- localStorage persistence
- Guest checkout
- Conservation tracking
- Edge cases

---

## Migration

If migrating from the old Drizzle-based CartContext, see `MIGRATION_GUIDE.md` for:
- Type changes
- Function signature changes
- Code examples
- Common pitfalls
- Testing checklist

---

## Troubleshooting

### Cart doesn't persist

**Problem**: Cart resets on page refresh

**Solution**: Check browser localStorage is enabled and not full

```typescript
// Check if localStorage is available
if (typeof window !== 'undefined') {
  console.log(localStorage.getItem('shenna-cart'));
}
```

### Images not displaying

**Problem**: `item.imageUrl` is null

**Solution**: Ensure products have images in Payload admin with proper Media uploads

### Variant not found

**Problem**: "Cannot read property 'price' of undefined"

**Solution**: Check variant exists before adding:

```typescript
const variant = product.variants?.find(v => v.id === selectedId);
if (variant) {
  addItem(product, variant, 1);
}
```

### Type errors with imports

**Problem**: "Cannot find module '@payload-types'"

**Solution**: Ensure `tsconfig.json` includes the path alias:

```json
{
  "compilerOptions": {
    "paths": {
      "@payload-types": ["./payload-types.ts"]
    }
  }
}
```

Then run: `npm run payload:generate` to regenerate types

---

## Related Documentation

- **Payload CMS**: `/payload-config.ts` - CMS configuration
- **Product Collection**: `/src/collections/Products.ts` - Product schema
- **Order Collection**: `/src/collections/Orders.ts` - Order schema
- **Type Definitions**: `/payload-types.ts` - Auto-generated types

---

## Support

For questions or issues:
1. Check the examples in `CartContext.example.tsx`
2. Review test scenarios in `CartContext.test.md`
3. See migration guide in `MIGRATION_GUIDE.md`
4. Verify Payload types are up to date: `npm run payload:generate`

---

## Version History

**v2.0.0** (Current)
- Complete rewrite for Payload CMS integration
- Added localStorage persistence
- Added guest checkout support
- Added conservation tracking
- Added API sync preparation
- Automatic price calculations
- Flattened cart item structure

**v1.0.0** (Legacy)
- Original implementation with Drizzle ORM types
- Manual total calculations
- No persistence
- No guest checkout

---

## License

Part of the ShennaStudio e-commerce platform.
