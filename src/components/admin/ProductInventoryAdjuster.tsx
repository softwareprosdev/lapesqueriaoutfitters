'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Package, ChevronDown, ChevronUp, Plus, Minus, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

interface Variant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  size: string | null;
  color: string | null;
  material: string | null;
}

interface ProductInventoryAdjusterProps {
  productId: string;
  productName: string;
  variants: Variant[];
  onStockUpdate?: (variantId: string, newStock: number) => void;
}

export default function ProductInventoryAdjuster({
  productName,
  variants,
  onStockUpdate,
}: ProductInventoryAdjusterProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [adjusting, setAdjusting] = useState<string | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'RESTOCK' | 'ADJUSTMENT'>('RESTOCK');
  const [adjustmentQty, setAdjustmentQty] = useState(0);
  const [loading, setLoading] = useState(false);
  const [localStocks, setLocalStocks] = useState<Record<string, number>>(
    Object.fromEntries(variants.map((v) => [v.id, v.stock]))
  );

  // Only show for admin users
  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }

  async function handleAdjustment(variantId: string) {
    if (adjustmentQty === 0 && adjustmentType === 'RESTOCK') {
      toast.error('Quantity cannot be zero');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId,
          type: adjustmentType,
          quantity: adjustmentQty,
          notes: `Quick adjustment from product page for ${productName}`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Adjustment failed');
      }

      const result = await response.json();

      // Update local state
      setLocalStocks((prev) => ({
        ...prev,
        [variantId]: result.newStock,
      }));

      // Notify parent component
      if (onStockUpdate) {
        onStockUpdate(variantId, result.newStock);
      }

      toast.success(`Stock updated to ${result.newStock}`);
      setAdjusting(null);
      setAdjustmentQty(0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to adjust stock');
    } finally {
      setLoading(false);
    }
  }

  function quickAdjust(variantId: string, delta: number) {
    const currentStock = localStocks[variantId] || 0;
    const newStock = Math.max(0, currentStock + delta);

    // Set to adjustment mode with the new stock value
    setAdjusting(variantId);
    setAdjustmentType('ADJUSTMENT');
    setAdjustmentQty(newStock);
  }

  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-amber-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-200 rounded-lg">
            <Settings className="w-5 h-5 text-amber-700" />
          </div>
          <div className="text-left">
            <span className="font-semibold text-amber-900 block">Admin: Inventory Management</span>
            <span className="text-xs text-amber-700">Adjust stock levels directly</span>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-amber-700" />
        ) : (
          <ChevronDown className="w-5 h-5 text-amber-700" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-amber-200 p-4 space-y-4">
          {variants.map((variant) => {
            const currentStock = localStocks[variant.id] ?? variant.stock;
            const variantLabel = [variant.size, variant.color, variant.material]
              .filter(Boolean)
              .join(' / ') || variant.name;

            return (
              <div key={variant.id} className="bg-white rounded-lg p-4 border border-amber-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{variantLabel}</h4>
                    <p className="text-xs text-gray-500">SKU: {variant.sku}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span
                      className={`font-bold text-lg ${
                        currentStock === 0
                          ? 'text-red-600'
                          : currentStock <= 5
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}
                    >
                      {currentStock}
                    </span>
                  </div>
                </div>

                {adjusting === variant.id ? (
                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Type
                        </label>
                        <select
                          value={adjustmentType}
                          onChange={(e) => setAdjustmentType(e.target.value as 'RESTOCK' | 'ADJUSTMENT')}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        >
                          <option value="RESTOCK">Add Stock (+)</option>
                          <option value="ADJUSTMENT">Set Stock (=)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {adjustmentType === 'RESTOCK' ? 'Add Quantity' : 'New Stock Level'}
                        </label>
                        <input
                          type="number"
                          min={adjustmentType === 'ADJUSTMENT' ? 0 : undefined}
                          value={adjustmentQty}
                          onChange={(e) => setAdjustmentQty(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAdjustment(variant.id)}
                        disabled={loading}
                        className="flex-1 bg-teal-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setAdjusting(null);
                          setAdjustmentQty(0);
                        }}
                        className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => quickAdjust(variant.id, -1)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                      <span className="text-sm font-medium">1</span>
                    </button>
                    <button
                      onClick={() => quickAdjust(variant.id, 1)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm font-medium">1</span>
                    </button>
                    <button
                      onClick={() => {
                        setAdjusting(variant.id);
                        setAdjustmentType('RESTOCK');
                        setAdjustmentQty(0);
                      }}
                      className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm font-medium"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
