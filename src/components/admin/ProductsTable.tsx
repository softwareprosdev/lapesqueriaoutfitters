'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Edit, Download, FileSpreadsheet } from 'lucide-react';
import { DeleteProductButton } from '@/components/admin/DeleteProductButton';
import { ProductThumbnail } from '@/components/admin/ProductThumbnail';
import { exportProductsToCSV } from '@/lib/utils/csv-export';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  basePrice: number;
  category: {
    name: string;
  } | null;
  conservationPercentage: number;
  featured: boolean;
  variants: Array<{
    id: string;
    stock: number;
  }>;
  images: Array<{
    url: string;
  }>;
  createdAt: Date;
}

interface ProductsTableProps {
  initialProducts: Product[];
}

export function ProductsTable({ initialProducts }: ProductsTableProps) {
  const products = initialProducts;

  const handleExport = () => {
    const exportData = products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      basePrice: product.basePrice,
      category: product.category?.name || '',
      conservationPercentage: product.conservationPercentage,
      featured: product.featured,
      variantsCount: product.variants.length,
      totalStock: product.variants.reduce((sum, v) => sum + v.stock, 0),
      createdAt: new Date(product.createdAt),
    }));

    exportProductsToCSV(exportData);
    toast.success('Products exported to CSV');
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Products</h1>
          <p className="text-slate-300 mt-1 text-sm sm:text-base">Manage your product catalog</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={handleExport} variant="outline" className="flex-1 sm:flex-none border-slate-700 text-slate-200 hover:bg-slate-800">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Link href="/admin/products/new" className="flex-1 sm:flex-none">
            <Button className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Link
          href="/admin/products/import"
          className="flex items-center gap-3 p-3 sm:p-4 bg-slate-800 border border-slate-700 rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="p-2 sm:p-3 bg-blue-900/30 rounded-lg">
            <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm sm:text-base">CSV Import</h3>
            <p className="text-xs sm:text-sm text-slate-400">Bulk import products</p>
          </div>
        </Link>

        <Link
          href="/admin/products/bulk-edit"
          className="flex items-center gap-3 p-3 sm:p-4 bg-slate-800 border border-slate-700 rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="p-2 sm:p-3 bg-purple-900/30 rounded-lg">
            <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm sm:text-base">Bulk Edit</h3>
            <p className="text-xs sm:text-sm text-slate-400">Edit multiple products</p>
          </div>
        </Link>

        <Link
          href="/admin/inventory"
          className="flex items-center gap-3 p-3 sm:p-4 bg-slate-800 border border-slate-700 rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="p-2 sm:p-3 bg-green-900/30 rounded-lg">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm sm:text-base">Inventory</h3>
            <p className="text-xs sm:text-sm text-slate-400">Manage stock levels</p>
          </div>
        </Link>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg text-white">All Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 mb-4">No products yet</p>
              <Link href="/admin/products/new">
                <Button variant="outline" className="border-slate-600 text-slate-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first product
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <ProductThumbnail
                        src={product.images[0]?.url}
                        alt={product.name}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">{product.name}</h3>
                        <p className="text-sm text-slate-400">{product.sku}</p>
                        {product.featured && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-900/50 text-blue-300 text-xs rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-100">
                      <div>
                        <span className="text-slate-400">Price:</span>
                        <span className="font-medium ml-1">${product.basePrice.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Variants:</span>
                        <span className="font-medium ml-1">{product.variants.length}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Category:</span>
                        <span className="font-medium ml-1">
                          {product.category?.name || 'None'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Conservation:</span>
                        <span className="font-medium ml-1">{product.conservationPercentage}%</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-700">
                      <Link href={`/admin/products/${product.id}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full border-slate-600 text-slate-200 hover:bg-slate-700">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <DeleteProductButton productId={product.id} productName={product.name} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-700">
                    <tr className="text-left text-slate-300">
                      <th className="pb-3 font-semibold">Image</th>
                      <th className="pb-3 font-semibold">Product</th>
                      <th className="pb-3 font-semibold">SKU</th>
                      <th className="pb-3 font-semibold">Category</th>
                      <th className="pb-3 font-semibold">Price</th>
                      <th className="pb-3 font-semibold">Variants</th>
                      <th className="pb-3 font-semibold">Conservation</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b last:border-0 border-slate-700 hover:bg-slate-700/30 transition-colors">
                        <td className="py-4">
                          <ProductThumbnail
                            src={product.images[0]?.url}
                            alt={product.name}
                            size="md"
                          />
                        </td>
                        <td className="py-4">
                          <div>
                            <div className="font-medium text-white">{product.name}</div>
                            {product.featured && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-blue-900/50 text-blue-300 text-xs rounded-full">
                                Featured
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 text-sm text-slate-400">{product.sku}</td>
                        <td className="py-4">
                          {product.category ? (
                            <span className="inline-block px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">
                              {product.category.name}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-sm">No category</span>
                          )}
                        </td>
                        <td className="py-4 font-medium text-white">${product.basePrice.toFixed(2)}</td>
                        <td className="py-4 text-sm text-slate-400">
                          {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                        </td>
                        <td className="py-4 text-sm text-slate-400">{product.conservationPercentage}%</td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Button variant="outline" size="sm" className="border-slate-600 text-slate-200 hover:bg-slate-700">
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            </Link>
                            <DeleteProductButton productId={product.id} productName={product.name} />
                          </div>
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
    </>
  );
}