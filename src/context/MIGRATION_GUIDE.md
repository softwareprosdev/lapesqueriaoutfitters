# CartContext Migration Guide

This guide explains how to migrate existing components from the old CartContext (using Drizzle types) to the new CartContext (using Payload CMS types).

---

## Key Changes Summary

### 1. Import Changes

**Before:**
```typescript
import { CartItem, ProductVariant, Product } from '@/types';
import { useCart } from '@/context/CartContext';
```

**After:**
```typescript
import type { Product } from '@payload-types';
import { useCart, PayloadProductVariant, PayloadCartItem } from '@/context/CartContext';
```

---

### 2. Type Changes

#### Old Types (Drizzle ORM)
```typescript
interface Product {
  id: number;
  name: string;
  basePrice: number;
  variants?: ProductVariant[];
}

interface ProductVariant {
  id: number;        // number
  productId: number;
  size: string | null;
  price: number;
  stock: number;
  images: string[];  // array of strings
}

interface CartItem {
  id: string;
  variant: ProductVariant;
  product: Product;
  quantity: number;
}
```

#### New Types (Payload CMS)
```typescript
interface Product {
  id: number;
  name: string;
  basePrice: number;
  variants?: {
    id?: string | null;           // string | null
    variantName: string;
    sku: string;
    price: number;
    stock: number;
    size?: 'small' | 'medium' | 'large' | null;
    color?: string | null;
    material?: string | null;
    images?: {                     // array of Media objects
      image?: number | Media;
      id?: string | null;
    }[] | null;
  }[] | null;
  conservationInfo?: {
    donationPercentage?: number | null;
    conservationFocus?: string | null;
  };
}

interface PayloadProductVariant {
  id?: string | null;
  variantName: string;
  sku: string;
  price: number;
  stock: number;
  size?: 'small' | 'medium' | 'large' | null;
  color?: string | null;
  material?: string | null;
  images?: {
    image?: number | Media;
    id?: string | null;
  }[] | null;
}

interface PayloadCartItem {
  id: string;
  productId: number;
  productName: string;
  productSku: string;
  variantId?: string | null;
  variantName?: string | null;
  variantSku?: string | null;
  price: number;
  quantity: number;
  stock: number;
  imageUrl?: string | null;
  conservationDonationPercentage?: number | null;
  conservationFocus?: string | null;
}
```

---

### 3. Function Signature Changes

#### `addItem` Function

**Before:**
```typescript
addItem(variant: ProductVariant, product: Product, quantity?: number)
```

**After:**
```typescript
addItem(product: Product, variant?: PayloadProductVariant | null, quantity?: number)
```

**Key Differences:**
- Product comes FIRST (was second)
- Variant comes SECOND (was first) and is OPTIONAL
- Variant can be `null` for base products

---

### 4. Migration Examples

#### Example 1: Simple Product (No Variants)

**Before:**
```typescript
function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();

  // Had to create a fake variant
  const baseVariant: ProductVariant = {
    id: product.id,
    productId: product.id,
    size: null,
    price: product.basePrice,
    stock: 999,
    images: product.images,
    // ... other required fields
  };

  return (
    <button onClick={() => addItem(baseVariant, product, 1)}>
      Add to Cart
    </button>
  );
}
```

**After:**
```typescript
function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();

  // Much simpler - just pass product and null for variant
  return (
    <button onClick={() => addItem(product, null, 1)}>
      Add to Cart
    </button>
  );
}
```

---

#### Example 2: Product with Variants

**Before:**
```typescript
function VariantSelector({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

  const selectedVariant = product.variants?.find(v => v.id === selectedVariantId);

  const handleAddToCart = () => {
    if (selectedVariant) {
      addItem(selectedVariant, product, 1);  // variant first, product second
    }
  };

  return (
    <div>
      <select onChange={(e) => setSelectedVariantId(Number(e.target.value))}>
        {product.variants?.map((variant) => (
          <option key={variant.id} value={variant.id}>
            {variant.size} - ${variant.price}
          </option>
        ))}
      </select>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
}
```

**After:**
```typescript
function VariantSelector({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const selectedVariant = product.variants?.find(v => v.id === selectedVariantId);

  const handleAddToCart = () => {
    if (selectedVariant) {
      // Convert to PayloadProductVariant (optional, types are compatible)
      const variant: PayloadProductVariant = {
        id: selectedVariant.id,
        variantName: selectedVariant.variantName,
        sku: selectedVariant.sku,
        price: selectedVariant.price,
        stock: selectedVariant.stock,
        size: selectedVariant.size,
        color: selectedVariant.color,
        material: selectedVariant.material,
        images: selectedVariant.images,
      };

      addItem(product, variant, 1);  // product first, variant second
    }
  };

  return (
    <div>
      <select onChange={(e) => setSelectedVariantId(e.target.value)}>
        {product.variants?.map((variant) => (
          <option key={variant.id} value={variant.id!}>
            {variant.variantName} - ${variant.price}
          </option>
        ))}
      </select>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
}
```

