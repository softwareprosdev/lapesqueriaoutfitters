'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, DollarSign, Package, Star, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  featured: boolean;
  variants: {
    id: string;
    stock: number;
  }[];
}

type BulkAction = 'update_price' | 'update_stock' | 'update_status' | 'delete';

export default function BulkEditPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [action, setAction] = useState<BulkAction>('update_price');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Price adjustment
  const [priceAdjustment, setPriceAdjustment] = useState(0);
  const [priceType, setPriceType] = useState<'percentage' | 'fixed'>('percentage');

  // Stock adjustment
  const [stockAdjustment, setStockAdjustment] = useState(0);
  const [stockType, setStockType] = useState<'set' | 'add' | 'subtract'>('add');

  // Status adjustment
  const [featured, setFeatured] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const response = await fetch('/api/admin/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(id: string) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  }

  function selectAll() {
    setSelectedIds(new Set(products.map((p) => p.id)));
  }

  function deselectAll() {
    setSelectedIds(new Set());
  }

  async function handleBulkEdit() {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one product');
      return;
    }

    if (
      action === 'delete' &&
      !confirm(`Are you sure you want to delete ${selectedIds.size} products?`)
    ) {
      return;
    }

    setProcessing(true);

    try {
      const requestData: {
        productIds: string[];
        action: string;
        priceChange?: number;
        priceType?: string;
        stockChange?: number;
        stockType?: string;
        status?: string;
        featured?: boolean;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data?: any;
      } = {
        productIds: Array.from(selectedIds),
        action,
      };

      if (action === 'update_price') {
        requestData.data = {
          priceAdjustment,
          priceType,
        };
      } else if (action === 'update_stock') {
        requestData.data = {
          stockAdjustment,
          stockType,
        };
      } else if (action === 'update_status') {
        requestData.data = {
          featured,
        };
      }

      const response = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Bulk edit failed');
      }

      toast.success(`Successfully updated ${result.updated} products`);
      if (result.failed > 0) {
        toast.error(`${result.failed} products failed to update`);
      }

      // Refresh products list
      fetchProducts();
      deselectAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to perform bulk edit');
    } finally {
      setProcessing(false);
    }
  }

  const totalStock = products
    .filter((p) => selectedIds.has(p.id))
    .reduce((sum, p) => sum + p.variants.reduce((s, v) => s + v.stock, 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/admin/products')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>
        <h1 className="text-3xl font-bold tracking-tight">Bulk Edit Products</h1>
        <p className="text-gray-600 mt-1">
          Select products and apply bulk changes
        </p>
      </div>

      {/* Selection Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-gray-700 font-medium">
            {selectedIds.size} of {products.length} products selected
          </span>
          {selectedIds.size > 0 && (
            <span className="text-gray-500">
              Total stock: {totalStock} units
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
          >
            Select All
          </button>
          <button
            onClick={deselectAll}
            className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Deselect All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-900">Products</h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading products...</div>
              ) : products.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No products found</div>
              ) : (
                <div className="divide-y">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        selectedIds.has(product.id) ? 'bg-teal-50' : ''
                      }`}
                      onClick={() => toggleSelect(product.id)}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(product.id)}
                          onChange={() => {}}
                          className="w-4 h-4 text-teal-600 rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{product.name}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span>${product.basePrice.toFixed(2)}</span>
                            <span>
                              {product.variants.reduce((sum, v) => sum + v.stock, 0)} in stock
                            </span>
                            {product.featured && (
                              <span className="text-yellow-600 flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bulk Actions Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
            <h2 className="font-semibold text-gray-900 mb-4">Bulk Action</h2>

            {/* Action Selector */}
            <div className="space-y-4 mb-6">
              <button
                onClick={() => setAction('update_price')}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                  action === 'update_price'
                    ? 'border-teal-600 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                <span className="font-medium">Update Prices</span>
              </button>

              <button
                onClick={() => setAction('update_stock')}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                  action === 'update_stock'
                    ? 'border-teal-600 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Package className="w-5 h-5" />
                <span className="font-medium">Update Stock</span>
              </button>

              <button
                onClick={() => setAction('update_status')}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                  action === 'update_status'
                    ? 'border-teal-600 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Star className="w-5 h-5" />
                <span className="font-medium">Update Status</span>
              </button>

              <button
                onClick={() => setAction('delete')}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                  action === 'delete'
                    ? 'border-red-600 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Trash2 className="w-5 h-5" />
                <span className="font-medium">Delete Products</span>
              </button>
            </div>

            {/* Action-specific inputs */}
            {action === 'update_price' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Price Adjustment
                  </label>
                  <input
                    type="number"
                    value={priceAdjustment}
                    onChange={(e) => setPriceAdjustment(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Type
                  </label>
                  <select
                    value={priceType}
                    onChange={(e) => setPriceType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
              </div>
            )}

            {action === 'update_stock' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Stock Adjustment
                  </label>
                  <input
                    type="number"
                    value={stockAdjustment}
                    onChange={(e) => setStockAdjustment(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Type
                  </label>
                  <select
                    value={stockType}
                    onChange={(e) => setStockType(e.target.value as 'add' | 'subtract' | 'set')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="set">Set to value</option>
                    <option value="add">Add to current</option>
                    <option value="subtract">Subtract from current</option>
                  </select>
                </div>
              </div>
            )}

            {action === 'update_status' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Featured Status
                  </label>
                  <select
                    value={featured ? 'true' : 'false'}
                    onChange={(e) => setFeatured(e.target.value === 'true')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="true">Featured</option>
                    <option value="false">Not Featured</option>
                  </select>
                </div>
              </div>
            )}

            {action === 'delete' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This action cannot be undone. Products with existing
                  orders cannot be deleted.
                </p>
              </div>
            )}

            {/* Apply Button */}
            <button
              onClick={handleBulkEdit}
              disabled={selectedIds.size === 0 || processing}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                action === 'delete'
                  ? 'bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300'
                  : 'bg-teal-600 hover:bg-teal-700 text-white disabled:bg-gray-300'
              } disabled:cursor-not-allowed`}
            >
              {processing ? 'Processing...' : `Apply to ${selectedIds.size} products`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
