'use client'

import { useEffect } from 'react'
import useAnalytics from '@/hooks/useAnalytics'

interface ProductViewTrackerProps {
  product: {
    id: string
    name: string
    basePrice: number
    category?: {
      name: string
    } | null
  }
  variant?: {
    id: string
    name: string
  } | null
}

export default function ProductViewTracker({ product, variant }: ProductViewTrackerProps) {
  const { trackProductView } = useAnalytics()

  useEffect(() => {
    // Track product view on mount
    trackProductView({
      id: product.id,
      name: product.name,
      price: product.basePrice,
      category: product.category?.name,
      variantId: variant?.id,
      variantName: variant?.name,
    })
  }, [product.id, product.name, product.basePrice, product.category?.name, variant?.id, variant?.name, trackProductView])

  // This component doesn't render anything visible
  return null
}
