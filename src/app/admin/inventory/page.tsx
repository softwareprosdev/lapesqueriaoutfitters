'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Edit,
  Search,
  Download,
  RefreshCw,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ProductThumbnail } from '@/components/admin/ProductThumbnail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';


interface InventoryData {
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    size?: string;
    color?: string;
    material?: string;
    product: {
      id: string;
      name: string;
      slug: string;
      category?: {
        name: string;
      };
      images: Array<{
        url: string;
        alt: string | null;
      }>;
    };
  }>;
  recentTransactions: Array<{
    id: string;
    type: string;
    quantity: number;
    notes: string | null;
    createdAt: Date;
    variant: {
      name: string;
      sku: string;
      product: {
        name: string;
      };
    };
    user: {
      name: string | null;
      email: string;
    } | null;
  }>;
  summary: {
    totalVariants: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalStock: number;
    stockValue: number;
    categoryBreakdown: Array<{
      category: string;
      count: number;
      value: number;
    }>;
    sizeBreakdown: Array<{
      size: string;
      count: number;
      value: number;
    }>;
  };
  tshirtInventory: Array<{
    productName: string;
    variants: Array<{
      size: string;
      color: string;
      stock: number;
      price: number;
    }>;
    totalStock: number;
    totalValue: number;
  }>;
}

