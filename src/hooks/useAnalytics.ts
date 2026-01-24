'use client'

import { useCallback } from 'react'
import {
  trackViewItem,
  trackAddToCart as trackGA4AddToCart,
  trackRemoveFromCart as trackGA4RemoveFromCart,
  trackBeginCheckout,
  trackPurchase as trackGA4Purchase,
  trackSearch as trackGA4Search,
} from '@/components/providers/GoogleAnalytics'
import { trackClarityEvent, setClarityTag } from '@/components/providers/MicrosoftClarity'

// Get or create session ID for custom analytics
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'

  let sessionId = sessionStorage.getItem('analytics_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
    sessionStorage.setItem('analytics_session_id', sessionId)
  }
  return sessionId
}

// Track to custom backend
async function trackCustomEvent(eventType: string, data: Record<string, unknown>) {
  try {
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        sessionId: getSessionId(),
        ...data,
      }),
    })
    return response.ok
  } catch {
    return false
  }
}

export function useAnalytics() {
  // Track product view
  const trackProductView = useCallback(async (product: {
    id: string
    name: string
    price: number
    category?: string
    variantId?: string
    variantName?: string
  }) => {
    // Track in GA4
    trackViewItem({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      variant: product.variantName,
    })

    // Track in Clarity
    trackClarityEvent('product_view')
    if (product.category) {
      setClarityTag('last_category', product.category)
    }

    // Track in custom backend
    await trackCustomEvent('PRODUCT_VIEW', {
      productId: product.id,
      variantId: product.variantId,
      metadata: {
        productName: product.name,
        price: product.price,
        category: product.category,
      },
    })
  }, [])

  // Track add to cart
  const trackAddToCart = useCallback(async (item: {
    productId: string
    variantId: string
    name: string
    variantName?: string
    price: number
    quantity: number
    category?: string
  }) => {
    // Track in GA4
    trackGA4AddToCart({
      id: item.variantId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      category: item.category,
      variant: item.variantName,
    })

    // Track in Clarity
    trackClarityEvent('add_to_cart')

    // Track in custom backend
    await trackCustomEvent('ADD_TO_CART', {
      productId: item.productId,
      variantId: item.variantId,
      metadata: {
        productName: item.name,
        variantName: item.variantName,
        price: item.price,
        quantity: item.quantity,
      },
    })
  }, [])

  // Track remove from cart
  const trackRemoveFromCart = useCallback(async (item: {
    productId: string
    variantId: string
    name: string
    price: number
    quantity: number
  }) => {
    // Track in GA4
    trackGA4RemoveFromCart({
      id: item.variantId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })

    // Track in Clarity
    trackClarityEvent('remove_from_cart')

    // Track in custom backend
    await trackCustomEvent('REMOVE_FROM_CART', {
      productId: item.productId,
      variantId: item.variantId,
      metadata: {
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
      },
    })
  }, [])

  // Track begin checkout
  const trackCheckoutStart = useCallback(async (items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>, total: number) => {
    // Track in GA4
    trackBeginCheckout(items, total)

    // Track in Clarity
    trackClarityEvent('begin_checkout')
    setClarityTag('checkout_value', total.toFixed(2))
  }, [])

  // Track purchase
  const trackPurchase = useCallback(async (order: {
    orderId: string
    orderNumber: string
    items: Array<{
      productId: string
      variantId: string
      name: string
      price: number
      quantity: number
    }>
    subtotal: number
    shipping: number
    tax: number
    total: number
  }) => {
    // Track in GA4
    trackGA4Purchase(
      order.orderNumber,
      order.items.map(item => ({
        id: item.variantId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      order.total,
      order.shipping,
      order.tax
    )

    // Track in Clarity
    trackClarityEvent('purchase')
    setClarityTag('customer_type', 'purchaser')

    // Track in custom backend
    await trackCustomEvent('PURCHASE', {
      metadata: {
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        total: order.total,
        itemCount: order.items.length,
      },
    })
  }, [])

  // Track search
  const trackSearch = useCallback(async (query: string, resultsCount?: number) => {
    // Track in GA4
    trackGA4Search(query)

    // Track in Clarity
    trackClarityEvent('search')

    // Track in custom backend
    await trackCustomEvent('SEARCH', {
      metadata: {
        query,
        resultsCount,
      },
    })
  }, [])

  // Track category view
  const trackCategoryView = useCallback(async (category: {
    id: string
    name: string
    slug: string
  }) => {
    // Track in Clarity
    trackClarityEvent('category_view')
    setClarityTag('category', category.name)

    // Track in custom backend
    await trackCustomEvent('CATEGORY_VIEW', {
      categoryId: category.id,
      metadata: {
        categoryName: category.name,
        categorySlug: category.slug,
      },
    })
  }, [])

  return {
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackCheckoutStart,
    trackPurchase,
    trackSearch,
    trackCategoryView,
  }
}

export default useAnalytics
