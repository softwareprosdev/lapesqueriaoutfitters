'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Heart,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  overview: {
    revenue: number;
    revenueGrowth: number;
    orders: number;
    orderGrowth: number;
    averageOrderValue: number;
    totalCustomers: number;
    newCustomers: number;
    conversionRate: number;
    cartToPurchaseRate: number;
  };
  conservation: {
    totalDonated: number;
    donationCount: number;
  };
  ordersByStatus: Record<string, number>;
  statusDistribution: Array<{ status: string; _count: number }>;
  topProducts: Array<{
    variantId: string;
    productName: string;
    variantName: string;
    slug: string;
    _sum: { quantity: number; price: number };
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
    product: { name: string; slug: string };
  }>;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  period: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  // Real-time updates
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const REFRESH_INTERVAL = 30000; // 30 seconds for analytics

  const loadAnalytics = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setIsRefreshing(true);
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      if (!response.ok) throw new Error('Failed to load analytics');

      const result = await response.json();
      setData(result);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Load analytics error:', error);
      if (!silent) toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [period]);

  // Initial fetch
  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  // Auto-refresh polling
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        loadAnalytics(true);
      }, REFRESH_INTERVAL);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [autoRefresh, loadAnalytics]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    const prefix = value >= 0 ? '+' : '';
    return `${prefix}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-slate-400 mt-1">Track your store performance and insights</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Real-time status indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-xs sm:text-sm">
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-slate-300">
              {autoRefresh ? 'Live' : 'Paused'}
            </span>
            <span className="text-slate-500 hidden sm:inline">
              · {lastRefresh.toLocaleTimeString()}
            </span>
          </div>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-800 text-slate-200"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>

          <Button variant="outline" onClick={() => loadAnalytics()} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
          >
            {autoRefresh ? 'Pause' : 'Resume'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl border border-emerald-500/30">
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${data.overview.revenueGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {data.overview.revenueGrowth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {formatPercent(data.overview.revenueGrowth)}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white">{formatCurrency(data.overview.revenue)}</h3>
            <p className="text-sm text-slate-400">Total Revenue</p>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30">
                <ShoppingCart className="w-6 h-6 text-blue-400" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${data.overview.orderGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {data.overview.orderGrowth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {formatPercent(data.overview.orderGrowth)}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white">{data.overview.orders}</h3>
            <p className="text-sm text-slate-400">Total Orders</p>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-xl border border-purple-500/30">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white">{formatCurrency(data.overview.averageOrderValue)}</h3>
            <p className="text-sm text-slate-400">Average Order Value</p>
          </CardContent>
        </Card>

        {/* Customers */}
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-xl border border-orange-500/30">
                <Users className="w-6 h-6 text-orange-400" />
              </div>
              <span className="text-sm font-medium text-emerald-400">+{data.overview.newCustomers} new</span>
            </div>
            <h3 className="text-2xl font-bold text-white">{data.overview.totalCustomers}</h3>
            <p className="text-sm text-slate-400">Total Customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            {data.dailyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.dailyRevenue}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value: number | undefined) => value !== undefined ? [`$${value.toFixed(2)}`, 'Revenue'] : ['$0.00', 'Revenue']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#0f172a', color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#0d9488" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">
                No revenue data for this period
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Second Row - Conversion & Conservation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Conversion Rate */}
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg border border-indigo-500/30">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white">Conversion Metrics</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">View to Cart</span>
                <span className="font-semibold text-white">{data.overview.conversionRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full"
                  style={{ width: `${Math.min(data.overview.conversionRate, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-slate-400">Cart to Purchase</span>
                <span className="font-semibold text-white">{data.overview.cartToPurchaseRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${Math.min(data.overview.cartToPurchaseRate, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conservation Impact */}
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-lg border border-teal-500/30">
                <Heart className="w-5 h-5 text-teal-400" />
              </div>
              <h3 className="font-semibold text-teal-400">Conservation Impact</h3>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-3xl font-bold text-white">{formatCurrency(data.conservation.totalDonated)}</p>
                <p className="text-sm text-slate-400">Total Donated</p>
              </div>
              <div className="pt-2 border-t border-slate-700">
                <p className="text-lg font-semibold text-teal-400">{data.conservation.donationCount}</p>
                <p className="text-sm text-slate-400">Orders with Donations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-500/30">
                <Package className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white">Order Status (Live)</h3>
            </div>
            <div className="space-y-2">
              {data.statusDistribution && data.statusDistribution.length > 0 ? (
                data.statusDistribution.map((item) => (
                  <div key={item.status} className="flex justify-between items-center">
                    <span className="text-sm text-slate-400 capitalize">{item.status.toLowerCase().replace('_', ' ')}</span>
                    <span className="font-medium bg-slate-800 px-2 py-0.5 rounded-full text-xs text-white">{item._count}</span>
                  </div>
                ))
              ) : (
                Object.entries(data.ordersByStatus || {}).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="text-sm text-slate-400 capitalize">{status.toLowerCase().replace('_', ' ')}</span>
                    <span className="font-medium bg-slate-800 px-2 py-0.5 rounded-full text-xs text-white">{count}</span>
                  </div>
                ))
              )}
              {(!data.statusDistribution?.length && !Object.keys(data.ordersByStatus || {}).length) && (
                <p className="text-sm text-slate-500 text-center">No active orders</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Third Row - Top Products & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topProducts.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No sales data yet</p>
            ) : (
              <div className="space-y-4">
                {data.topProducts.slice(0, 5).map((product, index) => (
                  <div key={product.variantId} className="flex items-center gap-4">
                    <span className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-white">{product.productName}</p>
                      {product.variantName && (
                        <p className="text-xs text-slate-500">{product.variantName}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-400">{product._sum.quantity} sold</p>
                      <p className="text-sm text-slate-500">{formatCurrency(product._sum.price || 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.lowStockProducts.length === 0 ? (
              <p className="text-center text-slate-500 py-8">All products are well stocked!</p>
            ) : (
              <div className="space-y-3">
                {data.lowStockProducts.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div>
                      <p className="font-medium text-white">{item.product.name}</p>
                      <p className="text-sm text-slate-500">{item.name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.stock === 0
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : item.stock <= 5
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {item.stock === 0 ? 'Out of Stock' : `${item.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
