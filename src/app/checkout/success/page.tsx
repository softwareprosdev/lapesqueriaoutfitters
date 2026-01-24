'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2, Package } from 'lucide-react';
import Link from 'next/link';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const session_id = searchParams.get('session_id');
    setSessionId(session_id);

    if (session_id) {
      // Clear cart after successful checkout
      clearCart();
      setLoading(false);
    } else {
      // No session ID, redirect to cart
      router.push('/cart');
    }
  }, [searchParams, router, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-3xl">Thank You for Your Order!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-2">
                Your order has been successfully placed and is being processed.
              </p>
              <p className="text-sm text-gray-500">
                Order confirmation has been sent to your email.
              </p>
              {sessionId && (
                <p className="text-xs text-gray-400 mt-2 font-mono">
                  Session ID: {sessionId.slice(0, 20)}...
                </p>
              )}
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="text-4xl">🌊</div>
                <div>
                  <h3 className="font-semibold text-teal-900 mb-1">
                    You&apos;re Making a Difference!
                  </h3>
                  <p className="text-sm text-teal-700">
                    10% of your purchase is dedicated to marine life conservation
                    in South Padre Island and the Rio Grande Valley. Together,
                    we&apos;re protecting sea turtles, whales, and ocean ecosystems.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="text-4xl">🏆</div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">
                    Rewards Points Earned!
                  </h3>
                  <p className="text-sm text-blue-700">
                    You&apos;ve earned rewards points with this purchase. Check your
                    account to see your new tier and unlock exclusive benefits.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center gap-2 text-gray-700 mb-4">
                <Package className="h-5 w-5" />
                <h3 className="font-semibold">What&apos;s Next?</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="mr-2">1.</span>
                  <span>You&apos;ll receive an order confirmation email shortly</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2.</span>
                  <span>We&apos;ll send a shipping notification when your order ships</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3.</span>
                  <span>Track your order status in your account dashboard</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link 
                href="/account/orders" 
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                View Order History
              </Link>
              <Link 
                href="/products" 
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
