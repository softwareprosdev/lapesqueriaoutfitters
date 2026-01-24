'use client'

import { useCart, PayloadCartItem } from '@/context/CartContext'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import CartUpsells from '@/components/CartUpsells'
import CartItemImage from '@/components/CartItemImage'
import { Tag, X, Loader2, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TrustBadges } from '@/components/TrustBadges'

export default function CartPage() {
  const { state, clearCart, updateQuantity, removeItem, applyDiscount, removeDiscount } = useCart();
  const router = useRouter();
  const { data: session } = useSession();
  
  // session is available for authenticated users
  void session;
  
  const [discountCode, setDiscountCode] = useState('');
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState('');

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    
    setDiscountLoading(true);
    setDiscountError('');

    try {
      const response = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode, subtotal: state.subtotal }),
      });

      const data = await response.json();

      if (!response.ok) {
        setDiscountError(data.error || 'Invalid discount code');
      } else {
        applyDiscount(
          data.discount.code,
          data.discount.type,
          data.discount.value,
          data.discount.description
        );
        setDiscountCode('');
      }
    } catch {
      setDiscountError('Failed to validate discount code');
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleRemoveDiscount = () => {
    removeDiscount();
    setDiscountError('');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const calculateItemTotal = (item: PayloadCartItem) => {
    return formatPrice(item.price * item.quantity);
  };

  const handleCheckout = () => {
    // Allow guest checkout - no login required
    router.push('/checkout');
  };

  // Reserved for conservation donation display
  // const subtotal = state.subtotal;
  // const donationAmount = state.total * 0.10;

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center bg-slate-900 p-6 sm:p-8 rounded-lg shadow-md max-w-md w-full mx-4 border border-slate-800">
          <div className="text-5xl sm:text-6xl mb-4">🌊</div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
            Your Ocean Cart is Empty
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mb-6 sm:mb-8">
            Ready to discover beautiful ocean-inspired bracelets that support marine conservation?
          </p>
          <Link
            href="/products"
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-6 sm:px-8 py-3 rounded-full font-semibold transition-colors text-sm sm:text-base"
          >
            Shop Ocean Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 shadow-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white text-center sm:text-left">
            Your Ocean Conservation Cart
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item) => (
              <div key={item.id} className="bg-slate-900 rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow border border-slate-800">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* Product Image */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-lg overflow-hidden flex-shrink-0 mx-auto sm:mx-0 border border-slate-700">
                    <CartItemImage
                      src={item.imageUrl}
                      alt={item.productName}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="text-center sm:text-left">
                      <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                        {item.productName}
                      </h3>
                      {item.variantName && (
                        <p className="text-sm text-slate-400 truncate">
                          {item.variantName}
                        </p>
                      )}
                      <div className="text-xs text-slate-500 mt-1 truncate">
                        SKU: {item.variantSku || item.productSku}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                      <div className="text-sm text-slate-400">
                        ${item.price.toFixed(2)} each
                      </div>
                      <div className="text-lg font-bold text-teal-400">
                        {calculateItemTotal(item)}
                      </div>
                    </div>

                    {/* Quantity Controls - Mobile Optimized */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 w-full sm:w-auto">
                        <span className="text-sm font-medium text-slate-300 w-full sm:w-auto text-center sm:text-left">Quantity:</span>
                        <div className="flex items-center border border-slate-700 rounded-lg">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(item.id, item.quantity - 1);
                              }
                            }}
                            className="px-3 py-2 text-slate-400 hover:bg-slate-800 rounded-l-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={item.stock}
                            value={item.quantity}
                            onChange={(e) => {
                              const newQty = parseInt(e.target.value) || 1;
                              if (newQty > 0 && newQty <= item.stock) {
                                updateQuantity(item.id, newQty);
                              }
                            }}
                            className="w-12 sm:w-16 text-center border-x border-slate-700 py-2 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                          <button
                            onClick={() => {
                              if (item.quantity < item.stock) {
                                updateQuantity(item.id, item.quantity + 1);
                              }
                            }}
                            className="px-3 py-2 text-slate-400 hover:bg-slate-800 rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        {item.stock <= 10 && (
                          <span className="text-xs text-orange-400 font-medium whitespace-nowrap">
                            Only {item.stock} left
                          </span>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-sm text-red-400 hover:text-red-300 font-medium hover:underline transition-colors mt-2 sm:mt-0"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Frequently Bought Together - Show for first/main item */}
            {state.items.length > 0 && (
              <CartUpsells
                productId={state.items[0].productId}
                productName={state.items[0].productName}
              />
            )}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-lg shadow-md p-4 sm:p-6 sticky top-4 border border-slate-800">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 text-center sm:text-left">
                Order Summary
              </h2>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="font-semibold text-white">{formatPrice(state.subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-slate-400">Shipping</span>
                  <span className="font-semibold text-white">{formatPrice(state.shipping)}</span>
                </div>

                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-slate-400">Tax</span>
                  <span className="font-semibold text-white">{formatPrice(state.tax)}</span>
                </div>

                {state.discount && (
                  <div className="flex justify-between text-sm sm:text-base text-green-400">
                    <span>Discount ({state.discount.code})</span>
                    <span>-{formatPrice(state.discount.amount)}</span>
                  </div>
                )}

                {/* Discount Code Input */}
                <div className="pt-2">
                  {!state.discount ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Discount code"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                          className="h-9 text-sm bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                        />
                        <Button 
                          onClick={handleApplyDiscount}
                          disabled={discountLoading || !discountCode}
                          variant="outline"
                          size="sm"
                          className="h-9 px-3 border-slate-700 text-slate-300 hover:bg-slate-800"
                        >
                          {discountLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                        </Button>
                      </div>
                      {discountError && (
                        <p className="text-xs text-red-400">{discountError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-green-900/20 border border-green-800 rounded p-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3 h-3 text-green-400" />
                        <span className="text-xs font-medium text-green-400">{state.discount.code} applied</span>
                      </div>
                      <button onClick={handleRemoveDiscount} className="text-slate-400 hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <hr className="border-slate-800" />

                <div className="flex justify-between text-base sm:text-lg">
                  <span className="font-bold text-white">Total</span>
                  <span className="font-bold text-teal-400">{formatPrice(state.total)}</span>
                </div>
              </div>

              {/* Conservation Message */}
              <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 p-3 sm:p-4 rounded-lg border border-cyan-900/30 mb-4 sm:mb-6">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-teal-400 mb-1 sm:mb-2">
                    {formatPrice(state.total * 0.10)}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300">
                    10% of your purchase goes to ocean conservation
                  </div>
                  <div className="text-xs text-slate-400 mt-1 sm:mt-2">
                    Supporting sea turtles, whales, and marine ecosystems in Rio Grande Valley
                  </div>
                </div>
              </div>

              {/* Free Shipping Banner */}
              {state.subtotal >= 50 && (
                <div className="bg-emerald-900/30 text-emerald-400 p-2 sm:p-3 rounded-lg text-center mb-4 border border-emerald-900/50">
                  <div className="font-semibold text-sm sm:text-base">FREE SHIPPING</div>
                  <div className="text-xs sm:text-sm">Your order qualifies for free shipping!</div>
                </div>
              )}

              {/* Action Buttons */}
                <div className="space-y-2 sm:space-y-3">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base shadow-lg shadow-teal-900/20"
                  >
                    Proceed to Checkout
                  </button>
                  <TrustBadges />
                  <button
                    onClick={clearCart}
                    className="w-full border border-slate-700 text-slate-300 hover:bg-slate-800 py-2 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    Clear Cart
                  </button>
                <Link
                  href="/products"
                  className="block text-center text-teal-400 hover:text-teal-300 py-2 text-sm sm:text-base"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}