/**
 * Type Adapters
 *
 * Conversion utilities between Payload CMS types and application types.
 * Handles transformation of data from Payload collections to frontend-friendly formats.
 */

import type { Product, Category, Media } from '@payload-types'
import type { PayloadCartItem } from '@/context/CartContext'
import type { PayloadVariant } from '@/types'

// ============================================================================
// CONVERSION FUNCTIONS
// ============================================================================

/**
 * Convert Payload Product to application product format
 */
export function payloadProductToAppProduct(product: Product) {
  // Get first category if it's an array
  const firstCategory = Array.isArray(product.category) && product.category.length > 0
    ? product.category[0]
    : null

  const categoryId = firstCategory && typeof firstCategory === 'object'
    ? firstCategory.id
    : firstCategory

  return {
    id: product.id,
    name: product.name,
    description: product.description || '',
    basePrice: product.basePrice,
    sku: product.sku,
    category: categoryId,
    variants: product.variants || [],
    images: product.images || [],
    featured: product.featured || false,
    conservationPercentage: product.conservationInfo?.donationPercentage || 10,
    conservationFocus: product.conservationInfo?.conservationFocus || '',
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}

/**
 * Convert Payload Category to application category format
 */
export function payloadCategoryToAppCategory(category: Category) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    image: typeof category.image === 'object' && category.image !== null
      ? (category.image as Media).url || ''
      : '',
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  }
}

/**
 * Convert Payload Variant to application variant format
 */
export function payloadVariantToAppVariant(variant: PayloadVariant) {
  return {
    id: variant.id,
    name: variant.name || '',
    size: variant.size || null,
    color: variant.color || null,
    material: variant.material || null,
    price: variant.price || 0,
    stock: variant.stock || 0,
    sku: variant.sku || '',
    images: variant.images || [],
  }
}

/**
 * Create cart item from Payload product and variant
 */
export function createCartItemFromPayload(
  product: Product,
  variant: PayloadVariant,
  quantity: number = 1
): PayloadCartItem {
  const variantImages = variant.images && Array.isArray(variant.images)
    ? variant.images.map((img: { url?: string | null } | string) => {
        if (typeof img.image === 'object' && img.image !== null && 'url' in img.image) {
          return (img.image as Media).url || ''
        }
        return ''
      }).filter((url: string) => url !== '')
    : []

  return {
    id: `${product.id}-${variant.id}`,
    productId: Number(product.id),
    productName: product.name,
    productSku: product.sku,
    variantId: variant.id,
    variantName: variant.variantName || formatVariantName(variant),
    variantSku: variant.sku || null,
    price: variant.price || product.basePrice,
    quantity,
    stock: variant.stock || 0,
    imageUrl: variantImages[0] || getProductImageUrl(product),
    conservationDonationPercentage: product.conservationInfo?.donationPercentage || null,
    conservationFocus: product.conservationInfo?.conservationFocus || null,
  }
}

// ============================================================================
// DISPLAY UTILITIES
// ============================================================================

/**
 * Get display information for a variant
 */
export function getVariantDisplayInfo(variant: PayloadVariant) {
  const attributes: string[] = []

  if (variant.size) attributes.push(variant.size)
  if (variant.color) attributes.push(variant.color)
  if (variant.material) attributes.push(variant.material)

  return {
    name: variant.name || attributes.join(' / '),
    attributes,
    price: variant.price,
    stock: variant.stock,
    inStock: variant.stock > 0,
    sku: variant.sku,
  }
}

/**
 * Get price range for a product with variants
 */
export function getProductPriceRange(product: Product): { min: number; max: number } {
  if (!product.variants || product.variants.length === 0) {
    return { min: product.basePrice, max: product.basePrice }
  }

  const prices = product.variants.map((v: PayloadVariant) => v.price || product.basePrice)
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  }
}

/**
 * Format product price for display
 */
export function formatProductPrice(product: Product): string {
  const range = getProductPriceRange(product)

  if (range.min === range.max) {
    return `$${range.min.toFixed(2)}`
  }

  return `$${range.min.toFixed(2)} - $${range.max.toFixed(2)}`
}

/**
 * Format variant name from attributes
 */
export function formatVariantName(variant: PayloadVariant): string {
  const parts: string[] = []

  if (variant.size) parts.push(variant.size)
  if (variant.color) parts.push(variant.color)
  if (variant.material) parts.push(variant.material)

  return parts.length > 0 ? parts.join(' / ') : 'Default'
}

// ============================================================================
// FILTERING AND SORTING
// ============================================================================

/**
 * Check if product matches filter criteria
 */
