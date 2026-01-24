'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

// Product type from recommendation engine
interface RecommendedProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  categoryId: string | null;
  description: string | null;
  conservationFocus: string | null;
  featured: boolean;
  score: number;
  reason?: string;
  variants?: Array<{
    id: string;
    sku: string;
    price: number;
    stock: number;
    size?: string | null;
    color?: string | null;
    material?: string | null;
    images?: Array<{ url?: string | null }>;
  }>;
}

interface ProductRecommendationsProps {
  productId?: string;
  limit?: number;
  recommendationType?: 'similar' | 'personalized' | 'trending' | 'frequently-bought';
  title?: string;
  showReason?: boolean;
  className?: string;
}

export default function ProductRecommendations({
  productId,
  limit = 4,
  recommendationType = 'similar',
  title,
  showReason = false,
  className = '',
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        setError(null);

        // Build query params
        const params = new URLSearchParams({
          limit: limit.toString(),
        });

        if (productId) {
          params.append('productId', productId);
        }

        // Fetch recommendations
        const response = await fetch(`/api/recommendations/${recommendationType}?${params}`);

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();

        if (data.success && data.recommendations) {
          setRecommendations(data.recommendations);
        } else {
          setRecommendations([]);
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err instanceof Error ? err.message : 'Failed to load recommendations');
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [productId, limit, recommendationType]);

  // Helper to get primary image
  const getProductImage = (product: RecommendedProduct): string | null => {
    // Try variant images first
    if (product.variants?.[0]?.images?.[0]) {
      return product.variants[0].images[0]?.url || null;
    }
    return null;
  };

  // Helper to get display price
  const getDisplayPrice = (product: RecommendedProduct): number => {
    return product.variants?.[0]?.price || product.basePrice;
  };

  // Helper to get stock level
  const getStock = (product: RecommendedProduct): number => {
    return product.variants?.[0]?.stock || 0;
  };

  // Handle add to cart
  const handleAddToCart = (product: RecommendedProduct) => {
    const variant = product.variants?.[0];

    if (!variant) {
      console.warn('No variant available for product:', product.id);
      return;
    }

    // Convert to cart-compatible format
    const cartProduct = {
      id: product.id,
      name: product.name,
      sku: variant.sku,
      basePrice: product.basePrice,
      inStock: variant.stock > 0,
      images: variant.images || [],
      conservationInfo: {
        donationPercentage: 10, // Default 10%
        conservationFocus: product.conservationFocus,
      },
    };

    const cartVariant = {
      id: variant.id,
      variantName: [variant.size, variant.color, variant.material]
        .filter(Boolean)
        .join(' / ') || 'Default',
      sku: variant.sku,
      price: variant.price,
      stock: variant.stock,
      size: variant.size as 'small' | 'medium' | 'large' | null | undefined,
      color: variant.color,
      material: variant.material,
      images: variant.images,
    };

    addItem(cartProduct, cartVariant, 1);
  };

  // Default title based on type
  const defaultTitle = {
    similar: 'Similar Products',
    personalized: 'Recommended for You',
    trending: 'Trending Now',
    'frequently-bought': 'Frequently Bought Together',
  }[recommendationType];

  const displayTitle = title || defaultTitle;

  // Don't render if no recommendations and not loading
  if (!loading && recommendations.length === 0) {
    return null;
  }

  return (
    <section className={`py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-teal-600">🌊</span>
            {displayTitle}
          </h2>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: limit }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">
              Unable to load recommendations. Please try again later.
            </p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && recommendations.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommendations.map((product) => {
              const imageUrl = getProductImage(product);
              const displayPrice = getDisplayPrice(product);
              const stock = getStock(product);
              const inStock = stock > 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all border border-teal-100 group"
                >
                  {/* Product Image */}
                  <Link href={`/products/${product.slug}`}>
                    <div className="relative h-48 bg-gradient-to-br from-cyan-50 to-blue-50 overflow-hidden">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-5xl opacity-50">🌊</div>
                        </div>
                      )}

                      {/* Featured Badge */}
                      {product.featured && (
                        <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
                           Featured
                        </div>
                      )}

                      {/* Out of Stock Overlay */}
                      {!inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            Out of Stock
                          </span>
                        </div>
                      )}

                      {/* Marine Life Icon on Hover */}
                      <div className="absolute bottom-3 left-3 text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                       
                      </div>
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-4 space-y-3">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-teal-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-teal-600">
                        ${displayPrice.toFixed(2)}
                      </span>
                      {inStock && (
                        <span className="text-xs text-green-600 font-medium">
                          {stock} in stock
                        </span>
                      )}
                    </div>

                    {/* Recommendation Reason */}
                    {showReason && product.reason && (
                      <p className="text-xs text-gray-500 italic">
                        {product.reason}
                      </p>
                    )}

                    {/* Conservation Badge */}
                    {product.conservationFocus && (
                      <div className="bg-green-50 border border-green-200 rounded px-2 py-1">
                        <p className="text-xs text-green-800 flex items-center gap-1">
                          <span>🐢</span>
                          <span className="font-medium">10% supports conservation</span>
                        </p>
                      </div>
                    )}

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!inStock}
                      className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all transform ${
                        inStock
                          ? 'bg-teal-600 hover:bg-teal-700 text-white hover:scale-105'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