**Key Changes:**
1. `selectedVariantId` is now `string | null` instead of `number | null`
2. Parameter order reversed in `addItem`: product first, variant second
3. Variant has `variantName` instead of just using size/color
4. Convert `e.target.value` directly (no `Number()` needed)

---

#### Example 3: Cart Display Component

**Before:**
```typescript
function CartItem({ item }: { item: CartItem }) {
  const { removeItem, updateQuantity } = useCart();

  return (
    <div>
      <img src={item.variant.images[0]} alt={item.product.name} />
      <h4>{item.product.name}</h4>
      <p>Size: {item.variant.size}</p>
      <p>Price: ${item.variant.price}</p>
      <input
        type="number"
        value={item.quantity}
        onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
      />
      <button onClick={() => removeItem(item.id)}>Remove</button>
    </div>
  );
}
```

**After:**
```typescript
function CartItem({ item }: { item: PayloadCartItem }) {
  const { removeItem, updateQuantity } = useCart();

  return (
    <div>
      {item.imageUrl && <img src={item.imageUrl} alt={item.productName} />}
      <h4>{item.productName}</h4>
      {item.variantName && <p>Variant: {item.variantName}</p>}
      <p>SKU: {item.variantSku || item.productSku}</p>
      <p>Price: ${item.price}</p>
      <input
        type="number"
        value={item.quantity}
        max={item.stock}
        onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
      />
      <button onClick={() => removeItem(item.id)}>Remove</button>

      {/* New: Conservation info */}
      {item.conservationDonationPercentage && (
        <p className="conservation">
          {item.conservationDonationPercentage}% supports conservation
        </p>
      )}
    </div>
  );
}
```

**Key Changes:**
1. Cart item structure is flattened - all info at top level
2. Image URL is pre-extracted (string), not an array
3. Product name and SKU are included in cart item
4. Variant info is optional (may be null for base products)
5. Stock limit is available for quantity validation
6. Conservation info is now available in cart items

---

#### Example 4: Cart Summary/Totals

**Before:**
```typescript
function CartSummary() {
  const { state, updateTotals } = useCart();

  useEffect(() => {
    updateTotals();
  }, [state.items, updateTotals]);

  return (
    <div>
      <p>Subtotal: ${state.subtotal.toFixed(2)}</p>
      <p>Shipping: ${state.shipping.toFixed(2)}</p>
      <p>Tax: ${state.tax.toFixed(2)}</p>
      <p>Total: ${state.total.toFixed(2)}</p>
    </div>
  );
}
```

**After:**
```typescript
function CartSummary() {
  const { state } = useCart();

  // No need to manually call updateTotals - it's automatic!

  return (
    <div>
      <p>Subtotal: ${state.subtotal.toFixed(2)}</p>
      <p>
        Shipping: {state.shipping === 0 ? 'FREE' : `$${state.shipping.toFixed(2)}`}
        {state.subtotal < 50 && ' (Free over $50)'}
      </p>
      <p>Tax (8.25%): ${state.tax.toFixed(2)}</p>
      <p>Total: ${state.total.toFixed(2)}</p>
    </div>
  );
}
```

**Key Changes:**
1. No need to manually call `updateTotals()` - calculations are automatic
2. Shipping threshold ($50) is clearly communicated
3. Tax rate (8.25%) is explicit

---

### 5. New Features Available

#### Feature 1: Guest Checkout Support

```typescript
function CheckoutForm() {
  const { setGuestInfo } = useCart();

  const handleGuestCheckout = (email: string, name: string) => {
    setGuestInfo(email, name);
    // Proceed to payment...
  };

  return (/* form */);
}
```

#### Feature 2: Cart Persistence (Automatic)

Cart now automatically persists to localStorage and loads on mount. No action needed!

```typescript
// Old: Had to manually save/load
localStorage.setItem('cart', JSON.stringify(cart));

// New: Automatic! Just use the cart as normal
addItem(product, variant, 1); // Automatically saves
```

#### Feature 3: Conservation Info in Cart

