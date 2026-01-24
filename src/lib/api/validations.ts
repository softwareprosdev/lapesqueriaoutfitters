/**
 * Zod Validation Schemas for Admin API
 *
 * Provides type-safe validation for all API requests
 */

import { z } from 'zod'

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  page: z.coerce.number().int().min(1).optional(),
})

export const idParamSchema = z.object({
  id: z.string().cuid(),
})

export const searchParamsSchema = z.object({
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
})

// ============================================================================
// PRODUCT SCHEMAS
// ============================================================================

export const productImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  position: z.number().int().min(0).default(0),
})

export const productVariantSchema = z.object({
  name: z.string().min(1).max(255),
  sku: z.string().min(1).max(100),
  price: z.number().positive(),
  stock: z.number().int().min(0).default(0),
  size: z.string().optional(),
  color: z.string().optional(),
  material: z.string().optional(),
  images: z.array(productImageSchema).optional(),
})

export const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().optional(),
  sku: z.string().min(1).max(100),
  basePrice: z.number().positive(),
  featured: z.boolean().default(false),
  conservationPercentage: z.number().min(0).max(100).default(10),
  conservationFocus: z.string().optional(),
  categoryId: z.string().cuid().optional(),
  variants: z.array(productVariantSchema).min(1),
  images: z.array(productImageSchema).optional(),
})

export const updateProductSchema = createProductSchema.partial().extend({
  variants: z.array(productVariantSchema).optional(),
})

export const productFiltersSchema = searchParamsSchema.extend({
  categoryId: z.string().cuid().optional(),
  featured: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  inStock: z.coerce.boolean().optional(),
})

// ============================================================================
// CATEGORY SCHEMAS
// ============================================================================

export const createCategorySchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().optional(),
  image: z.string().url().optional(),
})

export const updateCategorySchema = createCategorySchema.partial()

export const categoryFiltersSchema = searchParamsSchema

// ============================================================================
// ORDER SCHEMAS
// ============================================================================

export const orderStatusSchema = z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
})

export const orderFiltersSchema = searchParamsSchema.extend({
  status: orderStatusSchema.optional(),
  customerEmail: z.string().email().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const userRoleSchema = z.enum(['ADMIN', 'STAFF', 'CUSTOMER'])

export const userFiltersSchema = searchParamsSchema.extend({
  role: userRoleSchema.optional(),
})

// ============================================================================
// INVENTORY SCHEMAS
// ============================================================================

export const transactionTypeSchema = z.enum(['SALE', 'RESTOCK', 'ADJUSTMENT', 'RESERVATION'])

export const createInventoryTransactionSchema = z.object({
  variantId: z.string().cuid(),
  type: transactionTypeSchema,
  quantity: z.number().int(),
  notes: z.string().optional(),
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type PaginationParams = z.infer<typeof paginationSchema>
export type IdParam = z.infer<typeof idParamSchema>
export type SearchParams = z.infer<typeof searchParamsSchema>

export type ProductImage = z.infer<typeof productImageSchema>
export type ProductVariant = z.infer<typeof productVariantSchema>
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductFilters = z.infer<typeof productFiltersSchema>

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CategoryFilters = z.infer<typeof categoryFiltersSchema>

export type OrderStatus = z.infer<typeof orderStatusSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type OrderFilters = z.infer<typeof orderFiltersSchema>

export type UserRole = z.infer<typeof userRoleSchema>
export type UserFilters = z.infer<typeof userFiltersSchema>

export type TransactionType = z.infer<typeof transactionTypeSchema>
export type CreateInventoryTransactionInput = z.infer<typeof createInventoryTransactionSchema>
