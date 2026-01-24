# Payload API Client Usage Guide

This guide demonstrates how to use the Payload API client (`payload-client.ts`) and API utilities (`payload-api.ts`) in your Next.js application.

## Table of Contents

1. [Server Components](#server-components)
2. [Client Components](#client-components)
3. [Server Actions](#server-actions)
4. [Authentication](#authentication)
5. [Order Management](#order-management)
6. [Inventory Management](#inventory-management)
7. [Example Use Cases](#example-use-cases)

---

## Server Components

Server Components can directly import and use the client functions:

### Fetching Products

```tsx
// app/products/page.tsx
import { getProducts, getFeaturedProducts } from '@/lib/payload-client'

export default async function ProductsPage() {
  // Get all active products
  const { docs: products } = await getProducts({
    status: 'active',
    limit: 20,
    page: 1,
  })

  // Or get featured products
  const featuredProducts = await getFeaturedProducts(8)

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### Single Product Page

```tsx
// app/products/[id]/page.tsx
import { getProduct, getMediaUrl } from '@/lib/payload-client'

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const product = await getProduct(parseInt(params.id))
  const imageUrl = getMediaUrl(product.images[0]?.image)

  return (
    <div>
      <h1>{product.name}</h1>
      <img src={imageUrl || '/placeholder.jpg'} alt={product.name} />
      <p>{product.description}</p>
      <p>${product.basePrice}</p>
    </div>
  )
}
```

### Category Pages

```tsx
// app/categories/[slug]/page.tsx
import { getCategoryBySlug, getProductsByCategory } from '@/lib/payload-client'

export default async function CategoryPage({
  params,
}: {
  params: { slug: string }
}) {
  const category = await getCategoryBySlug(params.slug)

  if (!category) {
    return <div>Category not found</div>
  }

  const { docs: products } = await getProductsByCategory(category.id, {
    limit: 20,
  })

  return (
    <div>
      <h1>{category.name}</h1>
      <p>{category.description}</p>
      <div className="grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
```

### Search Page

```tsx
// app/search/page.tsx
import { searchProducts } from '@/lib/payload-client'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const query = searchParams.q || ''

  if (!query) {
    return <div>Enter a search query</div>
  }

  const { docs: products } = await searchProducts(query, { limit: 20 })

  return (
    <div>
      <h1>Search Results for "{query}"</h1>
      <p>Found {products.length} products</p>
      <div className="grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
```

---

## Client Components

Client Components need to use Server Actions or API routes:

### Product Listing with Client-Side Filtering

```tsx
'use client'

import { useState, useEffect } from 'react'
import type { Product } from '@/../../payload-types'

export function ProductList({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts)
  const [loading, setLoading] = useState(false)

  const filterByCategory = async (categoryId: number) => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/products?category=${categoryId}&depth=2`
      )
      const data = await response.json()
      setProducts(data.docs)
    } catch (error) {
      console.error('Error filtering products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {loading && <div>Loading...</div>}
      <div className="grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
```

### Add to Cart Component

```tsx
'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import type { Product } from '@/../../payload-types'
import { getVariantBySku, isVariantInStock } from '@/lib/payload-client'

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [selectedVariantSku, setSelectedVariantSku] = useState(
    product.variants?.[0]?.sku
  )

  const handleAddToCart = () => {
    if (!selectedVariantSku) return

    const variant = getVariantBySku(product, selectedVariantSku)

    if (!variant) return

    if (!isVariantInStock(variant)) {
      alert('This variant is out of stock')
      return
    }

    // Convert Payload variant to CartContext format
    const cartVariant = {
      id: parseInt(variant.id || '0'),
      productId: product.id,
      sku: variant.sku,
      price: variant.price,
      stock: variant.stock,
      size: variant.size || null,
      color: variant.color || null,
      material: variant.material || null,
      weight: null,
      images: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const cartProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      basePrice: product.basePrice,
      sku: product.sku,
      status: 'active' as const,
      featured: product.featured || false,
      images: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    addItem(cartVariant, cartProduct, 1)
  }

  return (
    <div>
      <select
        value={selectedVariantSku}
        onChange={e => setSelectedVariantSku(e.target.value)}
      >
        {product.variants?.map(variant => (
          <option key={variant.sku} value={variant.sku}>
            {variant.variantName} - ${variant.price}
          </option>
        ))}
      </select>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  )
}
```

---

## Server Actions

Use Server Actions for mutations (creating orders, updating data):

### Checkout Page

```tsx
'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { createOrder, cartToOrderItems, calculateOrderTotals } from '@/lib/payload-api'
import type { CreateOrderInput } from '@/lib/payload-api'

export function CheckoutForm() {
  const { state: cart, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    const orderItems = cartToOrderItems(cart.items)
    const totals = calculateOrderTotals(
      orderItems.map(item => ({ price: item.price, quantity: item.quantity }))
    )

    const orderInput: CreateOrderInput = {
      customerEmail: formData.get('email') as string,
      customerFirstName: formData.get('firstName') as string,
      customerLastName: formData.get('lastName') as string,
      shippingAddress: {
        name: `${formData.get('firstName')} ${formData.get('lastName')}`,
        street: formData.get('street') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        zipCode: formData.get('zipCode') as string,
        country: 'United States',
      },
      items: orderItems,
      ...totals,
    }

    try {
      const result = await createOrder(orderInput)

      if (result.success && result.order) {
        clearCart()
        // Redirect to success page
        window.location.href = `/orders/${result.order.orderNumber}/success`
      } else {
        setError(result.error || 'Failed to create order')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      <input name="email" type="email" placeholder="Email" required />
      <input name="firstName" type="text" placeholder="First Name" required />
      <input name="lastName" type="text" placeholder="Last Name" required />
      <input name="street" type="text" placeholder="Street Address" required />
      <input name="city" type="text" placeholder="City" required />
      <input name="state" type="text" placeholder="State" required />
      <input name="zipCode" type="text" placeholder="ZIP Code" required />

      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Place Order'}
      </button>
    </form>
  )
}
```

---

## Authentication

### Login Form

```tsx
'use client'

import { useState } from 'react'
import { loginUser } from '@/lib/payload-api'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = await loginUser(email, password)

    if (result.success) {
      router.push('/account')
      router.refresh()
    } else {
      setError(result.error || 'Login failed')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  )
}
```

### Protected Page (Server Component)

```tsx
// app/account/page.tsx
import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '@/lib/payload-api'
import { getOrders } from '@/lib/payload-client'

export default async function AccountPage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's orders
  const { docs: orders } = await getOrders({
    limit: 10,
    sort: '-createdAt',
  })

  return (
    <div>
      <h1>Welcome, {user.firstName}!</h1>
      <h2>Your Orders</h2>
      <ul>
        {orders.map(order => (
          <li key={order.id}>
            Order #{order.orderNumber} - ${order.total}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

## Order Management

### Order History Page

```tsx
// app/orders/page.tsx
import { getAuthenticatedUser } from '@/lib/payload-api'
import { getOrders } from '@/lib/payload-client'
import { redirect } from 'next/navigation'

export default async function OrdersPage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect('/login')
  }

  const { docs: orders, totalDocs } = await getOrders({
    limit: 20,
    page: 1,
    sort: '-createdAt',
  })

  return (
    <div>
      <h1>Your Orders ({totalDocs})</h1>
      {orders.map(order => (
        <div key={order.id}>
          <h3>Order #{order.orderNumber}</h3>
          <p>Status: {order.status}</p>
          <p>Total: ${order.total}</p>
          <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
          {order.trackingNumber && (
            <p>Tracking: {order.trackingNumber}</p>
          )}
        </div>
      ))}
    </div>
  )
}
```

### Admin: Update Order Status

```tsx
'use client'

import { updateOrderStatus, addOrderTracking } from '@/lib/payload-api'
import type { Order } from '@/../../payload-types'

export function OrderStatusForm({ order }: { order: Order }) {
  const handleStatusUpdate = async (status: Order['status']) => {
    const result = await updateOrderStatus(order.id, status)
    if (result.success) {
      alert('Status updated')
    } else {
      alert(result.error)
    }
  }

  const handleAddTracking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const result = await addOrderTracking(
      order.id,
      formData.get('trackingNumber') as string,
      formData.get('carrier') as Order['carrier']
    )

    if (result.success) {
      alert('Tracking added')
    } else {
      alert(result.error)
    }
  }

  return (
    <div>
      <select onChange={e => handleStatusUpdate(e.target.value as Order['status'])}>
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
      </select>

      <form onSubmit={handleAddTracking}>
        <input name="trackingNumber" placeholder="Tracking Number" />
        <select name="carrier">
          <option value="usps">USPS</option>
          <option value="ups">UPS</option>
          <option value="fedex">FedEx</option>
        </select>
        <button type="submit">Add Tracking</button>
      </form>
    </div>
  )
}
```

---

## Inventory Management

### Check Inventory Before Checkout

```tsx
'use client'

import { checkInventoryAvailability } from '@/lib/payload-api'
import { useCart } from '@/context/CartContext'

export function CheckoutButton() {
  const { state: cart } = useCart()

  const handleCheckout = async () => {
    const items = cart.items.map(item => ({
      variantSku: item.variant.sku,
      quantity: item.quantity,
    }))

    const result = await checkInventoryAvailability(items)

    if (!result.available) {
      alert(
        `The following items are not available:\n${result.unavailableItems
          .map(
            item =>
              `${item.sku}: Requested ${item.requested}, Available ${item.available}`
          )
          .join('\n')}`
      )
      return
    }

    // Proceed to checkout
    window.location.href = '/checkout'
  }

  return <button onClick={handleCheckout}>Proceed to Checkout</button>
}
```

### Restock Inventory (Admin)

```tsx
'use client'

import { incrementInventory } from '@/lib/payload-api'

export function RestockForm({ variantSku }: { variantSku: string }) {
  const handleRestock = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const quantity = parseInt(formData.get('quantity') as string)

    const result = await incrementInventory(variantSku, quantity)

    if (result.success) {
      alert('Inventory updated')
    } else {
      alert(result.error)
    }
  }

  return (
    <form onSubmit={handleRestock}>
      <input name="quantity" type="number" min="1" placeholder="Quantity" />
      <button type="submit">Restock</button>
    </form>
  )
}
```

---

## Example Use Cases

### Homepage with Featured Products

```tsx
// app/page.tsx
import { getFeaturedProducts, getProductImageUrl } from '@/lib/payload-client'

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts(6)

  return (
    <main>
      <section>
        <h1>Ocean-Inspired Handcrafted Bracelets</h1>
        <p>10% of proceeds support marine conservation</p>
      </section>

      <section>
        <h2>Featured Products</h2>
        <div className="grid">
          {featuredProducts.map(product => {
            const imageUrl = getProductImageUrl(product)
            const donationPercentage =
              product.conservationInfo?.donationPercentage || 10

            return (
              <div key={product.id}>
                <img src={imageUrl || '/placeholder.jpg'} alt={product.name} />
                <h3>{product.name}</h3>
                <p>${product.basePrice}</p>
                <p>{donationPercentage}% goes to conservation</p>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
```

### Product Detail with Variants

```tsx
// app/products/[id]/page.tsx
import {
  getProduct,
  getAvailableSizes,
  getAvailableColors,
  calculateConservationDonation,
} from '@/lib/payload-client'

export default async function ProductPage({
  params,
}: {
  params: { id: string }
}) {
  const product = await getProduct(parseInt(params.id))

  const sizes = getAvailableSizes(product)
  const colors = getAvailableColors(product)
  const donationAmount = calculateConservationDonation(
    product,
    product.basePrice
  )

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>

      <div>
        <p>Price: ${product.basePrice}</p>
        <p>
          ${donationAmount.toFixed(2)} goes to{' '}
          {product.conservationInfo?.conservationFocus || 'marine conservation'}
        </p>
      </div>

      {sizes.length > 0 && (
        <div>
          <h3>Available Sizes</h3>
          <ul>
            {sizes.map(size => (
              <li key={size}>{size}</li>
            ))}
          </ul>
        </div>
      )}

      {colors.length > 0 && (
        <div>
          <h3>Available Colors</h3>
          <ul>
            {colors.map(color => (
              <li key={color}>{color}</li>
            ))}
          </ul>
        </div>
      )}

      {product.variants && (
        <div>
          <h3>Variants</h3>
          {product.variants.map(variant => (
            <div key={variant.sku}>
              <p>{variant.variantName}</p>
              <p>${variant.price}</p>
              <p>{variant.stock > 0 ? 'In Stock' : 'Out of Stock'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## API Routes (Optional)

If you need to create custom API routes:

```tsx
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/payload-client'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const category = searchParams.get('category')
  const featured = searchParams.get('featured')

  try {
    const response = await getProducts({
      category: category ? parseInt(category) : undefined,
      featured: featured === 'true' ? true : undefined,
      limit: 20,
    })

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
```

---

## Best Practices

1. **Server Components First**: Use Server Components for data fetching when possible
2. **Cache Appropriately**: Server Components use `cache: 'force-cache'` by default
3. **Error Handling**: Always wrap API calls in try-catch blocks
4. **Type Safety**: Import types from `payload-types.ts` for full type safety
5. **Authentication**: Check authentication before performing protected operations
6. **Inventory Checks**: Always verify inventory before creating orders
7. **Validation**: Use utility functions like `isValidEmail`, `isValidZipCode`
8. **Price Formatting**: Use `formatPrice()` for consistent currency display

---

## Environment Variables

Make sure these are set in your `.env.local`:

```bash
# Payload CMS API
PAYLOAD_API_URL=http://localhost:3000/api

# For production
NEXT_PUBLIC_SERVER_URL=https://yourdomain.com
```
