# CartContext Test Guide

This document outlines test scenarios for the updated CartContext with Payload CMS integration.

## Test Scenarios

### 1. Adding Products to Cart

#### Test 1.1: Add Base Product (No Variants)
```typescript
const product: Product = {
  id: 1,
  name: "Ocean Wave Bracelet",
  basePrice: 24.99,
  sku: "OWB-001",
  inStock: true,
  // ... other fields
};

// Expected: Cart item with price = 24.99
addItem(product, null, 1);
```

**Expected Results:**
- Cart item ID: `product-1`
- Price: $24.99
- Quantity: 1
- Subtotal: $24.99
- Shipping: $5.95 (under $50)
- Tax: $2.06 (8.25%)
- Total: $33.00

---

#### Test 1.2: Add Product with Variant
```typescript
const product: Product = {
  id: 2,
  name: "Sea Glass Bracelet",
  basePrice: 29.99,
  variants: [{
    id: "var-1",
    variantName: "Medium - Blue",
    sku: "SGB-M-BLU",
    price: 34.99,
    stock: 15,
    size: "medium",
    color: "blue"
  }]
};

const variant: PayloadProductVariant = product.variants[0];
addItem(product, variant, 1);
```

**Expected Results:**
- Cart item ID: `var-1`
- Price: $34.99 (variant price, not base price)
- Variant name: "Medium - Blue"
- Stock: 15

---

#### Test 1.3: Add Same Item Twice (Should Increment Quantity)
```typescript
// First add
addItem(product, variant, 1);
// Second add
addItem(product, variant, 1);
```

**Expected Results:**
- Cart should have 1 item (not 2)
- Quantity: 2
- Subtotal: $69.98 (34.99 × 2)

---

### 2. Price Calculations

#### Test 2.1: Shipping Threshold
```typescript
// Scenario A: Under $50 (should charge shipping)
// Product: $45.00
// Expected shipping: $5.95

// Scenario B: Over $50 (free shipping)
// Product: $55.00
// Expected shipping: $0.00
```

**Test Implementation:**
```typescript
// Under threshold
addItem(productA, null, 1); // $45.00
// Expected: shipping = $5.95

clearCart();

// Over threshold
addItem(productB, null, 1); // $55.00
// Expected: shipping = $0.00
```

---

#### Test 2.2: Tax Calculation (8.25%)
```typescript
const product = { basePrice: 100.00, /* ... */ };
addItem(product, null, 1);

// Expected:
// Subtotal: $100.00
// Tax: $8.25 (100.00 × 0.0825)
// Shipping: $0.00 (over $50)
// Total: $108.25
```

---

### 3. Cart Operations

#### Test 3.1: Update Quantity
```typescript
addItem(product, variant, 1);
const itemId = state.items[0].id;

updateQuantity(itemId, 3);
// Expected: quantity = 3, subtotal updates accordingly
```

---

#### Test 3.2: Update Quantity to 0 (Should Remove)
```typescript
addItem(product, variant, 2);
const itemId = state.items[0].id;

updateQuantity(itemId, 0);
// Expected: item removed from cart, cart should be empty
```

---

#### Test 3.3: Remove Item
```typescript
addItem(product, variant, 1);
const itemId = state.items[0].id;

removeItem(itemId);
// Expected: cart is empty, totals reset to 0
```

---

#### Test 3.4: Clear Cart
```typescript
addItem(product1, null, 1);
addItem(product2, variant, 2);

clearCart();
// Expected:
// - items = []
// - subtotal = 0
// - tax = 0
// - total = 0
// - localStorage cleared
```

---

### 4. LocalStorage Persistence

#### Test 4.1: Cart Persists on Reload
```typescript
// 1. Add items to cart
addItem(product, variant, 1);

// 2. Refresh page
// 3. Check localStorage
const savedCart = localStorage.getItem('shenna-cart');
// Expected: savedCart contains cart state

// 4. Cart should auto-load on mount
// Expected: state.items.length > 0
```

---

#### Test 4.2: Invalid localStorage Data (Should Not Crash)
```typescript
// 1. Set invalid data in localStorage
localStorage.setItem('shenna-cart', 'invalid json');

// 2. Reload CartProvider
// Expected:
// - Console error logged
// - Cart initializes to empty state
```

---

### 5. Guest Checkout

#### Test 5.1: Set Guest Info
```typescript
setGuestInfo("guest@example.com", "John Doe");

// Expected:
// state.guestEmail = "guest@example.com"
// state.guestName = "John Doe"
```

---

#### Test 5.2: Partial Guest Info
```typescript
setGuestInfo("guest@example.com"); // No name provided

// Expected:
// state.guestEmail = "guest@example.com"
// state.guestName = null (or previous value if set)
```

---

### 6. Conservation Tracking

#### Test 6.1: Product with Conservation Info
```typescript
const product: Product = {
  id: 1,
  name: "Coral Reef Bracelet",
  basePrice: 29.99,
  conservationInfo: {
    donationPercentage: 15,
    conservationFocus: "Coral Reef Restoration"
  }
};

addItem(product, null, 1);

// Expected cart item:
// conservationDonationPercentage: 15
// conservationFocus: "Coral Reef Restoration"

// Donation amount: $29.99 × 0.15 = $4.50
```

---

#### Test 6.2: Product without Conservation Info
```typescript
const product: Product = {
  id: 2,
  name: "Regular Bracelet",
  basePrice: 19.99,
  // No conservationInfo
};

addItem(product, null, 1);

// Expected cart item:
// conservationDonationPercentage: null
// conservationFocus: null
```

---

### 7. Image Handling

