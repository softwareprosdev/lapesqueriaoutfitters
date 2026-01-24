'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Package, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  threshold: number;
  productName: string;
}

interface LowStockWidgetProps {
  threshold?: number;
  limit?: number;
}

export function LowStockWidget({ threshold = 10, limit = 5 }: LowStockWidgetProps) {
  const [items, setItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLowStock() {
      try {
        const response = await fetch(`/api/admin/inventory/alerts?threshold=${threshold}&limit=${limit}`);
        const data = await response.json();
        
        if (response.ok) {
          setItems(data.items);
        } else {
          setError(data.error || 'Failed to load alerts');
        }
      } catch {
        setError('Failed to load alerts');
      } finally {
        setLoading(false);
      }
    }

    fetchLowStock();
  }, [threshold, limit]);

  const getSeverity = (stock: number, threshold: number) => {
    if (stock === 0) return 'critical';
    if (stock <= threshold / 2) return 'high';
    return 'medium';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      default:
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
    }
  };

  const getStockIcon = (stock: number) => {
    if (stock === 0) return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (stock <= 5) return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    return <Package className="h-4 w-4 text-yellow-500" />;
  };

  if (loading) {
    return (
      <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/20">
        <CardHeader className="p-4">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Low Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800">
        <CardContent className="p-4">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-l-4 ${
      items.some(i => i.stock === 0) 
        ? 'border-l-red-500 bg-red-50/50 dark:bg-red-900/20' 
        : items.length > 0 
          ? 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-900/20'
          : 'border-l-green-500 bg-green-50/50 dark:bg-green-900/20'
    }`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base text-gray-900 dark:text-white">
            {items.length > 0 ? (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            ) : (
              <Package className="h-4 w-4 text-green-500" />
            )}
            Low Stock Alerts
          </CardTitle>
          {items.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {items.length} items
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {items.length === 0 ? (
          <div className="text-center py-4">
            <Package className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All stock levels are healthy!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const severity = getSeverity(item.stock, item.threshold);
              return (
                <Link
                  key={item.id}
                  href={`/admin/inventory?search=${item.sku}`}
                  className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {getStockIcon(item.stock)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.name} • SKU: {item.sku}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(severity)}`}>
                      {item.stock} left
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        
        {items.length > 0 && (
          <Link href="/admin/inventory?filter=low-stock">
            <Button variant="outline" size="sm" className="w-full mt-3 text-xs">
              <TrendingDown className="h-3 w-3 mr-1" />
              View All Low Stock
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

// Standalone widget for dashboard
export function InventoryAlertsWidget() {
  return (
    <div className="grid gap-4">
      <LowStockWidget threshold={10} limit={5} />
    </div>
  );
}
