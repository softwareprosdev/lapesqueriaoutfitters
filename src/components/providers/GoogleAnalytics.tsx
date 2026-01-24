'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// Track page views
function GoogleAnalyticsTracking() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')

    // Send page view to GA4
    window.gtag?.('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }, [pathname, searchParams])

  return null
}

export default function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: true,
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <GoogleAnalyticsTracking />
      </Suspense>
    </>
  )
}

// Helper functions to track events from anywhere in the app
export function trackGAEvent(action: string, category: string, label?: string, value?: number) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return

  window.gtag?.('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}

// E-commerce specific tracking
export function trackViewItem(item: {
  id: string
  name: string
  price: number
  category?: string
  variant?: string
}) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return

  window.gtag?.('event', 'view_item', {
    currency: 'USD',
    value: item.price,
    items: [{
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      item_category: item.category,
      item_variant: item.variant,
    }],
  })
}

export function trackAddToCart(item: {
  id: string
  name: string
  price: number
  quantity: number
  category?: string
  variant?: string
}) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return

  window.gtag?.('event', 'add_to_cart', {
    currency: 'USD',
    value: item.price * item.quantity,
    items: [{
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
      item_category: item.category,
      item_variant: item.variant,
    }],
  })
}

export function trackRemoveFromCart(item: {
  id: string
  name: string
  price: number
  quantity: number
}) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return

  window.gtag?.('event', 'remove_from_cart', {
    currency: 'USD',
    value: item.price * item.quantity,
    items: [{
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    }],
  })
}

export function trackBeginCheckout(items: Array<{
  id: string
  name: string
  price: number
  quantity: number
}>, total: number) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return

  window.gtag?.('event', 'begin_checkout', {
    currency: 'USD',
    value: total,
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  })
}

export function trackPurchase(transactionId: string, items: Array<{
  id: string
  name: string
  price: number
  quantity: number
}>, total: number, shipping?: number, tax?: number) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return

  window.gtag?.('event', 'purchase', {
    transaction_id: transactionId,
    currency: 'USD',
    value: total,
    shipping: shipping || 0,
    tax: tax || 0,
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  })
}

export function trackSearch(searchTerm: string) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return

  window.gtag?.('event', 'search', {
    search_term: searchTerm,
  })
}

// Declare gtag on window
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}
