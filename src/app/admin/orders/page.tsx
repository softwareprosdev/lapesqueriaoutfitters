'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, DollarSign, TrendingUp, Search, Filter, CheckCircle, FileText, ChevronDown, ChevronUp, RefreshCw, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { exportOrdersToCSV } from '@/lib/utils/csv-export';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  variant?: {
    product?: {
      name: string;
    };
  };
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  conservationDonation?: {
    amount: number;
    percentage: number;
  };
  trackingNumber?: string;
  carrier?: string;
}

interface OrderSummary {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-700';
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-700';
    case 'SHIPPED':
      return 'bg-purple-100 text-purple-700';
    case 'DELIVERED':
      return 'bg-green-100 text-green-700';
    case 'CANCELLED':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<OrderSummary>({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Bulk actions
  const [bulkAction, setBulkAction] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [showBulkOptions, setShowBulkOptions] = useState(false);

  // Real-time updates
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const REFRESH_INTERVAL = 15000; // 15 seconds

  const handleExportOrders = useCallback(() => {
    const exportData = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      status: order.status,
      subtotal: 0,
      shipping: 0,
      tax: 0,
      total: order.total,
      trackingNumber: order.trackingNumber || '',
      carrier: order.carrier || '',
      createdAt: new Date(order.createdAt),
    }));
    exportOrdersToCSV(exportData);
    toast.success('Orders exported to CSV');
  }, [orders]);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setIsRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      if (minAmount) params.set('minAmount', minAmount);
      if (maxAmount) params.set('maxAmount', maxAmount);

      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        // Check if there are new orders
        const prevOrderCount = orders.length;
        setOrders(data.orders);
        setSummary(data.summary);
        setLastRefresh(new Date());

        // Notify if new orders arrived (only on silent refresh)
        if (silent && data.orders.length > prevOrderCount) {
          const newCount = data.orders.length - prevOrderCount;
          toast.success(`${newCount} new order${newCount > 1 ? 's' : ''} received!`, {
            icon: '🛒',
            duration: 5000,
          });
        }
      } else if (!silent) {
        toast.error(data.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      if (!silent) toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [statusFilter, searchQuery, dateFrom, dateTo, minAmount, maxAmount, orders.length]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchQuery, dateFrom, dateTo, minAmount, maxAmount]);

  // Auto-refresh polling
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        fetchOrders(true); // Silent refresh
      }, REFRESH_INTERVAL);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [autoRefresh, fetchOrders]);

  function toggleOrderSelection(orderId: string) {
    const newSelection = new Set(selectedOrders);
    if (newSelection.has(orderId)) {
      newSelection.delete(orderId);
    } else {
      newSelection.add(orderId);
    }
    setSelectedOrders(newSelection);
  }

  function toggleSelectAll() {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map(o => o.id)));
    }
  }

  async function handleBulkAction() {
    if (selectedOrders.size === 0) {
      toast.error('Please select at least one order');
      return;
    }

    if (!bulkAction) {
      toast.error('Please select an action');
      return;
    }

    if (bulkAction === 'mark_shipped' && !trackingNumber) {
      toast.error('Please enter a tracking number');
      return;
    }

    try {
      const response = await fetch('/api/admin/orders/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds: Array.from(selectedOrders),
          action: bulkAction,
          trackingNumber: trackingNumber || undefined,
          carrier: carrier || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Updated ${data.updated} orders successfully`);
        if (data.failed > 0) {
          toast.error(`Failed to update ${data.failed} orders`);
        }
        setSelectedOrders(new Set());
        setBulkAction('');
        setTrackingNumber('');
        setCarrier('');
        fetchOrders();
      } else {
        toast.error(data.error || 'Failed to perform bulk action');
      }
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error('Failed to perform bulk action');
    }
  }

  function clearFilters() {
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setMinAmount('');
    setMaxAmount('');
    setStatusFilter('all');
  }

  const statusCounts = {
    all: summary.totalOrders,
    PENDING: orders.filter(o => o.status === 'PENDING').length,
    PROCESSING: orders.filter(o => o.status === 'PROCESSING').length,
    SHIPPED: orders.filter(o => o.status === 'SHIPPED').length,
    DELIVERED: orders.filter(o => o.status === 'DELIVERED').length,
    CANCELLED: orders.filter(o => o.status === 'CANCELLED').length,
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Orders Management</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">Advanced filtering and bulk actions</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Real-time status indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg text-xs sm:text-sm">
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-gray-600 dark:text-gray-300">
              {autoRefresh ? 'Live' : 'Paused'}
            </span>
            <span className="text-gray-400 dark:text-gray-500 hidden sm:inline">
              · Updated {lastRefresh.toLocaleTimeString()}
            </span>
          </div>

          {/* Refresh controls */}
          <Button
            onClick={() => fetchOrders()}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            className="flex items-center gap-1"
          >
            {autoRefresh ? 'Pause' : 'Resume'}
          </Button>

          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          <Button
            onClick={handleExportOrders}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Order #, email, or name..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* Min Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Amount ($)</label>
                <input
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* Max Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Amount ($)</label>
                <input
                  type="number"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  placeholder="1000.00"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={clearFilters} variant="outline" size="sm">
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{summary.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">${summary.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">${summary.averageOrderValue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Status Filter Tabs - Scrollable on mobile */}
      <div className="overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
        <div className="flex gap-2 min-w-max">
          {(['all', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {status === 'all' ? 'All' : status} ({statusCounts[status]})
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.size > 0 && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''} selected
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBulkOptions(!showBulkOptions)}
                  className="sm:hidden"
                >
                  {showBulkOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>

              <div className={`space-y-3 sm:space-y-0 sm:flex sm:items-end sm:gap-4 ${showBulkOptions ? 'block' : 'hidden sm:flex'}`}>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Action</label>
                    <select
                      value={bulkAction}
                      onChange={(e) => setBulkAction(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Select action...</option>
                      <option value="mark_processing">Mark Processing</option>
                      <option value="mark_shipped">Mark Shipped</option>
                      <option value="mark_delivered">Mark Delivered</option>
                      <option value="cancel">Cancel Orders</option>
                    </select>
                  </div>

                  {bulkAction === 'mark_shipped' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tracking Number</label>
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="1Z999AA10123456784"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Carrier</label>
                        <select
                          value={carrier}
                          onChange={(e) => setCarrier(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                        >
                          <option value="">Select carrier...</option>
                          <option value="USPS">USPS</option>
                          <option value="UPS">UPS</option>
                          <option value="FedEx">FedEx</option>
                          <option value="DHL">DHL</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleBulkAction} className="flex-1 sm:flex-none flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Apply
                  </Button>
                  <Button onClick={() => setSelectedOrders(new Set())} variant="outline" className="flex-1 sm:flex-none">
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base sm:text-lg">Orders ({orders.length})</CardTitle>
            {orders.length > 0 && (
              <Button onClick={toggleSelectAll} variant="outline" size="sm">
                {selectedOrders.size === orders.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No orders found</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className={`bg-white dark:bg-slate-800 border rounded-lg p-4 space-y-3 ${
                      selectedOrders.has(order.id) ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(order.id)}
                          onChange={() => toggleOrderSelection(order.id)}
                          className="rounded mt-1"
                        />
                        <div>
                          <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">#{order.orderNumber.slice(0, 8)}</p>
                          <p className="text-sm text-gray-900 dark:text-white">{order.customerName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{order.customerEmail}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full shrink-0 ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-900 dark:text-gray-100">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Total:</span>
                        <span className="font-semibold ml-1">${order.total.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Items:</span>
                        <span className="font-medium ml-1">{order.items.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Date:</span>
                        <span className="ml-1">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      {order.trackingNumber && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Tracking:</span>
                          <span className="font-mono text-xs ml-1">{order.trackingNumber}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
                      <Link href={`/admin/orders/${order.id}/invoice`}>
                        <Button size="sm" variant="outline" className="w-full flex items-center justify-center gap-1">
                          <FileText className="h-3 w-3" />
                          View Invoice
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-3 w-10">
                        <input
                          type="checkbox"
                          checked={selectedOrders.size === orders.length}
                          onChange={toggleSelectAll}
                          className="rounded"
                        />
                      </th>
                      <th className="pb-3 font-semibold">Order #</th>
                      <th className="pb-3 font-semibold">Customer</th>
                      <th className="pb-3 font-semibold">Items</th>
                      <th className="pb-3 font-semibold">Total</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Tracking</th>
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800 dark:border-slate-700">
                        <td className="py-4">
                          <input
                            type="checkbox"
                            checked={selectedOrders.has(order.id)}
                            onChange={() => toggleOrderSelection(order.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="py-4 font-mono text-sm text-gray-900 dark:text-white">
                          #{order.orderNumber.slice(0, 8)}
                        </td>
                        <td className="py-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{order.customerName}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{order.customerEmail}</div>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {order.items.slice(0, 2).map((item, idx: number) => (
                              <div key={idx}>
                                {item.variant?.product?.name || 'Unknown'} x{item.quantity}
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <div className="text-gray-500 dark:text-gray-400">+{order.items.length - 2} more</div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 font-medium text-gray-900 dark:text-white">${order.total.toFixed(2)}</td>
                        <td className="py-4">
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4">
                          {order.trackingNumber ? (
                            <div className="text-sm text-gray-900 dark:text-white">
                              <div className="font-mono">{order.trackingNumber}</div>
                              {order.carrier && (
                                <div className="text-gray-600 dark:text-gray-400">{order.carrier}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4">
                          <Link href={`/admin/orders/${order.id}/invoice`}>
                            <Button size="sm" variant="outline" className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              Invoice
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
