'use client';

import { useState } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterOptions {
  availableColors: string[];
  availableMaterials: string[];
  availableSizes: string[];
  priceRange: { min: number; max: number };
}

interface ActiveFilters {
  colors: string[];
  materials: string[];
  sizes: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly: boolean;
}

interface ProductFiltersProps {
  filters: FilterOptions;
  activeFilters: ActiveFilters;
  onFiltersChange: (filters: ActiveFilters) => void;
}

export default function ProductFilters({
  filters,
  activeFilters,
  onFiltersChange,
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFilter = (type: 'colors' | 'materials' | 'sizes', value: string) => {
    const current = activeFilters[type];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    onFiltersChange({ ...activeFilters, [type]: updated });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      colors: [],
      materials: [],
      sizes: [],
      inStockOnly: false,
    });
  };

  const hasActiveFilters =
    activeFilters.colors.length > 0 ||
    activeFilters.materials.length > 0 ||
    activeFilters.sizes.length > 0 ||
    activeFilters.inStockOnly ||
    activeFilters.minPrice !== undefined ||
    activeFilters.maxPrice !== undefined;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* In Stock Toggle */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={activeFilters.inStockOnly}
            onChange={(e) =>
              onFiltersChange({ ...activeFilters, inStockOnly: e.target.checked })
            }
            className="rounded text-teal-600 focus:ring-teal-500"
          />
          <span className="text-sm font-medium">In Stock Only</span>
        </label>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={`$${filters.priceRange.min}`}
            value={activeFilters.minPrice || ''}
            onChange={(e) =>
              onFiltersChange({
                ...activeFilters,
                minPrice: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            className="w-24 px-3 py-2 border rounded-lg text-sm"
          />
          <span className="text-gray-500">to</span>
          <input
            type="number"
            placeholder={`$${filters.priceRange.max}`}
            value={activeFilters.maxPrice || ''}
            onChange={(e) =>
              onFiltersChange({
                ...activeFilters,
                maxPrice: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            className="w-24 px-3 py-2 border rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Colors */}
      {filters.availableColors.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Colors</h3>
          <div className="space-y-2">
            {filters.availableColors.map((color) => (
              <label key={color} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeFilters.colors.includes(color)}
                  onChange={() => toggleFilter('colors', color)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm capitalize">{color}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Materials */}
      {filters.availableMaterials.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Materials</h3>
          <div className="space-y-2">
            {filters.availableMaterials.map((material) => (
              <label key={material} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeFilters.materials.includes(material)}
                  onChange={() => toggleFilter('materials', material)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm capitalize">{material}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Sizes */}
      {filters.availableSizes.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Sizes</h3>
          <div className="flex flex-wrap gap-2">
            {filters.availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => toggleFilter('sizes', size)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilters.sizes.includes(size)
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {size.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div>
          <Button
            onClick={clearAllFilters}
            variant="outline"
            className="w-full"
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 bg-teal-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-40"
      >
        <SlidersHorizontal className="h-5 w-5" />
        Filters
        {hasActiveFilters && (
          <span className="bg-white text-teal-600 px-2 py-1 rounded-full text-xs font-bold">
            {activeFilters.colors.length +
              activeFilters.materials.length +
              activeFilters.sizes.length +
              (activeFilters.inStockOnly ? 1 : 0)}
          </span>
        )}
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Filters</h2>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-teal-600 hover:text-teal-700"
              >
                Clear all
              </button>
            )}
          </div>
          <FilterContent />
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Filters</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <FilterContent />
            </div>
            <div className="sticky bottom-0 bg-white border-t p-4">
              <Button
                onClick={() => setIsOpen(false)}
                className="w-full"
              >
                Show Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
