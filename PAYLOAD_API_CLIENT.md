# Payload API Client & Data Access Layer

## Overview

A comprehensive, type-safe data access layer for integrating Payload CMS with the ShennaStudio Next.js frontend. This implementation provides clean abstractions for working with Payload data in both Server Components and Client Components, following Next.js 16 best practices.

## Architecture

### Dual Database System

The application uses two separate database systems:

1. **Drizzle ORM** - Legacy custom tables (to be phased out)
2. **Payload CMS** - New headless CMS with admin panel

The Payload API client provides a bridge to transition from temporary data to the Payload CMS backend.

## Files Created

### Core Files

1. **`src/lib/payload-client.ts`** (603 lines)
   - Client-side data fetching functions
   - Type-safe API calls using Payload's generated types
   - Support for both Server and Client Components
   - Utility functions for working with Payload data

2. **`src/lib/payload-api.ts`** (790 lines)
   - Server Actions for mutations
   - Order creation and management
   - Inventory management
   - Authentication helpers
   - Cart-to-order conversion utilities

3. **`src/lib/type-adapters.ts`** (421 lines)
   - Conversion between Payload types and application types
   - Display utilities for products and variants
   - Filtering and sorting helpers
   - Stock status utilities

4. **`src/lib/payload/index.ts`** (102 lines)
   - Consolidated exports for easy importing
   - Single import point for all Payload utilities

### Documentation & Examples

5. **`src/lib/PAYLOAD_CLIENT_USAGE.md`**
   - Comprehensive usage guide
   - Code examples for common scenarios
   - Best practices and patterns

6. **`src/components/examples/PayloadProductCard.tsx`**
   - Example React components
   - Demonstrates practical usage
   - Three variants: Full card, Simple card, List item

## Key Features

### Type Safety

- Uses Payload's auto-generated types from `payload-types.ts`
- Full TypeScript support throughout
- No type assertions or `any` types

### Next.js 16 Patterns

- Server Components for data fetching
- Server Actions for mutations
- Proper cache handling
- Edge-compatible

### Error Handling

- Comprehensive try-catch blocks
- Meaningful error messages
- Graceful fallbacks

### Authentication

- JWT token management via cookies
- Role-based access control
- Support for both authenticated and guest users

### Inventory Management

- Stock checking before checkout
- Automatic inventory updates on orders
- Restock capabilities for admins

### Conservation Integration

- Calculate donation amounts
- Track conservation info per product
- Display conservation focus

## Quick Start

### Import Everything

```typescript
// Single import for all utilities
import {
  getProducts,
  getFeaturedProducts,
  createOrder,
  loginUser,
  formatProductPrice,
} from '@/lib/payload'
```

### Server Component Example

```typescript
// app/products/page.tsx
import { getProducts, formatProductPrice } from '@/lib/payload'

export default async function ProductsPage() {
  const { docs: products } = await getProducts({
    status: 'active',
    limit: 20,
  })

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h2>{product.name}</h2>
          <p>{formatProductPrice(product)}</p>
        </div>
      ))}
    </div>
  )
}
```

### Server Action Example

```typescript
'use server'

import { createOrder, cartToOrderItems } from '@/lib/payload'

export async function handleCheckout(formData: FormData) {
  const result = await createOrder({
    customerEmail: formData.get('email') as string,
    customerFirstName: formData.get('firstName') as string,
    customerLastName: formData.get('lastName') as string,
    // ... more fields
  })

  if (result.success) {
    redirect(`/orders/${result.order.orderNumber}/success`)
  }

  return result
}
```

## API Reference

### Products

```typescript
// Get all products with filtering
getProducts(options?: {
  featured?: boolean
  status?: 'draft' | 'active' | 'archived'
  category?: number
  inStock?: boolean
  limit?: number
  page?: number
})

// Get single product
getProduct(id: number, depth?: number)

// Get product by SKU
getProductBySku(sku: string, depth?: number)

// Search products
searchProducts(query: string, options?: QueryOptions)

// Get featured products
getFeaturedProducts(limit?: number)
```

