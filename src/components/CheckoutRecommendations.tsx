'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { Plus, Check } from 'lucide-react';

interface RecommendedProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
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

interface CheckoutRecommendationsProps {
  cartProductIds: string[];
  limit?: number;
}

export default function CheckoutRecommendations({
  cartProductIds,
  limit = 3,
}: CheckoutRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const { addItem, state: cart } = useCart();

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        
        // Use the first cart item to get recommendations
        const productId = cartProductIds[0];
        if (!productId) {
          setRecommendations([]);
          return;
        }

        const response = await fetch(
          `/api/recommendations/similar?productId=${productId}&limit=${limit + 2}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();

        if (data.success && data.recommendations) {
          // Filter out products already in cart
          const cartIds = new Set(cartProductIds);
          const filtered = data.recommendations
            .filter((p: RecommendedProduct) => !cartIds.has(p.id))
            .slice(0, limit);
          setRecommendations(filtered);
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    }

    if (cartProductIds.length > 0) {
      fetchRecommendations();
    } else {
      setLoading(false);
    }
  }, [cartProductIds, limit]);

  // Check if product is already in cart
  const isInCart = (productId: string) => {
    return cart.items.some(item => item.productId === productId);
  };

  const handleAddToCart = (product: RecommendedProduct) => {
    const variant = product.variants?.[0];
    if (!variant || variant.stock <= 0) return;

    const cartProduct = {
      id: product.id,
      name: product.name,
      sku: variant.sku,
      basePrice: product.basePrice,
      inStock: variant.stock > 0,
      images: variant.images || [],
      conservationInfo: {
        donationPercentage: 10,
        conservationFocus: null,
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
    setAddedItems(prev => new Set(prev).add(product.id));
    
    // Reset the "added" state after 2 seconds
    setTimeout(() => {
      setAddedItems(prev => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 2000);
  };

  const getProductImage = (product: RecommendedProduct): string | null => {
    return product.variants?.[0]?.images?.[0]?.url || null;
  };

  const getDisplayPrice = (product: RecommendedProduct): number => {
    return product.variants?.[0]?.price || product.basePrice;
  };

  const getStock = (product: RecommendedProduct): number => {
    return product.variants?.[0]?.stock || 0;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3">
            <div className="h-16 w-16 bg-gray-200 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
        <span>✨</span>
        You Might Also Like
      </h3>
      <div className="space-y-3">
        {recommendations.map((product) => {
          const imageUrl = getProductImage(product);
          const price = getDisplayPrice(product);
          const stock = getStock(product);
          const inStock = stock > 0;
          const justAdded = addedItems.has(product.id);
          const alreadyInCart = isInCart(product.id);

          return (
            <div
              key={product.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              {/* Product Image */}
              <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-cyan-50 to-blue-50">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl opacity-50">
                    🌊
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {product.name}
                </p>
                <p className="text-sm font-bold text-teal-600">
                  ${price.toFixed(2)}
                </p>
              </div>

              {/* Add Button */}
              <button
                onClick={() => handleAddToCart(product)}
                disabled={!inStock || justAdded || alreadyInCart}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                  justAdded || alreadyInCart
                    ? 'bg-green-500 text-white'
                    : inStock
                    ? 'bg-teal-600 hover:bg-teal-700 text-white hover:scale-110'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                title={
                  alreadyInCart
                    ? 'Already in cart'
                    : justAdded
                    ? 'Added!'
                    : inStock
                    ? 'Add to cart'
                    : 'Out of stock'
                }
              >
                {justAdded || alreadyInCart ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-500 mt-2 text-center">
        One-click to add • Updates cart instantly
      </p>
    </div>
  );
}
