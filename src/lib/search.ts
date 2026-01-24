import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  materials?: string[];
  sizes?: string[];
  inStockOnly?: boolean;
  featured?: boolean;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'popular' | 'name';
}

interface ProductWithVariants {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  sku: string;
  featured: boolean;
  categoryId: string | null;
  conservationFocus: string | null;
  createdAt: Date;
  variants: Array<{
    id: string;
    price: number;
    stock: number;
    color: string | null;
    material: string | null;
    size: string | null;
  }>;
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    position: number;
  }>;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface SearchResult {
  products: ProductWithVariants[];
  total: number;
  filters: {
    availableColors: string[];
    availableMaterials: string[];
    availableSizes: string[];
    priceRange: { min: number; max: number };
  };
}

export async function searchProducts(
  filters: SearchFilters,
  page: number = 1,
  limit: number = 12
): Promise<SearchResult> {
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.ProductWhereInput = {};

  // Text search
  if (filters.query) {
    where.OR = [
      { name: { contains: filters.query, mode: 'insensitive' } },
      { description: { contains: filters.query, mode: 'insensitive' } },
      { sku: { contains: filters.query, mode: 'insensitive' } },
      { conservationFocus: { contains: filters.query, mode: 'insensitive' } },
    ];
  }

  // Category filter
  if (filters.category) {
    where.categoryId = filters.category;
  }

  // Featured filter
  if (filters.featured) {
    where.featured = true;
  }

  // Variant filters (price, stock, color, material, size)
  const variantFilters: Prisma.ProductVariantWhereInput = {};

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    variantFilters.price = {};
    if (filters.minPrice !== undefined) {
      variantFilters.price.gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      variantFilters.price.lte = filters.maxPrice;
    }
  }

  if (filters.inStockOnly) {
    variantFilters.stock = { gt: 0 };
  }

  if (filters.colors && filters.colors.length > 0) {
    variantFilters.color = { in: filters.colors };
  }

  if (filters.materials && filters.materials.length > 0) {
    variantFilters.material = { in: filters.materials };
  }

  if (filters.sizes && filters.sizes.length > 0) {
    variantFilters.size = { in: filters.sizes };
  }

  // Only add variant filters if any exist
  if (Object.keys(variantFilters).length > 0) {
    where.variants = { some: variantFilters };
  }

  // Build orderBy clause
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };

  switch (filters.sortBy) {
    case 'newest':
      orderBy = { createdAt: 'desc' };
      break;
    case 'price-asc':
      orderBy = { basePrice: 'asc' };
      break;
    case 'price-desc':
      orderBy = { basePrice: 'desc' };
      break;
    case 'name':
      orderBy = { name: 'asc' };
      break;
    case 'popular':
      // TODO: Add popularity tracking (view count, purchase count)
      orderBy = { createdAt: 'desc' };
      break;
  }

  // Execute search query
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        variants: true,
        images: {
          orderBy: { position: 'asc' },
        },
        category: true,
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  // Get filter metadata (available options)
  const allProducts = await prisma.product.findMany({
    include: {
      variants: true,
    },
  });

  const availableColors = new Set<string>();
  const availableMaterials = new Set<string>();
  const availableSizes = new Set<string>();
  let minPrice = Infinity;
  let maxPrice = 0;

  allProducts.forEach((product) => {
    product.variants.forEach((variant) => {
      if (variant.color) availableColors.add(variant.color);
      if (variant.material) availableMaterials.add(variant.material);
      if (variant.size) availableSizes.add(variant.size);
      if (variant.price < minPrice) minPrice = variant.price;
      if (variant.price > maxPrice) maxPrice = variant.price;
    });
  });

  return {
    products,
    total,
    filters: {
      availableColors: Array.from(availableColors).sort(),
      availableMaterials: Array.from(availableMaterials).sort(),
      availableSizes: Array.from(availableSizes).sort(),
      priceRange: {
        min: minPrice === Infinity ? 0 : minPrice,
        max: maxPrice,
      },
    },
  };
}
