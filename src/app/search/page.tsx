'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import ProductFilters from '@/components/ProductFilters';

interface ProductVariant {
  price: number;
  stock: number;
}

interface ProductImage {
  url: string;
}

interface ProductCategory {
  name: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  featured?: boolean;
  conservationPercentage: number;
  images?: ProductImage[];
  variants: ProductVariant[];
  category?: ProductCategory;
}

interface SearchResult {
  products: Product[];
  total: number;
  filters: {
    availableColors: string[];
    availableMaterials: string[];
    availableSizes: string[];
    priceRange: { min: number; max: number };
  };
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [activeFilters, setActiveFilters] = useState<{
    colors: string[];
    materials: string[];
    sizes: string[];
    inStockOnly: boolean;
  }>({
    colors: [],
    materials: [],
    sizes: [],
    inStockOnly: false,
  });

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sortBy, activeFilters]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        sort: sortBy,
        ...(activeFilters.colors.length > 0 && {
          colors: activeFilters.colors.join(','),
        }),
        ...(activeFilters.materials.length > 0 && {
          materials: activeFilters.materials.join(','),
        }),
        ...(activeFilters.sizes.length > 0 && {
          sizes: activeFilters.sizes.join(','),
        }),
        ...(activeFilters.inStockOnly && { inStock: 'true' }),
      });

      const response = await fetch(`/api/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {query ? `Search Results for "${query}"` : 'All Products'}
          </h1>
          <p className="text-gray-600">
            {results?.total || 0} {results?.total === 1 ? 'product' : 'products'} found
          </p>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {results && (
            <aside className="w-64 flex-shrink-0">
              <ProductFilters
                filters={results.filters}
                activeFilters={activeFilters}
                onFiltersChange={setActiveFilters}
              />
            </aside>
          )}

          {/* Results */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-gray-600">
                Showing {results?.products.length || 0} of {results?.total || 0}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              </div>
            ) : results && results.products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.products.map((product) => {
                  const firstImage = product.images?.[0]?.url;
                  const minPrice = Math.min(...product.variants.map((v) => v.price));
                  const maxPrice = Math.max(...product.variants.map((v) => v.price));
                  const totalStock = product.variants.reduce(
                    (sum, v) => sum + v.stock,
                    0
                  );

                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <div className="aspect-square relative bg-gray-100">
                        {firstImage ? (
                          <Image
                            src={firstImage}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-24 h-24 bg-teal-200 rounded-full" />
                          </div>
                        )}
                        {product.featured && (
                          <span className="absolute top-2 right-2 bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                            Featured
                          </span>
                        )}
                        {totalStock === 0 && (
                          <span className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                            Out of Stock
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-teal-600 transition-colors">
                          {product.name}
                        </h3>
                        {product.category && (
                          <p className="text-xs text-gray-500 mb-2">{product.category.name}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            {minPrice === maxPrice ? (
                              <p className="text-xl font-bold text-teal-600">
                                ${minPrice.toFixed(2)}
                              </p>
                            ) : (
                              <p className="text-xl font-bold text-teal-600">
                                ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}
                              </p>
                            )}
                          </div>
                          {product.conservationPercentage > 0 && (
                            <span className="text-xs text-teal-700">
                              {product.conservationPercentage}% to conservation
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🌊</div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filters to find what you&apos;re looking for.
                </p>
                <Link
                  href="/products"
                  className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Browse All Products
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