### Categories

```typescript
// Get all categories
getCategories(options?: QueryOptions)

// Get single category
getCategory(id: number, depth?: number)

// Get category by slug
getCategoryBySlug(slug: string, depth?: number)

// Get products in category
getProductsByCategory(categoryId: number, options?: QueryOptions)
```

### Orders

```typescript
// Create order (Server Action)
createOrder(input: CreateOrderInput)

// Update order status
updateOrderStatus(orderId: number, status: Order['status'])

// Add tracking info
addOrderTracking(orderId: number, trackingNumber: string, carrier: Order['carrier'])

// Get user's orders
getOrders(options?: QueryOptions, token?: string)

// Get single order
getOrder(id: number, token?: string, depth?: number)
```

### Authentication

```typescript
// Login user
loginUser(email: string, password: string)

// Logout user
logoutUser()

// Register new user
registerUser(data: {
  email: string
  password: string
  firstName: string
  lastName: string
})

// Get current user
getAuthenticatedUser()

// Check auth status
isAuthenticated()
isAdmin()
isStaff()
```

### Inventory

```typescript
// Check inventory availability
checkInventoryAvailability(items: Array<{
  variantSku: string
  quantity: number
}>)

// Increment inventory (restock)
incrementInventory(variantSku: string, quantity: number)

// Decrement happens automatically on order creation
```

### Utilities

```typescript
// Media URLs
getMediaUrl(media: Media | number | null)
getProductImageUrl(product: Product)
getVariantImageUrl(product: Product, variantId?: string)

// Product helpers
hasVariants(product: Product)
getVariantBySku(product: Product, sku: string)
isVariantInStock(variant: Product['variants'][0])
getAvailableSizes(product: Product)
getAvailableColors(product: Product)
getAvailableMaterials(product: Product)

// Conservation
calculateConservationDonation(product: Product, price: number)

// Formatting
formatPrice(amount: number)
formatProductPrice(product: Product)
getProductPriceRange(product: Product)

// Validation
isValidEmail(email: string)
isValidZipCode(zipCode: string)
```

## Usage Patterns

### Server Components (Recommended)

Server Components can directly call the async functions:

```typescript
export default async function Page() {
  const products = await getFeaturedProducts()
  return <ProductGrid products={products} />
}
```

### Client Components

Client Components should use Server Actions or API routes:

```typescript
'use client'

import { loginUser } from '@/lib/payload'

export function LoginForm() {
  async function handleLogin(formData: FormData) {
    const result = await loginUser(
      formData.get('email') as string,
      formData.get('password') as string
    )
    // Handle result
  }

  return <form action={handleLogin}>...</form>
}
```

### Type Adapters

Convert between Payload types and application types:

```typescript
import {
  payloadProductToAppProduct,
  createCartItemFromPayload,
  formatProductPrice,
} from '@/lib/payload'

// Convert Payload product to app product
const appProduct = payloadProductToAppProduct(payloadProduct)

// Create cart item from Payload data
const cartItem = createCartItemFromPayload(
  payloadProduct,
  variantSku,
  quantity
)

// Format price for display
const priceDisplay = formatProductPrice(product)
```

## Environment Variables

Required environment variables:

```bash
# Payload CMS API
PAYLOAD_API_URL=http://localhost:3000/api

# For production
NEXT_PUBLIC_SERVER_URL=https://yourdomain.com

# Payload CMS Database (from CLAUDE.md)
PAYLOAD_SECRET=dev-secret-key-change-in-production
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=5432
DB_NAME=
```

## Best Practices

1. **Use Server Components** - Prefer Server Components for data fetching
2. **Error Handling** - Always wrap API calls in try-catch
3. **Type Safety** - Import types from `payload-types.ts`
4. **Authentication** - Check auth before protected operations
5. **Inventory** - Verify stock before order creation
6. **Caching** - Server Components cache by default
7. **Validation** - Use provided validation utilities

## Migration Strategy