#### Test 7.1: Variant Image (Should Take Priority)
```typescript
const product: Product = {
  images: [{ image: { url: "/product.jpg" } }],
  variants: [{
    images: [{ image: { url: "/variant-blue.jpg" } }],
    // ...
  }]
};

const variant = product.variants[0];
addItem(product, variant, 1);

// Expected:
// state.items[0].imageUrl = "/variant-blue.jpg" (variant image, not product image)
```

---

#### Test 7.2: No Variant Image (Use Product Image)
```typescript
const product: Product = {
  images: [{ image: { url: "/product.jpg" } }],
  variants: [{
    images: null, // No variant images
    // ...
  }]
};

const variant = product.variants[0];
addItem(product, variant, 1);

// Expected:
// state.items[0].imageUrl = "/product.jpg" (falls back to product image)
```

---

#### Test 7.3: No Images at All
```typescript
const product: Product = {
  images: [],
  variants: [{
    images: null,
    // ...
  }]
};

const variant = product.variants[0];
addItem(product, variant, 1);

// Expected:
// state.items[0].imageUrl = null
```

---

### 8. Multiple Items in Cart

#### Test 8.1: Different Products
```typescript
addItem(product1, null, 1);        // $24.99
addItem(product2, variant2, 2);    // $34.99 × 2 = $69.98

// Expected:
// items.length = 2
// subtotal = $94.97
// shipping = $0.00 (over $50)
// tax = $7.83
// total = $102.80
```

---

#### Test 8.2: Same Product, Different Variants
```typescript
const product: Product = { /* ... */ };
const variantSmall = product.variants[0]; // Small - $29.99
const variantLarge = product.variants[1]; // Large - $34.99

addItem(product, variantSmall, 1);
addItem(product, variantLarge, 1);

// Expected:
// items.length = 2 (different cart item IDs)
// Item 1: variantSmall, qty 1
// Item 2: variantLarge, qty 1
```

---

### 9. Payload API Sync (Future Implementation)

#### Test 9.1: Sync for Logged-in User
```typescript
// Mock user ID
const userId = 123;

// Add items to local cart
addItem(product, variant, 1);

// Sync with Payload
await syncWithPayload(userId);

// Expected:
// - POST request to /api/cart/sync
// - Request body includes userId and items
// - Local cart updates with server response
```

---

#### Test 9.2: Sync Without User ID (Should Warn)
```typescript
await syncWithPayload(); // No userId

// Expected:
// - Console warning logged
// - No API call made
```

---

#### Test 9.3: Sync API Failure (Should Not Break Cart)
```typescript
// Mock API failure
fetch.mockRejectedValue(new Error('Network error'));

await syncWithPayload(123);

// Expected:
// - Console error logged
// - Local cart remains unchanged
// - No exception thrown
```

---

### 10. Edge Cases

#### Test 10.1: Add Item with Quantity 0
```typescript
addItem(product, null, 0);

// Expected:
// Item not added to cart (or added then removed)
```

---

#### Test 10.2: Update to Negative Quantity
```typescript
addItem(product, null, 1);
updateQuantity(itemId, -5);

// Expected:
// Item removed (quantity clamped to 0, then filtered out)
```

---

#### Test 10.3: Product with Null/Undefined Variant
```typescript
const product: Product = {
  variants: null
};

addItem(product, null, 1);

// Expected:
// Uses basePrice, no variant info in cart item
```

---

## Test Coverage Checklist

- [ ] Add base product (no variant)
- [ ] Add product with variant
- [ ] Add same item twice (quantity increment)
- [ ] Remove item
- [ ] Update quantity
- [ ] Update quantity to 0 (removal)
- [ ] Clear cart
- [ ] Shipping threshold ($50)
- [ ] Tax calculation (8.25%)
- [ ] Total calculation
- [ ] localStorage persistence
- [ ] localStorage load on mount
- [ ] Guest info (email/name)
- [ ] Conservation tracking
- [ ] Image URL extraction (variant priority)
- [ ] Image URL extraction (product fallback)
- [ ] Multiple items in cart
- [ ] Same product, different variants
- [ ] Toggle cart open/close
- [ ] Recalculate totals
- [ ] API sync (mocked)
- [ ] Edge cases (0 quantity, negative, null)

---

## Manual Testing Steps

1. **Setup:**
   - Start dev server: `npm run dev`
   - Open browser console
   - Navigate to a product page

2. **Test Add to Cart:**
   - Click "Add to Cart" for a product without variants
   - Verify cart badge shows (1)
   - Open cart modal/sidebar
   - Verify product appears with correct price

3. **Test Variant Selection:**
   - Select different size/color/material
   - Click "Add to Cart"
   - Verify correct variant is in cart (not base product)
   - Verify variant price is used

4. **Test Quantity Updates:**
   - In cart, increase quantity
   - Verify subtotal updates
   - Verify tax recalculates
   - Verify shipping adjusts at $50 threshold

5. **Test Persistence:**
   - Add items to cart
   - Refresh page
   - Verify cart persists

6. **Test Guest Checkout:**
   - Proceed to checkout without logging in
   - Enter email and name
   - Verify guest info is stored in cart state

7. **Test Conservation Display:**
   - Add product with conservation info
   - Verify conservation percentage shows in cart
   - Calculate expected donation amount

---

## Integration Test with Payload CMS

1. Create test product in Payload admin:
   ```
   Name: Test Bracelet
   Base Price: $29.99
   SKU: TEST-001
   Variants:
     - Small ($29.99)
     - Medium ($34.99)
     - Large ($39.99)
   Conservation: 10%
   ```

2. Fetch product via API:
   ```typescript
   const res = await fetch('/api/products/TEST-001');
   const { doc: product } = await res.json();
   ```

3. Add to cart and verify all fields are populated correctly

4. Complete checkout flow (when implemented)
