/**
 * Payload CMS REST API Utilities & Server Actions
 *
 * Server-side utilities for order creation, cart conversion,
 * inventory management, and authentication helpers.
 * Uses Next.js 16 Server Actions for mutations.
 */

'use server'

import { cookies } from 'next/headers'
import type { Product, Order, User } from '@payload-types'

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

// ===================================
// TYPE DEFINITIONS
// ===================================

export interface CreateOrderInput {
  // Customer information
  customerEmail: string
  customerFirstName: string
  customerLastName: string

  // Shipping address
  shippingAddress: {
    name: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }

  // Cart items
  items: Array<{
    productId: number
    variantSku?: string
    quantity: number
    price: number
  }>

  // Totals
  subtotal: number
  shipping: number
  tax: number
  total: number

  // Optional
  stripePaymentIntentId?: string
  notes?: string
}

export interface CreateOrderResponse {
  success: boolean
  order?: Order
  error?: string
}

export interface UpdateInventoryInput {
  variantSku: string
  quantity: number
  operation: 'increment' | 'decrement'
}

export interface AuthResponse {
  success: boolean
  token?: string
  user?: User
  error?: string
}

// ===================================
// CONFIGURATION
// ===================================

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3000/api'

// Auth token cookie name
const AUTH_TOKEN_COOKIE = 'payload-token'

// ===================================
// HELPER FUNCTIONS
// ===================================

/**
 * Get base API URL for server-side calls
 */
function getApiUrl(): string {
  return PAYLOAD_API_URL
}

/**
 * Make authenticated request to Payload API
 */
async function payloadFetch<T>(
  endpoint: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...fetchOptions } = options
  const url = `${getApiUrl()}${endpoint}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  }

  // Add auth token if provided
  if (token) {
    headers['Authorization'] = `JWT ${token}`
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.errors?.[0]?.message || `API error: ${response.status}`
      )
    }

    return await response.json()
  } catch (error) {
    console.error(`Payload API Error (${endpoint}):`, error)
    throw error
  }
}

/**
 * Get auth token from cookies
 */
async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(AUTH_TOKEN_COOKIE)?.value
}

/**
 * Set auth token in cookies
 */
async function setAuthToken(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

/**
 * Clear auth token from cookies
 */
async function clearAuthToken(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_TOKEN_COOKIE)
}

// ===================================
// ORDER OPERATIONS
// ===================================

/**
 * Create a new order in Payload CMS
 * Server Action for checkout process
 */
export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResponse> {
  try {
    // Get or create user
    const token = await getAuthToken()
    let customerId: number | undefined

    if (token) {
      // User is logged in, get their ID
      try {
        const user = await payloadFetch<User>('/users/me', { token })
        customerId = user.id
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }

    if (!customerId) {
      // Create guest user or get existing user by email
      try {
        const existingUser = await payloadFetch<{ docs: User[] }>(
          `/users?where[email][equals]=${encodeURIComponent(input.customerEmail)}`
        )

        if (existingUser.docs.length > 0) {
          customerId = existingUser.docs[0].id
        } else {
          // Create new customer user
          const newUser = await payloadFetch<User>('/users', {
            method: 'POST',
            body: JSON.stringify({
              email: input.customerEmail,
              firstName: input.customerFirstName,
              lastName: input.customerLastName,
              roles: ['customer'],
              // Generate temporary password (user should reset it)
              password: Math.random().toString(36).slice(-8),
            }),
          })
          customerId = newUser.id
        }
      } catch (error) {
        console.error('Error creating/finding user:', error)
        return {
          success: false,
          error: 'Failed to create customer account',
        }
      }
    }

    // Transform cart items to order items
    const orderItems = input.items.map(item => ({
      product: item.productId,
      variant: item.variantSku || null,
      quantity: item.quantity,
      price: item.price,
    }))

    // Create order
    const orderData = {
      customer: customerId,
      items: orderItems,
      subtotal: input.subtotal,
      shipping: input.shipping,
      tax: input.tax || 0,
      total: input.total,
      shippingAddress: input.shippingAddress,
      status: 'pending',
      paymentStatus: input.stripePaymentIntentId ? 'paid' : 'pending',
      stripePaymentIntentId: input.stripePaymentIntentId || null,
      notes: input.notes || null,
    }

    const order = await payloadFetch<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
      token,
    })

    // Update inventory for each item
    for (const item of input.items) {
      if (item.variantSku) {
        await decrementInventory(item.variantSku, item.quantity)
      }
    }

    return {
      success: true,
      order,
    }
  } catch (error) {
    console.error('Error creating order:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order',
    }
  }
}

/**
 * Convert cart items to order items format
 */
export function cartToOrderItems(
  cartItems: PayloadCartItem[]
): CreateOrderInput['items'] {
  return cartItems.map(item => ({
    productId: item.productId,
    variantSku: item.variantSku || item.productSku,
    quantity: item.quantity,
    price: item.price,
  }))
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: number,
  status: Order['status']
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getAuthToken()

    if (!token) {
      return { success: false, error: 'Authentication required' }
    }

    await payloadFetch(`/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      token,
    })

    return { success: true }
  } catch (error) {
    console.error('Error updating order status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update order',
    }
  }
}

