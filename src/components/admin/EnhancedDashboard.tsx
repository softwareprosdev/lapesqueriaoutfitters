'use client';

import { useEffect, useState } from 'react';
import StatsCard from './StatsCard';
import SalesChart from './SalesChart';
import { DollarSign, ShoppingCart, TrendingUp, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

interface AnalyticsData {
  period: string;
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalConservationDonations: number;
  };
  ordersByStatus: Array<{
    status: string;
    _count: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  trendData: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export default function EnhancedDashboard() {
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/analytics/overview?period=${period}`);

        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [period]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 dark:bg-slate-700 rounded-lg h-32 animate-pulse" />
          ))}
        </div>
        <div className="bg-gray-100 dark:bg-slate-700 rounded-lg h-96 animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Overview</h2>
        <div className="flex gap-2">
          {['today', 'week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === p
                  ? 'bg-teal-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={`$${data.metrics.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          iconColor="text-green-600 dark:text-green-400"
        />
        <StatsCard
          title="Total Orders"
          value={data.metrics.totalOrders}
          icon={ShoppingCart}
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatsCard
          title="Average Order Value"
          value={`$${data.metrics.averageOrderValue.toFixed(2)}`}
          icon={TrendingUp}
          iconColor="text-purple-600 dark:text-purple-400"
        />
        <StatsCard
          title="Conservation Impact"
          value={`$${data.metrics.totalConservationDonations.toFixed(2)}`}
          icon={Heart}
          iconColor="text-teal-600 dark:text-teal-400"
        />
      </div>

      {/* Revenue Chart */}
      <SalesChart data={data.trendData} />

      {/* Top Products & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Products</h3>
          <div className="space-y-3">
            {data.topProducts.length > 0 ? (
              data.topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-600 rounded-full w-6 h-6 flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{product.quantity} sold</p>
                    </div>
                  </div>
                  <p className="font-semibold text-teal-600 dark:text-teal-400">
                    ${product.revenue.toFixed(2)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No sales data yet</p>
            )}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Orders by Status</h3>
          <div className="space-y-3">
            {data.ordersByStatus.map((status) => (
              <div
                key={status.status}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      status.status === 'PENDING'
                        ? 'bg-yellow-500'
                        : status.status === 'PROCESSING'
                        ? 'bg-blue-500'
                        : status.status === 'SHIPPED'
                        ? 'bg-purple-500'
                        : status.status === 'DELIVERED'
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <p className="font-medium text-gray-900 dark:text-white">
                    {status.status.charAt(0) + status.status.slice(1).toLowerCase()}
                  </p>
                </div>
                <p className="font-semibold text-gray-700 dark:text-gray-300">{status._count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
