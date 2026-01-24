'use server'

import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import { unstable_cache } from 'next/cache';

interface ProductFilters {
  search?: string;
  category?: string;
  featured?: boolean;
  inStock?: boolean;
}

interface ProductDisplay {
  product: {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    basePrice: number;
    featured: boolean;
    conservationPercentage: number;
    conservationFocus: string | null;
  };
  variant: {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    size: string | null;
    color: string | null;
    material: string | null;
  } | null;
  displayPrice: number;
  displayStock: number;
  displayImages: string[];
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    size: string | null;
    color: string | null;
    material: string | null;
  }>;
}

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    variants: true;
    images: true;
  };
}>;

// Transform Prisma Product to ProductDisplay format
function transformProduct(product: ProductWithRelations): ProductDisplay {
  const variants = product.variants || [];
  const firstVariant = variants[0] || null;

  // Calculate total stock across all variants
  const totalStock = variants.reduce((sum: number, v) => sum + (v.stock || 0), 0);

  // Get price from first variant or base price
  const price = firstVariant?.price || product.basePrice || 0;

  // Get images from product images
  const images = product.images?.map((img) => img.url).filter(Boolean) || [];

  return {
    product: {
      id: product.id,
      name: product.name,
      description: product.description,
      slug: product.slug,
      basePrice: product.basePrice,
      featured: product.featured,
      conservationPercentage: product.conservationPercentage,
      conservationFocus: product.conservationFocus,
    },
    variant: firstVariant,
    displayPrice: price,
    displayStock: totalStock,
    displayImages: images,
    variants: variants.map(v => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.price,
      stock: v.stock,
      size: v.size,
      color: v.color,
      material: v.material,
    })),
  };
}

export async function fetchProducts(
  filters: ProductFilters = {},
  pagination: { page: number; limit: number } = { page: 1, limit: 12 }
) {
  try {
    const where: Prisma.ProductWhereInput = {};

    if (filters.featured) {
      where.featured = true;
    }

    if (filters.category) {
      where.categoryId = filters.category;
    }

    if (filters.inStock) {
      where.variants = {
        some: {
          stock: {
            gt: 0,
          },
        },
      };
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          variants: true,
          images: {
            orderBy: {
              position: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.product.count({ where }),
    ]);

    const transformed = products.map(transformProduct);

    return {
      data: transformed,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 1,
    };
  }
}

export async function fetchCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Cached version of featured products fetch - revalidates every 60 seconds
const getCachedFeaturedProducts = unstable_cache(
  async (limit: number) => {
    const products = await prisma.product.findMany({
      where: {
        featured: true,
      },
      include: {
        category: true,
        variants: true,
        images: {
          orderBy: {
            position: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
    return products.map(transformProduct);
  },
  ['featured-products'],
  { revalidate: 60, tags: ['products'] }
);

export async function fetchFeaturedProducts(limit: number = 6) {
  try {
    const featured = await getCachedFeaturedProducts(limit);
    
    // If no featured products, fallback to latest products
    if (featured.length === 0) {
      const latestProducts = await prisma.product.findMany({
        include: {
          category: true,
          variants: true,
          images: {
            orderBy: {
              position: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });
      return latestProducts.map(transformProduct);
    }
    
    return featured;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

export async function fetchProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: true,
        images: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!product) {
      return null;
    }

    return transformProduct(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function fetchProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        images: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!product) {
      return null;
    }

    return transformProduct(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function fetchSimilarProducts(productId: string, limit: number = 6) {
  try {
    // Get the current product to find similar ones
    const currentProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        categoryId: true,
      },
    });

    if (!currentProduct) {
      return [];
    }

    // Fetch products from the same category, excluding the current product
    const products = await prisma.product.findMany({
      where: {
        AND: [
          { id: { not: productId } },
          currentProduct.categoryId
            ? { categoryId: currentProduct.categoryId }
            : {},
        ],
      },
      include: {
        category: true,
        variants: true,
        images: {
          orderBy: {
            position: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return products.map(transformProduct);
  } catch (error) {
    console.error('Error fetching similar products:', error);
    return [];
  }
}