export default function EnhancedInventoryPage() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InventoryData | null>(null);
  const [adjusting, setAdjusting] = useState<string | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'RESTOCK' | 'ADJUSTMENT'>('RESTOCK');
  const [adjustmentQty, setAdjustmentQty] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'stock' | 'price' | 'name'>('stock');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [dateRange, setDateRange] = useState('30');

  // Real-time updates
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const REFRESH_INTERVAL = 20000; // 20 seconds for inventory

  const fetchInventory = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setIsRefreshing(true);
      const params = new URLSearchParams({
        filter,
        search: searchQuery,
        category: categoryFilter,
        sortBy,
        sortOrder
      });

      const response = await fetch(`/api/admin/inventory/enhanced?${params}`);

      if (!response.ok) throw new Error('Failed to fetch inventory');

      const inventoryData = await response.json();
      setData(inventoryData);
      setLastRefresh(new Date());
    } catch (error) {
      if (!silent) toast.error('Failed to load inventory');
      console.error(error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filter, searchQuery, categoryFilter, sortBy, sortOrder]);

  // Initial fetch
  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, searchQuery, categoryFilter, sortBy, sortOrder]);

  // Auto-refresh polling
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        fetchInventory(true);
      }, REFRESH_INTERVAL);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [autoRefresh, fetchInventory]);

  // Filtered and sorted variants
  const filteredVariants = useMemo(() => {
    if (!data?.variants) return [];

    return data.variants
      .filter(variant => {
        const matchesSearch = !searchQuery ||
          variant.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          variant.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          variant.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = categoryFilter === 'all' ||
          variant.product.category?.name === categoryFilter;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case 'stock':
            comparison = a.stock - b.stock;
            break;
          case 'price':
            comparison = a.price - b.price;
            break;
          case 'name':
            comparison = a.product.name.localeCompare(b.product.name);
            break;
        }

        return sortOrder === 'desc' ? -comparison : comparison;
      });
  }, [data?.variants, searchQuery, categoryFilter, sortBy, sortOrder]);

  async function handleAdjustment(variantId: string) {
    if (adjustmentQty === 0) {
      toast.error('Quantity cannot be zero');
      return;
    }

    try {
      const response = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId,
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
      fetchInventory();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to adjust stock');
    }
  }

  async function handleBulkAdjustment() {
    if (selectedVariants.length === 0 || adjustmentQty === 0) {
      toast.error('Please select variants and set quantity');
      return;
    }

    try {
      const promises = selectedVariants.map(variantId =>
        fetch('/api/admin/inventory/adjust', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            variantId,
            type: adjustmentType,
            quantity: adjustmentQty,
            reason: adjustmentReason || 'Bulk adjustment',
          }),
        })
      );

      const results = await Promise.all(promises);
      const failed = results.filter(r => !r.ok).length;

      if (failed > 0) {
        toast.error(`${failed} adjustments failed`);
      } else {
        toast.success(`Adjusted ${selectedVariants.length} variants successfully`);
      }

      setAdjusting(null);
      setAdjustmentQty(0);
      setAdjustmentReason('');
      setSelectedVariants([]);
      fetchInventory();
    } catch {
      toast.error('Bulk adjustment failed');
    }
  }

  async function handleExport() {
    try {
      const params = new URLSearchParams({
        format: exportFormat,
        dateRange,
        filter,
        search: searchQuery,
        category: categoryFilter
      });

      const response = await fetch(`/api/admin/inventory/export?${params}`);

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `inventory-${format(new Date(), 'yyyy-MM-dd')}.${exportFormat === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Inventory exported successfully');
    } catch {
      toast.error('Export failed');
    }
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded" />
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Enhanced Inventory Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Comprehensive stock tracking, analytics, and management tools
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Real-time status indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg text-xs sm:text-sm">
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-gray-600 dark:text-gray-300">
              {autoRefresh ? 'Live' : 'Paused'}
            </span>
            <span className="text-gray-400 dark:text-gray-500 hidden sm:inline">
              · {lastRefresh.toLocaleTimeString()}
            </span>
          </div>

          <Button variant="outline" onClick={() => fetchInventory()} disabled={isRefreshing}>
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
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Inventory Report</DialogTitle>
                <DialogDescription>
                  Generate a comprehensive inventory report for your records.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Format</Label>
                  <Select value={exportFormat} onValueChange={(value: 'pdf' | 'excel') => setExportFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          PDF Report
                        </div>
                      </SelectItem>
                      <SelectItem value="excel">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4" />
                          Excel Spreadsheet
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                      <SelectItem value="365">Last year</SelectItem>
                      <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleExport} className="w-full">
                  Generate Report
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Variants</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.summary.totalVariants}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Stock</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.summary.totalStock}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">units</p>
              </div>
              <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{data.summary.lowStockCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">≤ 10 units</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{data.summary.outOfStockCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">0 units</p>
              </div>
              <div className="p-3 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Stock Value</p>
                <p className="text-2xl font-bold text-teal-600">
                  ${data.summary.stockValue.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, SKU, or variant..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {data.summary.categoryBreakdown.map(cat => (
                    <SelectItem key={cat.category} value={cat.category}>
                      {cat.category} ({cat.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Filter</Label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={(value: 'stock' | 'price' | 'name') => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Order</Label>
              <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">↑ Asc</SelectItem>
                  <SelectItem value="desc">↓ Desc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Operations */}
      {selectedVariants.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedVariants.length === filteredVariants.length}
                  onCheckedChange={(checked: boolean) => {
                    if (checked) {
                      setSelectedVariants(filteredVariants.map(v => v.id));
                    } else {
                      setSelectedVariants([]);
                    }
                  }}
                />
                <span className="text-sm font-medium">
                  {selectedVariants.length} of {filteredVariants.length} selected
                </span>
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Bulk Adjust
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Bulk Stock Adjustment</DialogTitle>
                      <DialogDescription>
                        Adjust stock for {selectedVariants.length} selected variants
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Type</Label>
                          <Select value={adjustmentType} onValueChange={(value: 'RESTOCK' | 'ADJUSTMENT') => setAdjustmentType(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="RESTOCK">Add Stock</SelectItem>
                              <SelectItem value="ADJUSTMENT">Set Stock</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={adjustmentQty}
                            onChange={(e) => setAdjustmentQty(Number(e.target.value))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Reason (Optional)</Label>
                        <Textarea
                          value={adjustmentReason}
                          onChange={(e) => setAdjustmentReason(e.target.value)}
                          placeholder="e.g., New shipment arrived"
                        />
                      </div>
                      <Button onClick={handleBulkAdjustment} className="w-full">
                        Apply to {selectedVariants.length} Variants
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm" onClick={() => setSelectedVariants([])}>
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="tshirts">T-Shirts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Main Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Levels</CardTitle>
              <CardDescription>
                {filteredVariants.length} of {data.summary.totalVariants} variants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[800px] overflow-y-auto">
                {filteredVariants.map((variant) => (
                  <div key={variant.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800">
                    <Checkbox
                      checked={selectedVariants.includes(variant.id)}
                      onCheckedChange={(checked: boolean) => {
                        if (checked) {
                          setSelectedVariants(prev => [...prev, variant.id]);
                        } else {
                          setSelectedVariants(prev => prev.filter(id => id !== variant.id));
                        }
                      }}
                    />

                    <ProductThumbnail
                      src={variant.product.images[0]?.url}
                      alt={variant.product.images[0]?.alt || variant.product.name}
                      size="lg"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {variant.product.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {variant.name} • SKU: {variant.sku}
                        </span>
                        {variant.product.category && (
                          <Badge variant="secondary" className="text-xs">
                            {variant.product.category.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            variant.stock === 0
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : variant.stock <= 10
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}
                        >
                          {variant.stock} in stock
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ${variant.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Value: ${(variant.price * variant.stock).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAdjusting(variant.id);
                        setAdjustmentQty(0);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* T-Shirt Inventory Tab */}
        <TabsContent value="tshirts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>T-Shirt Inventory</CardTitle>
              <CardDescription>
                Size and color breakdown for all t-shirt products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data.tshirtInventory.map((tshirt) => (
                  <div key={tshirt.productName} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">{tshirt.productName}</h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total: {tshirt.totalStock} units (${tshirt.totalValue.toFixed(2)})
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tshirt.variants.map((variant, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded">
                          <div>
                            <div className="font-medium">{variant.size}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{variant.color}</div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${
                              variant.stock === 0 ? 'text-red-600' :
                              variant.stock <= 5 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {variant.stock}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              ${variant.price.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.summary.categoryBreakdown.map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between">
                      <span className="font-medium">{cat.category}</span>
                      <div className="text-right">
                        <div className="font-semibold">{cat.count} variants</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          ${cat.value.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Size Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.summary.sizeBreakdown.map((size) => (
                    <div key={size.size} className="flex items-center justify-between">
                      <span className="font-medium">{size.size}</span>
                      <div className="text-right">
                        <div className="font-semibold">{size.count} units</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          ${size.value.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest inventory transactions and adjustments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {data.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={
                      transaction.type === 'RESTOCK' ? 'default' :
                      transaction.type === 'SALE' ? 'secondary' : 'outline'
                    }>
                      {transaction.type}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {format(new Date(transaction.createdAt), 'MMM dd, HH:mm')}
                    </span>
                  </div>
                  <p className="font-medium text-sm">{transaction.variant.product.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {transaction.variant.name} • {transaction.variant.sku}
                  </p>
                  {transaction.notes && (
                    <p className="text-xs text-gray-500 mt-1">{transaction.notes}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${
                    transaction.type === 'RESTOCK' ? 'text-green-600' :
                    transaction.type === 'SALE' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {transaction.type === 'RESTOCK' ? '+' : '-'}
                    {transaction.quantity}
                  </div>
                  {transaction.user && (
                    <div className="text-xs text-gray-500 mt-1">
                      by {transaction.user.name || transaction.user.email}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Adjustment Dialog */}
      {adjusting && (
        <Dialog open={!!adjusting} onOpenChange={() => setAdjusting(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adjust Stock</DialogTitle>
              <DialogDescription>
                Make changes to inventory levels
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type</Label>
                  <Select value={adjustmentType} onValueChange={(value: 'RESTOCK' | 'ADJUSTMENT') => setAdjustmentType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RESTOCK">Add Stock</SelectItem>
                      <SelectItem value="ADJUSTMENT">Set Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={adjustmentQty}
                    onChange={(e) => setAdjustmentQty(Number(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <Label>Reason (Optional)</Label>
                <Textarea
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="e.g., New shipment arrived"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleAdjustment(adjusting)} className="flex-1">
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