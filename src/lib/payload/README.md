# Payload API Client - Quick Reference

## Installation

All utilities are already set up. Just import what you need:

```typescript
import { getProducts, createOrder, formatPrice } from '@/lib/payload'
```

## Common Imports

### For Product Pages

```typescript
import {
  getProducts,
  getFeaturedProducts,
  getProduct,
  searchProducts,
  formatProductPrice,
  getProductImageUrl,
} from '@/lib/payload'
```

### For Category Pages

```typescript
import {
  getCategories,
  getCategoryBySlug,
  getProductsByCategory,
} from '@/lib/payload'
```

### For Checkout

```typescript
import {
  createOrder,
  cartToOrderItems,
  checkInventoryAvailability,
  calculateOrderTotals,
} from '@/lib/payload'
```

### For Authentication

```typescript
import {
  loginUser,
  logoutUser,
  registerUser,
  getAuthenticatedUser,
  isAuthenticated,
} from '@/lib/payload'
```

## Quick Examples

### Fetch Products (Server Component)

```typescript
export default async function ProductsPage() {
  const { docs: products } = await getProducts({ status: 'active', limit: 20 })
  return <ProductGrid products={products} />
}
```

### Create Order (Server Action)

```typescript
'use server'

import { createOrder } from '@/lib/payload'

export async function checkout(formData: FormData) {
  const result = await createOrder({
    customerEmail: formData.get('email') as string,
    // ... other fields
  })

  return result
}
```

### Check Auth (Server Component)

```typescript
import { getAuthenticatedUser } from '@/lib/payload'

export default async function AccountPage() {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/login')
  return <div>Welcome {user.firstName}!</div>
}
```

### Add to Cart (Client Component)

```typescript
'use client'

import { useCart } from '@/context/CartContext'
import { createCartItemFromPayload } from '@/lib/payload'

export function AddToCart({ product, variantSku }) {
  const { addItem } = useCart()

  const handleAdd = () => {
    const cartItem = createCartItemFromPayload(product, variantSku, 1)
    if (cartItem) {
      addItem(cartItem.variant, cartItem.product, 1)
    }
  }

  return <button onClick={handleAdd}>Add to Cart</button>
}
```

## File Structure

```
src/lib/
├── payload-client.ts      # Data fetching (Server & Client)
├── payload-api.ts         # Server Actions & mutations
├── type-adapters.ts       # Type conversions & utilities
├── payload/
│   ├── index.ts          # Consolidated exports
│   └── README.md         # This file
└── PAYLOAD_CLIENT_USAGE.md  # Detailed guide
```

## Key Concepts

### Server Components
- Can directly call async functions
- Use for data fetching
- Automatic caching

### Server Actions
- For mutations (create, update, delete)
- Use 'use server' directive
- Run on the server only

### Client Components
- Cannot directly fetch from Payload
- Use Server Actions for mutations
- Use props passed from Server Components

## Type Safety

All functions use types from `payload-types.ts`:

```typescript
import type { Product, Order, Category } from '@/../../payload-types'
```

## Environment Setup

Required in `.env.local`:

```bash
PAYLOAD_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

## Next Steps

1. Read `PAYLOAD_CLIENT_USAGE.md` for detailed examples
2. Check `src/components/examples/PayloadProductCard.tsx` for component examples
3. Review `PAYLOAD_API_CLIENT.md` for complete documentation

## Support

- Detailed docs: `/PAYLOAD_API_CLIENT.md`
- Usage guide: `/src/lib/PAYLOAD_CLIENT_USAGE.md`
- Example components: `/src/components/examples/`
- Project docs: `/CLAUDE.md`
