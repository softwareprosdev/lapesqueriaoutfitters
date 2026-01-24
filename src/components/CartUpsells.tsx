'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

interface UpsellProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  description: string | null;
  featured: boolean;
  score: number;
  reason?: string;
  variants?: {
    id: string;
    sku: string;
    price: number;
    stock: number;
    variantName: string;
    images?: { url?: string | null }[];
  }[];
}

interface CartUpsellsProps {
  productId: string | number;
  productName?: string;
}

export default function CartUpsells({ productId, productName }: CartUpsellsProps) {
  const [upsells, setUpsells] = useState<UpsellProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    async function fetchUpsells() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/recommendations/cart-upsells?productId=${productId}&limit=3`);

        if (!response.ok) {
          throw new Error('Failed to load recommendations');
        }

        const data = await response.json();

        if (data.success && data.recommendations) {
          setUpsells(data.recommendations);
        } else {
          setUpsells([]);
        }
      } catch (err) {
        console.error('Error fetching upsells:', err);
        setError('Could not load recommendations');
        setUpsells([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUpsells();
  }, [productId]);

  const handleAddToCart = async (product: UpsellProduct) => {
    const variant = product.variants?.[0];
    if (!variant) return;

    setAddingToCart(product.id);

    try {
      // Prepare product object for cart
      const cartProduct = {
        id: product.id,
        name: product.name,
        sku: variant.sku,
        basePrice: variant.price,
        inStock: variant.stock > 0,
        images: variant.images || [],
      };

      const cartVariant = {
        id: variant.id,
        variantName: variant.variantName,
        sku: variant.sku,
        price: variant.price,
        stock: variant.stock,
        images: variant.images || [],
      };

      addItem(cartProduct, cartVariant, 1);

      // Brief success feedback
      setTimeout(() => {
        setAddingToCart(null);
      }, 1000);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setAddingToCart(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Don't show if no upsells or loading failed
  if (!loading && (upsells.length === 0 || error)) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg border-2 border-cyan-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-cyan-100/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">🌊</div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">
              Frequently Bought Together
            </h3>
            {productName && (
              <p className="text-sm text-gray-600">
                Perfect with {productName}
              </p>
            )}
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      {!isCollapsed && (
        <div className="px-6 pb-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              {error}
            </div>
          ) : (
            <>
              {/* Bundle Savings Message */}
              {upsells.length > 0 && (
                <div className="bg-white/60 rounded-lg px-4 py-3 mb-4 border border-cyan-300">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💎</span>
                    <div className="text-sm">
                      <span className="font-semibold text-teal-700">
                        Complete your ocean collection
                      </span>
                      <span className="text-gray-600 ml-1">
                        - Save on shipping when you bundle
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Upsell Products - Horizontal Scrolling on Mobile */}
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-3 min-w-max sm:flex-col sm:space-y-3 sm:min-w-0">
                  {upsells.map((product) => {
                    const variant = product.variants?.[0];
                    if (!variant) return null;

                    const imageUrl = variant.images?.[0]?.url || null;
                    const isAdding = addingToCart === product.id;

                    return (
                      <div
                        key={product.id}
                        className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-100 w-80 sm:w-full flex-shrink-0"
                      >
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="relative w-20 h-20 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg overflow-hidden flex-shrink-0">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="w-10 h-10 bg-cyan-200 rounded-full"></div>
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {product.name}
                            </h4>

                            {product.reason && (
                              <p className="text-xs text-teal-600 mt-1">
                                {product.reason}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-y-2 mt-2">
                              <div className="font-bold text-teal-700">
                                {formatPrice(variant.price)}
                              </div>

                              <button
                                onClick={() => handleAddToCart(product)}
                                disabled={isAdding || variant.stock === 0}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                                  isAdding
                                    ? 'bg-green-500 text-white'
                                    : variant.stock === 0
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-teal-600 hover:bg-teal-700 text-white hover:shadow-md'
                                }`}
                              >
                                {isAdding ? (
                                  <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Added
                                  </span>
                                ) : variant.stock === 0 ? (
                                  'Out of Stock'
                                ) : (
                                  '+ Add to Cart'
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Conservation Message */}
              {upsells.length > 0 && (
                <div className="mt-4 bg-white/60 rounded-lg px-4 py-3 border border-cyan-300">
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <span>🐢</span>
                    <span>
                      Each product supports ocean conservation efforts in Rio Grande Valley
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}