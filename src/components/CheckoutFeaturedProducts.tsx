'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Plus, Check, ShoppingBag } from 'lucide-react';

interface FeaturedProduct {
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    featured: boolean;
  };
  displayPrice: number;
  displayStock: number;
  displayImages: string[];
}

interface CheckoutFeaturedProductsProps {
  cartProductIds: string[];
  limit?: number;
}

export default function CheckoutFeaturedProducts({
  cartProductIds,
  limit = 4,
}: CheckoutFeaturedProductsProps) {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const { addItem, state: cart } = useCart();

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        setLoading(true);
        
        const response = await fetch('/api/products/featured?limit=' + (limit + 4));

        if (!response.ok) {
          throw new Error('Failed to fetch featured products');
        }

        const data = await response.json();

        if (data.products) {
          // Filter out products already in cart
          const cartIds = new Set(cartProductIds);
          const filtered = data.products
            .filter((p: FeaturedProduct) => !cartIds.has(p.product.id))
            .slice(0, limit);
          setProducts(filtered);
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedProducts();
  }, [cartProductIds, limit]);

  const isInCart = (productId: string) => {
    return cart.items.some(item => String(item.productId) === productId);
  };

  const handleQuickAdd = async (featured: FeaturedProduct) => {
    if (featured.displayStock <= 0) return;

    try {
      // Fetch the full product with variants
      const response = await fetch(`/api/products/${featured.product.slug}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      
      const data = await response.json();
      const product = data.product;
      const variant = product.variants?.[0];
      
      if (!variant) return;

      const cartProduct = {
        id: product.id,
        name: product.name,
        sku: variant.sku,
        basePrice: product.basePrice,
        inStock: variant.stock > 0,
        images: variant.images || [],
        conservationInfo: {
          donationPercentage: 10,
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
      setAddedItems(prev => new Set(prev).add(featured.product.id));
      
      setTimeout(() => {
        setAddedItems(prev => {
          const next = new Set(prev);
          next.delete(featured.product.id);
          return next;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-white to-cyan-50 rounded-xl p-6 mt-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-lg p-3">
                <div className="h-24 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-b from-white to-cyan-50 rounded-xl p-6 mt-6 border border-cyan-100">
      {/* Section Header */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <span className="text-lg">✨</span>
          You Might Also Like
          <span className="text-lg">✨</span>
        </h3>
        <p className="text-sm text-gray-600">Our most popular ocean treasures</p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-3">
        {products.map((featured) => {
          const justAdded = addedItems.has(featured.product.id);
          const alreadyInCart = isInCart(featured.product.id);
          const inStock = featured.displayStock > 0;

          return (
            <div
              key={featured.product.id}
              className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-transparent hover:border-teal-300"
            >
              {/* Product Image */}
              <Link href={`/products/${featured.product.slug}`}>
                <div className="relative h-28 bg-gradient-to-br from-cyan-50 to-blue-50 overflow-hidden">
                  {featured.displayImages?.[0] ? (
                    <Image
                      src={featured.displayImages[0]}
                      alt={featured.product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 150px"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-4xl opacity-50">🌊</div>
                    </div>
                  )}
                  
                  {/* Featured Badge */}
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow">
                    ⭐ Featured
                  </div>

                  {/* Stock Badge */}
                  {!inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Product Info */}
              <div className="p-3">
                <Link href={`/products/${featured.product.slug}`}>
                  <h4 className="font-semibold text-gray-900 text-sm group-hover:text-teal-600 transition-colors line-clamp-1">
                    {featured.product.name}
                  </h4>
                </Link>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-lg font-bold text-teal-600">
                    ${featured.displayPrice.toFixed(2)}
                  </span>
                  
                  {/* Quick Add Button */}
                  <button
                    onClick={() => handleQuickAdd(featured)}
                    disabled={!inStock || justAdded || alreadyInCart}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      justAdded || alreadyInCart
                        ? 'bg-green-500 text-white'
                        : inStock
                        ? 'bg-teal-600 hover:bg-teal-700 text-white hover:scale-105'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-3 h-3" />
                        Added!
                      </>
                    ) : alreadyInCart ? (
                      <>
                        <Check className="w-3 h-3" />
                        In Cart
                      </>
                    ) : inStock ? (
                      <>
                        <Plus className="w-3 h-3" />
                        Add
                      </>
                    ) : (
                      'Sold Out'
                    )}
                  </button>
                </div>

                {/* Stock indicator */}
                {inStock && featured.displayStock <= 5 && (
                  <p className="text-xs text-orange-600 mt-1">
                    Only {featured.displayStock} left!
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Link */}
      <div className="text-center mt-4">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 text-sm font-semibold transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          Browse All Products →
        </Link>
      </div>
    </div>
  );
}
