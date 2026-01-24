'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Bell,
  BellOff,
  Check,
  X,
  LineChart,
  BarChart3,
  ShoppingBag,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

type ViewType = 'overview' | 'forecasts' | 'alerts';

interface OverviewData {
  overview: {
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    healthyStock: number;
    avgDailySales: number;
    totalSalesPeriod: number;
    unreadAlerts: number;
  };
  topSelling: Array<{
    variantId: string;
    _sum: { quantity: number };
    variant: {
      id: string;
      name: string;
      sku: string;
      stock: number;
      product: { name: string; slug: string };
    };
    daysOfStock: number | null;
  }>;
  slowMoving: Array<{
    id: string;
    name: string;
    sku: string;
    stock: number;
    product: { name: string; slug: string };
  }>;
  period: number;
}

interface ForecastData {
  id: string;
  sku: string;
  name: string;
  productName: string;
  slug: string;
  currentStock: number;
  salesLast90Days: number;
  dailyAverage: number;
  weeklyAverage: number;
  monthlyAverage: number;
  daysUntilOut: number | null;
  recommendedReorder: number;
  reorderPoint: number;
  stockStatus: string;
}

interface Alert {
  id: string;
  variantId: string;
  alertType: string;
  severity: string;
  message: string;
  currentStock: number;
  threshold: number | null;
  isRead: boolean;
  createdAt: string;
  variant: {
    name: string;
    sku: string;
    product: { name: string };
  };
}