export function productMatchesFilters(
  product: Product,
  filters: {
    category?: string
    minPrice?: number
    maxPrice?: number
    inStock?: boolean
    featured?: boolean
  }
): boolean {
  // Category filter
  if (filters.category) {
    // Product can have multiple categories (array)
    const categories = Array.isArray(product.category) ? product.category : [product.category]
    const categoryIds = categories.map(cat =>
      typeof cat === 'object' && cat !== null ? cat.id : cat
    )

    if (!categoryIds.includes(filters.category as string | number)) {
      return false
    }
  }

  // Price filter
  const priceRange = getProductPriceRange(product)
  if (filters.minPrice !== undefined && priceRange.max < filters.minPrice) {
    return false
  }
  if (filters.maxPrice !== undefined && priceRange.min > filters.maxPrice) {
    return false
  }

  // Stock filter
  if (filters.inStock) {
    const totalStock = getTotalProductStock(product)
    if (totalStock <= 0) {
      return false
    }
  }

  // Featured filter
  if (filters.featured && !product.featured) {
    return false
  }

  return true
}

/**
 * Sort products by various criteria
 */
export function sortProducts(
  products: Product[],
  sortBy: 'name' | 'price-asc' | 'price-desc' | 'newest' | 'featured' = 'name'
): Product[] {
  const sorted = [...products]

  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))

    case 'price-asc':
      return sorted.sort((a, b) => {
        const priceA = getProductPriceRange(a).min
        const priceB = getProductPriceRange(b).min
        return priceA - priceB
      })

    case 'price-desc':
      return sorted.sort((a, b) => {
        const priceA = getProductPriceRange(a).max
        const priceB = getProductPriceRange(b).max
        return priceB - priceA
      })

    case 'newest':
      return sorted.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA
      })

    case 'featured':
      return sorted.sort((a, b) => {
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return 0
      })

    default:
      return sorted
  }
}

// ============================================================================
// COLLECTION UTILITIES
// ============================================================================

/**
 * Get unique materials from products
 */
export function getUniqueMaterials(products: Product[]): string[] {
  const materials = new Set<string>()

  products.forEach(product => {
    if (product.variants) {
      product.variants.forEach((variant: PayloadVariant) => {
        if (variant.material) {
          materials.add(variant.material)
        }
      })
    }
  })

  return Array.from(materials).sort()
}

/**
 * Get unique colors from products
 */
export function getUniqueColors(products: Product[]): string[] {
  const colors = new Set<string>()

  products.forEach(product => {
    if (product.variants) {
      product.variants.forEach((variant: PayloadVariant) => {
        if (variant.color) {
          colors.add(variant.color)
        }
      })
    }
  })

  return Array.from(colors).sort()
}

/**
 * Get unique sizes from products
 */
export function getUniqueSizes(products: Product[]): string[] {
  const sizes = new Set<string>()

  products.forEach(product => {
    if (product.variants) {
      product.variants.forEach((variant: PayloadVariant) => {
        if (variant.size) {
          sizes.add(variant.size)
        }
      })
    }
  })

  return Array.from(sizes).sort()
}

// ============================================================================
// STOCK UTILITIES
// ============================================================================

/**
 * Get stock status string
 */
export function getStockStatus(stock: number): 'in-stock' | 'low-stock' | 'out-of-stock' {
  if (stock === 0) return 'out-of-stock'
  if (stock <= 5) return 'low-stock'
  return 'in-stock'
}

/**
 * Get total stock across all variants
 */
export function getTotalProductStock(product: Product): number {
  if (!product.variants || product.variants.length === 0) {
    return 0
  }

  return product.variants.reduce((total: number, variant: PayloadVariant) => {
    return total + (variant.stock || 0)
  }, 0)
}

/**
 * Check if product has multiple variants
 */
export function hasMultipleVariants(product: Product): boolean {
  return Boolean(product.variants && product.variants.length > 1)
}

/**
 * Get default variant for a product
 */
export function getDefaultVariant(product: Product): PayloadVariant | null {
  if (!product.variants || product.variants.length === 0) {
    return null
  }

  // Return first in-stock variant, or first variant if none in stock
  const inStockVariant = product.variants.find((v: PayloadVariant) => v.stock > 0)
  return inStockVariant || product.variants[0]
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get product image URL (first image or empty string)
 */
function getProductImageUrl(product: Product): string {
  if (!product.images || product.images.length === 0) {
    return ''
  }

  const firstImage = product.images[0]
  if (typeof firstImage === 'object' && firstImage !== null && 'image' in firstImage) {
    const img = firstImage.image
    if (typeof img === 'object' && img !== null && 'url' in img) {
      return (img as Media).url || ''
    }
  }

  return ''
}
