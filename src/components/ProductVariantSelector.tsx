'use client';

import { useState } from 'react';
import AddToCartButton from '@/components/AddToCartButton';
import { cn } from '@/lib/utils';
import { Minus, Plus } from 'lucide-react';

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

interface Product {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  basePrice: number;
  featured: boolean;
  conservationPercentage: number;
  conservationFocus: string | null;
}

interface ProductVariantSelectorProps {
  product: Product;
  variants: Variant[];
  initialVariant: Variant | null;
  displayImages: string[];
}

export default function ProductVariantSelector({
  product,
  variants,
  initialVariant,
  displayImages,
}: ProductVariantSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(initialVariant);
  const [quantity, setQuantity] = useState(1);
  
  // Extract unique options
  const sizes = Array.from(new Set(variants.map(v => v.size).filter(Boolean))).sort();
  const colors = Array.from(new Set(variants.map(v => v.color).filter(Boolean))).sort();
  const materials = Array.from(new Set(variants.map(v => v.material).filter(Boolean))).sort();

  const handleVariantChange = (type: 'size' | 'color' | 'material', value: string) => {
    const currentSize = selectedVariant?.size;
    const currentColor = selectedVariant?.color;
    const currentMaterial = selectedVariant?.material;

    // Try to find a variant that matches the new selection + current other selections
    let nextVariant = variants.find(v => {
       const matchSize = type === 'size' ? v.size === value : (currentSize ? v.size === currentSize : true);
       const matchColor = type === 'color' ? v.color === value : (currentColor ? v.color === currentColor : true);
       const matchMaterial = type === 'material' ? v.material === value : (currentMaterial ? v.material === currentMaterial : true);
       return matchSize && matchColor && matchMaterial;
    });

    // If exact match not found, fall back to just matching the new selection
    // (This prevents getting stuck in an invalid combination)
    if (!nextVariant) {
        nextVariant = variants.find(v => {
            if (type === 'size') return v.size === value;
            if (type === 'color') return v.color === value;
            if (type === 'material') return v.material === value;
            return false;
        });
    }

    if (nextVariant) {
        setSelectedVariant(nextVariant);
    }
  };

  const currentPrice = selectedVariant ? selectedVariant.price : product.basePrice;
  const currentStock = selectedVariant ? selectedVariant.stock : 0;

  return (
    <div className="space-y-6">
       {/* Price and Stock Status */}
       <div className="border-t border-b border-gray-200 py-6">
        <div className="flex items-baseline gap-4">
            <span className="text-4xl font-bold text-teal-600">
            ${currentPrice.toFixed(2)}
            </span>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
            currentStock > 0
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
            {currentStock > 0 ? `${currentStock} in stock` : 'Out of Stock'}
            </span>
        </div>
        </div>

        {/* Variant Selectors */}
        <div className="space-y-4">
            {sizes.length > 0 && (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Size</label>
                    <div className="flex flex-wrap gap-2">
                        {sizes.map((size) => (
                            <button
                                key={size as string}
                                onClick={() => handleVariantChange('size', size as string)}
                                className={cn(
                                    "px-4 py-2 border rounded-md text-sm transition-all",
                                    selectedVariant?.size === size
                                        ? "border-teal-600 bg-teal-50 text-teal-700 ring-1 ring-teal-600"
                                        : "border-gray-200 hover:border-teal-600 text-gray-700"
                                )}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {colors.length > 0 && (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Color</label>
                    <div className="flex flex-wrap gap-2">
                        {colors.map((color) => (
                            <button
                                key={color as string}
                                onClick={() => handleVariantChange('color', color as string)}
                                className={cn(
                                    "px-4 py-2 border rounded-md text-sm transition-all",
                                    selectedVariant?.color === color
                                        ? "border-teal-600 bg-teal-50 text-teal-700 ring-1 ring-teal-600"
                                        : "border-gray-200 hover:border-teal-600 text-gray-700"
                                )}
                            >
                                {color}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {materials.length > 0 && (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Material</label>
                    <div className="flex flex-wrap gap-2">
                        {materials.map((material) => (
                            <button
                                key={material as string}
                                onClick={() => handleVariantChange('material', material as string)}
                                className={cn(
                                    "px-4 py-2 border rounded-md text-sm transition-all",
                                    selectedVariant?.material === material
                                        ? "border-teal-600 bg-teal-50 text-teal-700 ring-1 ring-teal-600"
                                        : "border-gray-200 hover:border-teal-600 text-gray-700"
                                )}
                            >
                                {material}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Product Details (Dynamic) */}
        <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 text-lg">Product Details</h3>
            <dl className="space-y-2">
                <div className="flex gap-3">
                <dt className="text-gray-600 min-w-[100px]">SKU:</dt>
                <dd className="text-gray-900 font-medium">{selectedVariant?.sku || product.slug}</dd>
                </div>
                {selectedVariant?.size && (
                <div className="flex gap-3">
                    <dt className="text-gray-600 min-w-[100px]">Size:</dt>
                    <dd className="text-gray-900">{selectedVariant.size}</dd>
                </div>
                )}
                {selectedVariant?.color && (
                <div className="flex gap-3">
                    <dt className="text-gray-600 min-w-[100px]">Color:</dt>
                    <dd className="text-gray-900">{selectedVariant.color}</dd>
                </div>
                )}
                {selectedVariant?.material && (
                <div className="flex gap-3">
                    <dt className="text-gray-600 min-w-[100px]">Material:</dt>
                    <dd className="text-gray-900">{selectedVariant.material}</dd>
                </div>
                )}
            </dl>
        </div>

        {/* Quantity Selector */}
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Quantity</label>
            <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Decrease quantity"
                    >
                        <Minus className="w-5 h-5 text-gray-600" />
                    </button>
                    <input
                        type="number"
                        min="1"
                        max={currentStock}
                        value={quantity}
                        onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setQuantity(Math.min(Math.max(1, val), currentStock));
                        }}
                        className="w-16 text-center text-lg font-semibold border-x border-gray-200 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                        onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                        disabled={quantity >= currentStock}
                        className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Increase quantity"
                    >
                        <Plus className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
                {currentStock > 0 && currentStock <= 10 && (
                    <span className="text-sm text-amber-600 font-medium">
                        Only {currentStock} left!
                    </span>
                )}
            </div>
        </div>

        {/* Add To Cart */}
        <div className="space-y-4">
            <AddToCartButton
                product={{
                    id: product.id,
                    name: product.name,
                    sku: selectedVariant?.sku || product.slug,
                    basePrice: product.basePrice,
                    images: displayImages.map(url => ({ url })),
                    conservationPercentage: product.conservationPercentage,
                    conservationFocus: product.conservationFocus,
                }}
                variant={selectedVariant ? {
                    id: selectedVariant.id,
                    variantName: selectedVariant.name,
                    sku: selectedVariant.sku,
                    price: selectedVariant.price,
                    stock: selectedVariant.stock,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    size: selectedVariant.size as any,
                    color: selectedVariant.color,
                    material: selectedVariant.material,
                    images: displayImages.map(url => ({ url })),
                } : null}
                stock={currentStock}
                quantity={quantity}
            />
            {quantity > 1 && (
                <p className="text-center text-sm text-gray-600">
                    Subtotal: <span className="font-semibold text-teal-600">${(currentPrice * quantity).toFixed(2)}</span>
                </p>
            )}
        </div>
    </div>
  );
}