/**
 * Update order payment status
 */
export async function updateOrderPaymentStatus(
  orderId: number,
  paymentStatus: Order['paymentStatus'],
  stripePaymentIntentId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getAuthToken()

    if (!token) {
      return { success: false, error: 'Authentication required' }
    }

    const updateData: Partial<Order> = { paymentStatus }
    if (stripePaymentIntentId) {
      updateData.stripePaymentIntentId = stripePaymentIntentId
    }

    await payloadFetch(`/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
      token,
    })

    return { success: true }
  } catch (error) {
    console.error('Error updating payment status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update payment status',
    }
  }
}

/**
 * Add tracking information to order
 */
export async function addOrderTracking(
  orderId: number,
  trackingNumber: string,
  carrier: Order['carrier']
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getAuthToken()

    if (!token) {
      return { success: false, error: 'Authentication required' }
    }

    await payloadFetch(`/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        trackingNumber,
        carrier,
        status: 'shipped',
      }),
      token,
    })

    return { success: true }
  } catch (error) {
    console.error('Error adding tracking info:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add tracking info',
    }
  }
}

// ===================================
// INVENTORY MANAGEMENT
// ===================================

/**
 * Decrement inventory for a variant
 */
async function decrementInventory(
  variantSku: string,
  quantity: number
): Promise<void> {
  try {
    // Find the product with this variant
    const productsResponse = await payloadFetch<{ docs: Product[] }>(
      `/products?where[variants.sku][equals]=${encodeURIComponent(variantSku)}&depth=0`
    )

    if (productsResponse.docs.length === 0) {
      console.warn(`Product with variant SKU ${variantSku} not found`)
      return
    }

    const product = productsResponse.docs[0]
    const variantIndex = product.variants?.findIndex(v => v.sku === variantSku)

    if (variantIndex === undefined || variantIndex === -1) {
      console.warn(`Variant with SKU ${variantSku} not found in product`)
      return
    }

    const variant = product.variants![variantIndex]
    const newStock = Math.max(0, variant.stock - quantity)

    // Update variant stock
    const updatedVariants = [...(product.variants || [])]
    updatedVariants[variantIndex] = {
      ...variant,
      stock: newStock,
    }

    await payloadFetch(`/products/${product.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        variants: updatedVariants,
        inStock: updatedVariants.some(v => v.stock > 0),
      }),
    })
  } catch (error) {
    console.error(`Error decrementing inventory for ${variantSku}:`, error)
    throw error
  }
}

/**
 * Increment inventory for a variant (for restocking or refunds)
 */
export async function incrementInventory(
  variantSku: string,
  quantity: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getAuthToken()

    if (!token) {
      return { success: false, error: 'Authentication required' }
    }

    // Find the product with this variant
    const productsResponse = await payloadFetch<{ docs: Product[] }>(
      `/products?where[variants.sku][equals]=${encodeURIComponent(variantSku)}&depth=0`,
      { token }
    )

    if (productsResponse.docs.length === 0) {
      return { success: false, error: 'Product not found' }
    }

    const product = productsResponse.docs[0]
    const variantIndex = product.variants?.findIndex(v => v.sku === variantSku)

    if (variantIndex === undefined || variantIndex === -1) {
      return { success: false, error: 'Variant not found' }
    }

    const variant = product.variants![variantIndex]
    const newStock = variant.stock + quantity

    // Update variant stock
    const updatedVariants = [...(product.variants || [])]
    updatedVariants[variantIndex] = {
      ...variant,
      stock: newStock,
    }

    await payloadFetch(`/products/${product.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        variants: updatedVariants,
        inStock: true,
      }),
      token,
    })

    return { success: true }
  } catch (error) {
    console.error(`Error incrementing inventory for ${variantSku}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update inventory',
    }
  }
}

/**
 * Check inventory availability for cart items
 */
export async function checkInventoryAvailability(
  items: Array<{ variantSku: string; quantity: number }>
): Promise<{
  available: boolean
  unavailableItems: Array<{ sku: string; requested: number; available: number }>
}> {
  const unavailableItems: Array<{ sku: string; requested: number; available: number }> = []

  for (const item of items) {
    try {
      const productsResponse = await payloadFetch<{ docs: Product[] }>(
        `/products?where[variants.sku][equals]=${encodeURIComponent(item.variantSku)}&depth=0`
      )

      if (productsResponse.docs.length === 0) {
        unavailableItems.push({
          sku: item.variantSku,
          requested: item.quantity,
          available: 0,
        })
        continue
      }

      const product = productsResponse.docs[0]
      const variant = product.variants?.find(v => v.sku === item.variantSku)

      if (!variant || variant.stock < item.quantity) {
        unavailableItems.push({
          sku: item.variantSku,
          requested: item.quantity,
          available: variant?.stock || 0,
        })
      }
    } catch (error) {
      console.error(`Error checking inventory for ${item.variantSku}:`, error)
      unavailableItems.push({
        sku: item.variantSku,
        requested: item.quantity,
        available: 0,
      })
    }
  }

  return {
    available: unavailableItems.length === 0,
    unavailableItems,
  }
}

// ===================================
// AUTHENTICATION
// ===================================

/**
 * Login user and set auth token
 */
export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const response = await payloadFetch<{ token: string; user: User }>(
      '/users/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    )

    await setAuthToken(response.token)

    return {
      success: true,
      token: response.token,
      user: response.user,
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    }
  }
}

/**
 * Logout user and clear auth token
 */
export async function logoutUser(): Promise<AuthResponse> {
  try {
    const token = await getAuthToken()

    if (token) {
      await payloadFetch('/users/logout', {
        method: 'POST',
        token,
      })
    }

    await clearAuthToken()

    return { success: true }
  } catch (error) {
    console.error('Logout error:', error)
    // Clear token anyway
    await clearAuthToken()
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Logout failed',
    }
  }
}

/**
 * Register new user
 */
export async function registerUser(data: {
  email: string
  password: string
  firstName: string
  lastName: string
}): Promise<AuthResponse> {
  try {
    const response = await payloadFetch<{ token: string; user: User }>(
      '/users',
      {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          roles: ['customer'],
        }),
      }
    )

    await setAuthToken(response.token)

    return {
      success: true,
      token: response.token,
      user: response.user,
    }
  } catch (error) {
    console.error('Registration error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
    }
  }
}

/**
 * Get current authenticated user
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const token = await getAuthToken()

    if (!token) {
      return null
    }

    const user = await payloadFetch<User>('/users/me', { token })
    return user
  } catch (error) {
    console.error('Error fetching authenticated user:', error)
    return null
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(data: {
  firstName?: string
  lastName?: string
  shippingAddress?: User['shippingAddress']
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const token = await getAuthToken()

    if (!token) {
      return { success: false, error: 'Authentication required' }
    }

    const currentUser = await payloadFetch<User>('/users/me', { token })

    const updatedUser = await payloadFetch<User>(`/users/${currentUser.id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    })

    return {
      success: true,
      user: updatedUser,
    }
  } catch (error) {
    console.error('Error updating user profile:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile',
    }
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken()
  return !!token
}

/**
 * Check if user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const user = await getAuthenticatedUser()
    return user?.roles?.includes('admin') || false
  } catch {
    return false
  }
}

/**
 * Check if user has staff role
 */
export async function isStaff(): Promise<boolean> {
  try {
    const user = await getAuthenticatedUser()
    return user?.roles?.includes('staff') || user?.roles?.includes('admin') || false
  } catch {
    return false
  }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Calculate order totals
 */
export function calculateOrderTotals(
  items: Array<{ price: number; quantity: number }>
): {
  subtotal: number
  shipping: number
  tax: number
  total: number
} {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 50 ? 0 : 5.95
  const tax = subtotal * 0.0825 // 8.25% tax
  const total = subtotal + shipping + tax

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
  }
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate US ZIP code
 */
export function isValidZipCode(zipCode: string): boolean {
  const zipRegex = /^\d{5}(-\d{4})?$/
  return zipRegex.test(zipCode)
}