```typescript
function ConservationSummary() {
  const { state } = useCart();

  const totalDonation = state.items.reduce((sum, item) => {
    if (item.conservationDonationPercentage) {
      return sum + (item.price * item.quantity * item.conservationDonationPercentage / 100);
    }
    return sum;
  }, 0);

  return <p>Conservation contribution: ${totalDonation.toFixed(2)}</p>;
}
```

#### Feature 4: Payload API Sync (For Logged-in Users)

```typescript
function UserDashboard({ userId }: { userId: number }) {
  const { syncWithPayload } = useCart();

  useEffect(() => {
    // Sync cart when user logs in
    syncWithPayload(userId);
  }, [userId, syncWithPayload]);

  return (/* dashboard */);
}
```

---

### 6. Quick Reference: Context API Changes

| Function | Old Signature | New Signature |
|----------|---------------|---------------|
| `addItem` | `(variant, product, qty?)` | `(product, variant?, qty?)` |
| `removeItem` | `(id: string)` | `(id: string)` ✓ No change |
| `updateQuantity` | `(id: string, qty: number)` | `(id: string, qty: number)` ✓ No change |
| `clearCart` | `()` | `()` ✓ No change |
| `toggleCart` | `()` | `()` ✓ No change |
| `updateTotals` | `()` | Removed (automatic) |
| `setGuestInfo` | N/A | `(email?, name?)` NEW |
| `syncWithPayload` | N/A | `(userId?)` NEW |
| `recalculateTotals` | N/A | `()` NEW |

---

### 7. Common Pitfalls

#### Pitfall 1: Wrong Parameter Order

```typescript
// ❌ WRONG (old order)
addItem(variant, product, 1);

// ✅ CORRECT (new order)
addItem(product, variant, 1);
```

#### Pitfall 2: Not Handling Null Variants

```typescript
// ❌ WRONG - crashes if no variants
const variant = product.variants[0];
addItem(product, variant, 1);

// ✅ CORRECT - handle missing variants
const variant = product.variants?.[0] || null;
addItem(product, variant, 1);
```

#### Pitfall 3: Treating Images as Strings

```typescript
// ❌ WRONG (old way)
<img src={variant.images[0]} />

// ✅ CORRECT (new way - use pre-extracted URL)
{item.imageUrl && <img src={item.imageUrl} />}
```

#### Pitfall 4: Using Number IDs for Variants

```typescript
// ❌ WRONG (variants use string IDs in Payload)
setSelectedVariantId(Number(e.target.value));

// ✅ CORRECT
setSelectedVariantId(e.target.value);
```

---

### 8. Testing Checklist

After migrating a component, verify:

- [ ] Component compiles without TypeScript errors
- [ ] Adding to cart works (check browser console for errors)
- [ ] Cart totals calculate correctly
- [ ] Images display properly
- [ ] Variant selection works (if applicable)
- [ ] Quantity updates work
- [ ] Item removal works
- [ ] Cart persists after page refresh
- [ ] Conservation info displays (if product has it)

---

### 9. Gradual Migration Strategy

You can migrate components gradually:

1. **Update CartContext first** (already done)
2. **Create wrapper functions** for backward compatibility (optional):

```typescript
// src/context/CartContextLegacy.ts
import { useCart } from './CartContext';
import type { ProductVariant, Product } from '@/types';

// Legacy wrapper (deprecated - migrate to new API)
export function useLegacyCart() {
  const cart = useCart();

  const legacyAddItem = (variant: ProductVariant, product: Product, quantity = 1) => {
    console.warn('Using legacy addItem - please migrate to new API');
    // Convert old types to new types and call new API
    // ... conversion logic ...
    cart.addItem(product, null, quantity);
  };

  return {
    ...cart,
    addItem: legacyAddItem,
  };
}
```

3. **Migrate components one by one**
4. **Remove legacy wrapper** when all components are migrated

---

### 10. Getting Help

If you encounter issues during migration:

1. Check the examples in `CartContext.example.tsx`
2. Review the test scenarios in `CartContext.test.md`
3. Verify your product data structure matches Payload types
4. Check browser console for detailed error messages
5. Ensure `@payload-types` import is working correctly

---

## Summary

The new CartContext is more flexible, feature-rich, and better integrated with Payload CMS. Key improvements:

- **Simpler API**: No need to create fake variants for base products
- **Automatic persistence**: Cart saves to localStorage automatically
- **Conservation tracking**: Built-in support for conservation donations
- **Guest checkout**: Built-in fields for guest user info
- **Better type safety**: Uses official Payload types
- **Automatic calculations**: Totals update automatically
- **Future-proof**: Ready for Payload API integration

The migration is straightforward - mostly parameter order changes and type updates. Most logic remains the same!
