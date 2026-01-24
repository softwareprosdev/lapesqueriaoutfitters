'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart,
  Mail,
  Clock,
  DollarSign,
  RefreshCw,
  Search,
  Send,
  Eye,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  User,
  Package,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  productName: string;
}

interface AbandonedCart {
  sessionId: string;
  userId: string | null;
  lastActivity: string;
  cartValue: number;
  itemCount: number;
  user: {
    id: string;
    email: string;
    name: string | null;
  } | null;
  items: CartItem[];
  recoveryEmailSent: boolean;
  timeSinceAbandoned: number;
}

interface Stats {
  totalAbandoned: number;
  totalValue: number;
  averageValue: number;
  recoveryRate: number;
  emailsSent: number;
  recovered: number;
  recoveredValue: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const loadCarts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/abandoned-carts?page=${page}&limit=20`);
      if (!response.ok) throw new Error('Failed to load abandoned carts');

      const result = await response.json();
      setCarts(result.carts);
      setStats(result.stats);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Load abandoned carts error:', error);
      toast.error('Failed to load abandoned carts');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadCarts();
  }, [loadCarts]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTimeAgo = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  };

  const sendRecoveryEmail = async (cart: AbandonedCart) => {
    if (!cart.user?.email) {
      toast.error('No email address available for this cart');
      return;
    }

    setSendingEmail(cart.sessionId);
    try {
      const response = await fetch('/api/admin/abandoned-carts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: cart.sessionId,
          email: cart.user.email,
          items: cart.items,
          cartValue: cart.cartValue,
        }),
      });

      if (!response.ok) throw new Error('Failed to send recovery email');

      toast.success('Recovery email sent successfully');
      loadCarts();
    } catch (error) {
      console.error('Send recovery email error:', error);
      toast.error('Failed to send recovery email');
    } finally {
      setSendingEmail(null);
    }
  };

  const filteredCarts = carts.filter((cart) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      cart.user?.email?.toLowerCase().includes(query) ||
      cart.user?.name?.toLowerCase().includes(query) ||
      cart.sessionId.toLowerCase().includes(query) ||
      cart.items.some(item => item.productName.toLowerCase().includes(query))
    );
  });

  if (loading && carts.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Abandoned Cart Recovery</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track and recover abandoned shopping carts</p>
        </div>
        <Button variant="outline" onClick={() => loadCarts()} className="dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-100 dark:border-orange-900/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange-500 rounded-xl">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAbandoned}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Abandoned Carts</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 border-red-100 dark:border-red-900/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-500 rounded-xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalValue)}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Potential Revenue Lost</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-100 dark:border-blue-900/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500 rounded-xl">
                  <Mail className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.emailsSent}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Recovery Emails Sent</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-900/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-500 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.recoveryRate.toFixed(1)}%</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Recovery Rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Search by email, name, or product..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      {/* Carts Table */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <ShoppingCart className="w-5 h-5 text-orange-500" />
            Abandoned Carts ({filteredCarts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCarts.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No abandoned carts found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Carts are considered abandoned after 1 hour of inactivity without purchase
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Items</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Cart Value</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Abandoned</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCarts.map((cart) => (
                    <tr key={cart.sessionId} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="py-3 px-4">
                        {cart.user ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{cart.user.name || 'No name'}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{cart.user.email}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-500 dark:text-gray-400">Guest</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">{cart.sessionId.slice(0, 8)}...</p>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{cart.itemCount} item{cart.itemCount !== 1 ? 's' : ''}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(Number(cart.cartValue))}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{formatTimeAgo(cart.timeSinceAbandoned)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {cart.recoveryEmailSent ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Email Sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 rounded-full text-xs font-medium">
                            <AlertCircle className="w-3 h-3" />
                            Not Contacted
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCart(cart)}
                            className="dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {cart.user?.email && !cart.recoveryEmailSent && (
                            <Button
                              size="sm"
                              onClick={() => sendRecoveryEmail(cart)}
                              disabled={sendingEmail === cart.sessionId}
                              className="bg-teal-500 hover:bg-teal-600 text-white"
                            >
                              {sendingEmail === cart.sessionId ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {(page - 1) * pagination.limit + 1} to{' '}
                {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} carts
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="dark:border-slate-700 dark:text-slate-200"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="dark:border-slate-700 dark:text-slate-200"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cart Detail Modal */}
      {selectedCart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 border border-gray-200 dark:border-slate-700">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cart Details</h2>
                <Button variant="outline" size="sm" onClick={() => setSelectedCart(null)} className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                  Close
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 border border-gray-100 dark:border-slate-700">
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Customer Information</h3>
                {selectedCart.user ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Name:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedCart.user.name || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Email:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedCart.user.email}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Guest user (no account)</p>
                )}
              </div>

              {/* Cart Items */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Cart Items ({selectedCart.items.length})</h3>
                <div className="space-y-3">
                  {selectedCart.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-700">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.productName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart Summary */}
              <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold text-gray-900 dark:text-white">Cart Total:</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">
                    {formatCurrency(Number(selectedCart.cartValue))}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {selectedCart.user?.email && !selectedCart.recoveryEmailSent && (
                <Button
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                  onClick={() => {
                    sendRecoveryEmail(selectedCart);
                    setSelectedCart(null);
                  }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Recovery Email
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
