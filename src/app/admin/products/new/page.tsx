'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { MultiImageUpload } from '@/components/admin/MultiImageUpload';

interface ProductVariant {
  size: string;
  color: string;
  material: string;
  priceAdjustment: string; // +/- from base price
  stockOverride: string; // optional stock override
}

interface Category {
  id: string;
  name: string;
}

interface BraceletSize {
  id: string;
  name: string;
  label: string;
  isActive?: boolean; // Optional to handle API responses
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableSizes, setAvailableSizes] = useState<BraceletSize[]>([]);
  const [hasVariants, setHasVariants] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    sku: '',
    price: '',
    stock: '',
    size: '',
    color: '',
    material: '',
    featured: false,
    conservationPercentage: '10',
    conservationFocus: '',
    categoryId: '',
  });

  useEffect(() => {
    fetchCategories();
    fetchSizes();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchSizes = async () => {
    try {
      const response = await fetch('/api/admin/bracelet-sizes');
      if (response.ok) {
        const data = await response.json();
        setAvailableSizes(data.filter((s: BraceletSize) => s.isActive !== false));
      }
    } catch (error) {
      console.error('Failed to fetch sizes:', error);
    }
  };

  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const [images, setImages] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const addVariant = () => {
    setVariants([...variants, {
      size: '',
      color: '',
      material: '',
      priceAdjustment: '0',
      stockOverride: '',
    }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: string) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  // Generate variant name from attributes
  const generateVariantName = (variant: ProductVariant) => {
    const parts = [];
    if (variant.size) parts.push(variant.size);
    if (variant.color) parts.push(variant.color);
    if (variant.material) parts.push(variant.material);
    return parts.length > 0 ? parts.join(' - ') : 'Default';
  };

  // Generate variant SKU from product SKU and attributes
  const generateVariantSku = (variant: ProductVariant, index: number) => {
    const parts = [formData.sku];
    if (variant.size) parts.push(variant.size.substring(0, 2).toUpperCase());
    if (variant.color) parts.push(variant.color.substring(0, 3).toUpperCase());
    if (variant.material) parts.push(variant.material.substring(0, 3).toUpperCase());
    if (parts.length === 1) parts.push(`V${index + 1}`);
    return parts.join('-');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Build variants array
      let productVariants;

      if (hasVariants && variants.length > 0) {
        // Multiple variants with their own attributes
        productVariants = variants.map((v, index) => ({
          name: generateVariantName(v),
          sku: generateVariantSku(v, index),
          price: parseFloat(formData.price) + parseFloat(v.priceAdjustment || '0'),
          stock: v.stockOverride ? parseInt(v.stockOverride) : parseInt(formData.stock),
          size: v.size || null,
          color: v.color || null,
          material: v.material || null,
        }));
      } else {
        // Single default variant using product-level price/stock and attributes
        const variantNameParts = [];
        if (formData.size) variantNameParts.push(formData.size);
        if (formData.color) variantNameParts.push(formData.color);
        if (formData.material) variantNameParts.push(formData.material);
        const variantName = variantNameParts.length > 0 ? variantNameParts.join(' - ') : 'Default';

        productVariants = [{
          name: variantName,
          sku: formData.sku,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          size: formData.size || null,
          color: formData.color || null,
          material: formData.material || null,
        }];
      }

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          sku: formData.sku,
          basePrice: parseFloat(formData.price),
          conservationPercentage: parseFloat(formData.conservationPercentage),
          conservationFocus: formData.conservationFocus,
          categoryId: formData.categoryId || null,
          featured: formData.featured,
          variants: productVariants,
          images: images.filter(img => img.trim() !== '').map((url, index) => ({
            url,
            position: index,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create product');
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add New Product</h1>
          <p className="text-gray-600 mt-1">Create a new product in your catalog</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Ocean Wave Bracelet"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  required
                  placeholder="OWB-001"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  placeholder="29.99"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  placeholder="25"
                />
              </div>
            </div>

            {/* Size, Color, Material - Product Attributes */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <select
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800"
                >
                  <option value="">Select size</option>
                  {availableSizes.map((size) => (
                    <option key={size.id} value={size.name}>
                      {size.name} - {size.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="Blue, Turquoise, Multi-color"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  name="material"
                  value={formData.material}
                  onChange={handleInputChange}
                  placeholder="Glass Beads, Natural Stone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                placeholder="Handcrafted bracelet inspired by ocean waves..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="ocean-wave-bracelet"
                />
                <p className="text-xs text-gray-500">Auto-generated from name</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800"
                >
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="conservationPercentage">Conservation Donation %</Label>
                <Input
                  id="conservationPercentage"
                  name="conservationPercentage"
                  type="number"
                  step="0.1"
                  value={formData.conservationPercentage}
                  onChange={handleInputChange}
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conservationFocus">Conservation Focus</Label>
                <Input
                  id="conservationFocus"
                  name="conservationFocus"
                  value={formData.conservationFocus}
                  onChange={handleInputChange}
                  placeholder="Sea Turtle Conservation"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="rounded"
              />
              <Label htmlFor="featured" className="cursor-pointer">
                Featured Product (show on homepage)
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Product Variants - Optional */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Size / Color / Material Variants</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Optional - Add variants if this product comes in different sizes, colors, or materials
                </p>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasVariants}
                    onChange={(e) => {
                      setHasVariants(e.target.checked);
                      if (e.target.checked && variants.length === 0) {
                        addVariant();
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Has Variants</span>
                </label>
              </div>
            </div>
          </CardHeader>
          {hasVariants && (
            <CardContent className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4 bg-gray-50 dark:bg-slate-900">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">
                      Variant {index + 1}: {generateVariantName(variant) || 'New Variant'}
                    </h4>
                    <Button
                      type="button"
                      onClick={() => removeVariant(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Size</Label>
                      <select
                        value={variant.size || ''}
                        onChange={(e) => updateVariant(index, 'size', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800"
                      >
                        <option value="">Select size</option>
                        {availableSizes.map((size) => (
                          <option key={size.id} value={size.name}>
                            {size.name} - {size.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <Input
                        value={variant.color}
                        onChange={(e) => updateVariant(index, 'color', e.target.value)}
                        placeholder="Blue"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Material</Label>
                      <Input
                        value={variant.material}
                        onChange={(e) => updateVariant(index, 'material', e.target.value)}
                        placeholder="Glass Beads"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Price Adjustment ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={variant.priceAdjustment}
                        onChange={(e) => updateVariant(index, 'priceAdjustment', e.target.value)}
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-500">
                        Final: ${(parseFloat(formData.price || '0') + parseFloat(variant.priceAdjustment || '0')).toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Stock Override</Label>
                      <Input
                        type="number"
                        value={variant.stockOverride}
                        onChange={(e) => updateVariant(index, 'stockOverride', e.target.value)}
                        placeholder={formData.stock || 'Same as main'}
                      />
                      <p className="text-xs text-gray-500">
                        Leave empty to use main stock ({formData.stock || '0'})
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    Auto-generated SKU: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{generateVariantSku(variant, index)}</code>
                  </p>
                </div>
              ))}

              <Button type="button" onClick={addVariant} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Variant
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Product Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent>
            <MultiImageUpload
              images={images}
              onImagesChange={setImages}
              maxImages={10}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/admin/products">
            <Button type="button" variant="outline" disabled={loading}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}