const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_COLORS: Record<string, string> = {
  healthy: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  low_stock: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  out_of_stock: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function InventoryForecastPage() {
  const [view, setView] = useState<ViewType>('overview');
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [forecasts, setForecasts] = useState<ForecastData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [page] = useState(1);
  const [generating, setGenerating] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        view,
        period,
        page: page.toString(),
        limit: '20',
      });

      const response = await fetch(`/api/admin/inventory-forecast?${params}`);
      if (!response.ok) throw new Error('Failed to load data');

      const data = await response.json();

      if (view === 'overview') {
        setOverviewData(data);
      } else if (view === 'forecasts') {
        setForecasts(data.forecasts);
      } else if (view === 'alerts') {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Load inventory forecast error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [view, period, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateAlerts = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/admin/inventory-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_alerts' }),
      });

      if (!response.ok) throw new Error('Failed to generate alerts');

      const result = await response.json();
      toast.success(`Generated ${result.alertsCreated} new alerts`);
      loadData();
    } catch (error) {
      console.error('Generate alerts error:', error);
      toast.error('Failed to generate alerts');
    } finally {
      setGenerating(false);
    }
  };

  const markAllRead = async () => {
    try {
      const response = await fetch('/api/admin/inventory-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' }),
      });

      if (!response.ok) throw new Error('Failed to mark as read');

      toast.success('All alerts marked as read');
      loadData();
    } catch (error) {
      console.error('Mark read error:', error);
      toast.error('Failed to mark as read');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Forecasting</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Predict demand and optimize stock levels</p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <Button variant="outline" onClick={() => loadData()} className="dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            className="bg-teal-500 hover:bg-teal-600 text-white"
            onClick={generateAlerts}
            disabled={generating}
          >
            {generating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Bell className="w-4 h-4 mr-2" />
            )}
            Generate Alerts
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <nav className="flex gap-8">
          <button
            onClick={() => setView('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              view === 'overview'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </div>
          </button>
          <button
            onClick={() => setView('forecasts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              view === 'forecasts'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              Forecasts
            </div>
          </button>
          <button
            onClick={() => setView('alerts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              view === 'alerts'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alerts
              {overviewData?.overview.unreadAlerts ? (
                <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {overviewData.overview.unreadAlerts}
                </span>
              ) : null}
            </div>
          </button>
        </nav>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {view === 'overview' && overviewData && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-900/30">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-green-500 rounded-xl">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{overviewData.overview.healthyStock}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Healthy Stock</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-100 dark:border-orange-900/30">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-orange-500 rounded-xl">
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{overviewData.overview.lowStockCount}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Low Stock Items</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 border-red-100 dark:border-red-900/30">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-red-500 rounded-xl">
                        <X className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{overviewData.overview.outOfStockCount}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Out of Stock</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-100 dark:border-blue-900/30">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-500 rounded-xl">
                        <ShoppingBag className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{overviewData.overview.avgDailySales.toFixed(1)}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Avg. Daily Sales</p>
                  </CardContent>
                </Card>
              </div>

              {/* Top Selling & Slow Moving */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Top Selling Products
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {overviewData.topSelling.length === 0 ? (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-8">No sales data yet</p>
                    ) : (
                      <div className="space-y-3">
                        {overviewData.topSelling.map((item, index) => (
                          <div key={item.variantId} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-700">
                            <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">{item.variant?.product.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{item.variant?.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 dark:text-white">{item._sum.quantity} sold</p>
                              {item.daysOfStock !== null && item.daysOfStock < 30 && (
                                <p className="text-xs text-orange-600 dark:text-orange-400">
                                  ~{item.daysOfStock} days left
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <TrendingDown className="w-5 h-5 text-red-500" />
                      Slow Moving Products
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {overviewData.slowMoving.length === 0 ? (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-8">All products are selling well!</p>
                    ) : (
                      <div className="space-y-3">
                        {overviewData.slowMoving.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-700">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{item.product.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{item.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 dark:text-white">{item.stock} in stock</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">No sales in {period} days</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Forecasts Tab */}
          {view === 'forecasts' && (
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <LineChart className="w-5 h-5 text-blue-500" />
                  Demand Forecasts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {forecasts.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">No forecast data available</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-slate-700">
                          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Product</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">SKU</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Stock</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Daily Avg</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Weekly Avg</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Days Until Out</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Reorder</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {forecasts.map((forecast) => (
                          <tr key={forecast.id} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{forecast.productName}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{forecast.name}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-sm text-gray-600 dark:text-gray-400">{forecast.sku}</td>
                            <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">{forecast.currentStock}</td>
                            <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{forecast.dailyAverage}</td>
                            <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{forecast.weeklyAverage}</td>
                            <td className="py-3 px-4">
                              {forecast.daysUntilOut !== null ? (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span className={forecast.daysUntilOut < 14 ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-gray-300'}>
                                    {forecast.daysUntilOut} days
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {forecast.recommendedReorder > 0 ? (
                                <span className="text-orange-600 dark:text-orange-400 font-medium">
                                  +{forecast.recommendedReorder}
                                </span>
                              ) : (
                                <Check className="w-4 h-4 text-green-500" />
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[forecast.stockStatus]}`}>
                                {forecast.stockStatus.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Alerts Tab */}
          {view === 'alerts' && (
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Bell className="w-5 h-5 text-orange-500" />
                    Inventory Alerts
                  </CardTitle>
                  {alerts.some(a => !a.isRead) && (
                    <Button variant="outline" size="sm" onClick={markAllRead} className="dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700">
                      <BellOff className="w-4 h-4 mr-2" />
                      Mark All Read
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <div className="text-center py-12">
                    <Check className="w-12 h-12 text-green-300 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No active alerts</p>
                    <p className="text-sm text-gray-400">All inventory levels are healthy</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-lg border ${
                          alert.isRead 
                            ? 'bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-700' 
                            : 'bg-white dark:bg-slate-800 border-orange-200 dark:border-orange-900/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              alert.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30' :
                              alert.severity === 'high' ? 'bg-orange-100 dark:bg-orange-900/30' :
                              alert.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                            }`}>
                              <AlertTriangle className={`w-5 h-5 ${
                                alert.severity === 'critical' ? 'text-red-600 dark:text-red-400' :
                                alert.severity === 'high' ? 'text-orange-600 dark:text-orange-400' :
                                alert.severity === 'medium' ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{alert.message}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {alert.variant.product.name} - {alert.variant.name}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(alert.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${SEVERITY_COLORS[alert.severity]}`}>
                            {alert.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