### Phase 1: Current State
- Temporary data in components
- Payload CMS admin panel active
- Dual databases not integrated

### Phase 2: Integration (Now)
- Use Payload API client for all data fetching
- Create orders through Server Actions
- Maintain inventory through Payload

### Phase 3: Complete Migration
- Deprecate Drizzle schema
- Migrate existing data to Payload
- Remove temporary data files
- Full Payload CMS integration

## Common Use Cases

### 1. Product Catalog

```typescript
// app/products/page.tsx
import { getProducts, formatProductPrice } from '@/lib/payload'

export default async function ProductsPage() {
  const { docs: products } = await getProducts({
    status: 'active',
    inStock: true,
  })

  return (
    <div className="grid">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### 2. Shopping Cart Checkout

```typescript
'use client'

import { createOrder, checkInventoryAvailability } from '@/lib/payload'
import { useCart } from '@/context/CartContext'

export function CheckoutButton() {
  const { state, clearCart } = useCart()

  async function handleCheckout() {
    // Check inventory
    const inventoryCheck = await checkInventoryAvailability(
      state.items.map(item => ({
        variantSku: item.variant.sku,
        quantity: item.quantity,
      }))
    )

    if (!inventoryCheck.available) {
      alert('Some items are out of stock')
      return
    }

    // Create order
    const result = await createOrder({
      /* order data */
    })

    if (result.success) {
      clearCart()
      window.location.href = `/orders/${result.order.orderNumber}`
    }
  }

  return <button onClick={handleCheckout}>Checkout</button>
}
```

### 3. User Authentication

```typescript
'use client'

import { loginUser, getAuthenticatedUser } from '@/lib/payload'

export function LoginForm() {
  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)

    const result = await loginUser(
      formData.get('email') as string,
      formData.get('password') as string
    )

    if (result.success) {
      window.location.href = '/account'
    }
  }

  return <form onSubmit={handleLogin}>...</form>
}
```

### 4. Order Management

```typescript
// app/admin/orders/page.tsx
import { getOrders, updateOrderStatus } from '@/lib/payload'

export default async function AdminOrdersPage() {
  const { docs: orders } = await getOrders({
    status: 'pending',
    limit: 50,
  })

  return (
    <div>
      {orders.map(order => (
        <OrderRow key={order.id} order={order} />
      ))}
    </div>
  )
}
```

## Testing

### Unit Tests

Test utilities in isolation:

```typescript
import { formatPrice, calculateConservationDonation } from '@/lib/payload'

describe('Payload Utilities', () => {
  it('formats price correctly', () => {
    expect(formatPrice(29.99)).toBe('$29.99')
  })

  it('calculates conservation donation', () => {
    const product = { conservationInfo: { donationPercentage: 10 } }
    expect(calculateConservationDonation(product, 100)).toBe(10)
  })
})
```

### Integration Tests

Test with actual Payload API:

```typescript
import { getProducts, createOrder } from '@/lib/payload'

describe('Payload API', () => {
  it('fetches products', async () => {
    const result = await getProducts({ limit: 10 })
    expect(result.docs).toBeInstanceOf(Array)
  })
})
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check if JWT token is set correctly
   - Verify token hasn't expired
   - Use `loginUser()` to get new token

2. **404 Not Found**
   - Verify product/order ID exists
   - Check API endpoint URL
   - Ensure Payload CMS is running

3. **Type Errors**
   - Run `npm run payload:generate` to regenerate types
   - Check `payload-types.ts` is up to date
   - Verify import paths are correct

4. **Inventory Issues**
   - Check variant SKU is correct
   - Verify stock levels in admin panel
   - Run inventory check before creating orders

## Support

For issues or questions:

1. Check `PAYLOAD_CLIENT_USAGE.md` for detailed examples
2. Review Payload CMS documentation: https://payloadcms.com
3. Check CLAUDE.md for project-specific guidance
4. Review example components in `src/components/examples/`

## License

Part of the ShennaStudio project. See main project LICENSE.
