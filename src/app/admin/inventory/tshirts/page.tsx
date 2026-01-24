'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Package,
  AlertTriangle,
  DollarSign,
  Edit,
  Search,
  RefreshCw,
  Shirt,
  Link,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TShirtVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
  price: number;
  sku: string;
}

interface TShirtProduct {
  productId: string;
  productName: string;
  variants: TShirtVariant[];
  totalStock: number;
  totalValue: number;
}

interface TShirtData {
  tshirts: TShirtProduct[];
  summary: {
    totalProducts: number;
    totalVariants: number;
    totalStock: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
}

export default function TShirtInventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TShirtData | null>(null);
  const [adjusting, setAdjusting] = useState<TShirtVariant | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'RESTOCK' | 'ADJUSTMENT'>('RESTOCK');
  const [adjustmentQty, setAdjustmentQty] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const REFRESH_INTERVAL = 20000;

  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setIsRefreshing(true);
      const response = await fetch('/api/admin/tshirts-inventory');

      if (!response.ok) throw new Error('Failed to fetch t-shirt data');

      const result = await response.json();

      // Transform data to match our interface
      const tshirts: TShirtProduct[] = (result.tshirts || []).map((t: { productId: string; productName: string; variants: TShirtVariant[]; analytics?: { totalStock: number; totalValue: number } }) => ({
        productId: t.productId,
        productName: t.productName,
        variants: t.variants || [],
        totalStock: t.analytics?.totalStock || t.variants?.reduce((sum: number, v: TShirtVariant) => sum + v.stock, 0) || 0,
        totalValue: t.analytics?.totalValue || t.variants?.reduce((sum: number, v: TShirtVariant) => sum + (v.stock * v.price), 0) || 0,
      }));

      // Calculate summary
      const allVariants = tshirts.flatMap(t => t.variants);
      const summary = {
        totalProducts: tshirts.length,
        totalVariants: allVariants.length,
        totalStock: allVariants.reduce((sum, v) => sum + v.stock, 0),
        totalValue: allVariants.reduce((sum, v) => sum + (v.stock * v.price), 0),
        lowStockCount: allVariants.filter(v => v.stock > 0 && v.stock <= 10).length,
        outOfStockCount: allVariants.filter(v => v.stock === 0).length,
      };

      setData({ tshirts, summary });
      setLastRefresh(new Date());
    } catch (error) {
      if (!silent) toast.error('Failed to load t-shirt inventory');
      console.error(error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        fetchData(true);
      }, REFRESH_INTERVAL);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [autoRefresh, fetchData]);

  const filteredTshirts = useMemo(() => {
    if (!data?.tshirts) return [];

    return data.tshirts.filter(tshirt => {
      const matchesSearch = !searchQuery ||
        tshirt.productName.toLowerCase().includes(searchQuery.toLowerCase());

      if (filter === 'low_stock') {
        return matchesSearch && tshirt.variants.some(v => v.stock > 0 && v.stock <= 10);
      }
      if (filter === 'out_of_stock') {
        return matchesSearch && tshirt.variants.some(v => v.stock === 0);
      }

      return matchesSearch;
    });
  }, [data?.tshirts, searchQuery, filter]);

  async function handleAdjustment() {
    if (!adjusting || adjustmentQty === 0) {
      toast.error('Please enter a quantity');
      return;
    }

    try {
      const response = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: adjusting.id,
          type: adjustmentType,
          quantity: adjustmentQty,
          reason: adjustmentReason || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Adjustment failed');
      }

      toast.success('Stock adjusted successfully');
      setAdjusting(null);
      setAdjustmentQty(0);
      setAdjustmentReason('');
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to adjust stock');
    }
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 dark:bg-slate-700 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <Shirt className="w-8 h-8 text-purple-500" />
            T-Shirt Inventory
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage stock levels for all t-shirt products
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg text-xs sm:text-sm">
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-gray-600 dark:text-gray-300">
              {autoRefresh ? 'Live' : 'Paused'}
            </span>
            <span className="text-gray-400 dark:text-gray-500 hidden sm:inline">
              · {lastRefresh.toLocaleTimeString()}
            </span>
          </div>

          <Button variant="outline" onClick={() => fetchData()} disabled={isRefreshing}>
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

          <Link href="/admin/inventory/tshirts/manage">
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Manage Inventory
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.summary.totalProducts}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <Shirt className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Stock</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.summary.totalStock}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">units</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{data.summary.lowStockCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">≤ 10 units</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{data.summary.outOfStockCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">0 units</p>
              </div>
              <div className="p-3 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Stock Value</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${data.summary.totalValue.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-gray-700 dark:text-gray-300">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  id="search"
                  placeholder="Search by product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-700 dark:text-gray-300">Filter</Label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* T-Shirt Inventory List */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Stock Levels</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {filteredTshirts.length} of {data.tshirts.length} products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredTshirts.length === 0 ? (
              <div className="text-center py-12">
                <Shirt className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No t-shirts found</p>
              </div>
            ) : (
              filteredTshirts.map((tshirt) => (
                <div key={tshirt.productId} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{tshirt.productName}</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total: {tshirt.totalStock} units (${tshirt.totalValue.toFixed(2)})
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {tshirt.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-700"
                      >
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{variant.size}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{variant.color}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className={`font-semibold ${
                              variant.stock === 0
                                ? 'text-red-600 dark:text-red-400'
                                : variant.stock <= 10
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-green-600 dark:text-green-400'
                            }`}>
                              {variant.stock}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              ${variant.price.toFixed(2)}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setAdjusting(variant);
                              setAdjustmentQty(0);
                            }}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Adjustment Dialog */}
      {adjusting && (
        <Dialog open={!!adjusting} onOpenChange={() => setAdjusting(null)}>
          <DialogContent className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Adjust Stock</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                {adjusting.size} - {adjusting.color} (Current: {adjusting.stock})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Type</Label>
                  <Select value={adjustmentType} onValueChange={(value: 'RESTOCK' | 'ADJUSTMENT') => setAdjustmentType(value)}>
                    <SelectTrigger className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RESTOCK">Add Stock</SelectItem>
                      <SelectItem value="ADJUSTMENT">Set Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Quantity</Label>
                  <Input
                    type="number"
                    value={adjustmentQty}
                    onChange={(e) => setAdjustmentQty(Number(e.target.value))}
                    className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-300">Reason (Optional)</Label>
                <Textarea
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="e.g., New shipment arrived"
                  className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAdjustment} className="flex-1">
                  Apply
                </Button>
                <Button variant="outline" onClick={() => setAdjusting(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
