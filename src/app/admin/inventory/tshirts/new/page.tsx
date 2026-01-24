'use client';

import { useState } from 'react';
import {
  Plus,
  Save,
  X,
  Upload,
  Package,
  Tag,
  Layers,
  Image as ImageIcon,
  RefreshCw,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import { uploadProductImage } from '@/app/actions/upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const COLORS = [
  { name: 'White', hex: '#FFFFFF', class: 'bg-white' },
  { name: 'Black', hex: '#1A1A1A', class: 'bg-gray-900' },
  { name: 'Navy', hex: '#1E3A5F', class: 'bg-blue-900' },
  { name: 'Ocean Blue', hex: '#0077B6', class: 'bg-blue-600' },
  { name: 'Coral', hex: '#FF6B6B', class: 'bg-red-400' },
  { name: 'Seafoam', hex: '#9EE6CF', class: 'bg-teal-300' },
  { name: 'Sand', hex: '#F5E6D3', class: 'bg-amber-100' },
  { name: 'Heather Gray', hex: '#9CA3AF', class: 'bg-gray-400' },
];

interface VariantData {
  size: string;
  color: string;
  stock: number;
  price: number;
  sku: string;
}

export default function NewTShirtPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Product details
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [category, setCategory] = useState('t-shirts');
  const [conservationPercentage, setConservationPercentage] = useState('10');
  const [conservationFocus, setConservationFocus] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Variants
  const [variants, setVariants] = useState<VariantData[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [selectedColors, setSelectedColors] = useState<string[]>(['White', 'Navy']);

  // Generate variants from selections
  useState(() => {
    const newVariants: VariantData[] = [];
    selectedSizes.forEach(size => {
      selectedColors.forEach(color => {
        const sku = `TSHIRT-${color?.substring(0, 2).toUpperCase() || 'WH'}-${size}-${Date.now().toString(36).toUpperCase()}`;
        newVariants.push({
          size,
          color,
          stock: 0,
          price: parseFloat(basePrice) || 0,
          sku
        });
      });
    });
    setVariants(newVariants);
  });

  const updateVariant = (index: number, field: keyof VariantData, value: string | number) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const addVariant = () => {
    setVariants([...variants, {
      size: 'M',
      color: 'White',
      stock: 0,
      price: parseFloat(basePrice) || 0,
      sku: `TSHIRT-WH-M-${Date.now().toString(36).toUpperCase()}`
    }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (variants.length === 0) {
      toast.error('At least one variant is required');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/tshirts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          basePrice: parseFloat(basePrice),
          category,
          conservationPercentage: parseFloat(conservationPercentage),
          conservationFocus: conservationFocus || undefined,
          imageUrl: imageUrl || undefined,
          variants: variants.map(v => ({
            ...v,
            price: parseFloat(basePrice) || v.price,
            material: '100% Organic Cotton'
          }))
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create t-shirt');
      }

      toast.success('T-Shirt created successfully!');
      router.push('/admin/inventory/tshirts');
    } catch (error) {
      console.error('Create t-shirt error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create t-shirt');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadProductImage(formData);

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      if (result.url) {
        setImageUrl(result.url);
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
  const totalValue = variants.reduce((sum, v) => sum + (v.price * v.stock), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-pink-500/15 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/20 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin/inventory/tshirts')}
              className="text-purple-300 hover:text-purple-100 hover:bg-purple-500/20"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Inventory
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
                Add New T-Shirt
              </h1>
              <p className="text-slate-400 text-sm">Create a new t-shirt product with variants</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              form="tshirt-form"
              disabled={saving}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white border-0 shadow-lg shadow-purple-500/25"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Creating...' : 'Create T-Shirt'}
            </Button>
          </div>
        </div>

        <form id="tshirt-form" onSubmit={handleSubmit} className="p-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                {[
                  { id: 'details', label: 'Product Details', icon: Tag },
                  { id: 'variants', label: 'Variants', icon: Layers },
                  { id: 'images', label: 'Images', icon: ImageIcon },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Details Tab */}
              {activeTab === 'details' && (
                <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Tag className="w-5 h-5 text-purple-400" />
                      Product Information
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Enter the basic details for your t-shirt product
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="name" className="text-purple-300">Product Name *</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Ocean Wave T-Shirt"
                        className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-purple-300">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your t-shirt product..."
                        rows={4}
                        className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="basePrice" className="text-purple-300">Base Price ($) *</Label>
                        <Input
                          id="basePrice"
                          type="number"
                          step="0.01"
                          value={basePrice}
                          onChange={(e) => setBasePrice(e.target.value)}
                          placeholder="29.99"
                          className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category" className="text-purple-300">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger className="bg-slate-800/50 border-purple-500/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-purple-500/30">
                            <SelectItem value="t-shirts">T-Shirts</SelectItem>
                            <SelectItem value="tshirts">T-Shirts</SelectItem>
                            <SelectItem value="apparel">Apparel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="conservationPercentage" className="text-purple-300">
                          Conservation Donation (%)
                        </Label>
                        <Input
                          id="conservationPercentage"
                          type="number"
                          step="1"
                          min="0"
                          max="100"
                          value={conservationPercentage}
                          onChange={(e) => setConservationPercentage(e.target.value)}
                          placeholder="10"
                          className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="conservationFocus" className="text-purple-300">
                          Conservation Focus
                        </Label>
                        <Input
                          id="conservationFocus"
                          value={conservationFocus}
                          onChange={(e) => setConservationFocus(e.target.value)}
                          placeholder="e.g., Sea Turtle Protection"
                          className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Variants Tab */}
              {activeTab === 'variants' && (
                <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-cyan-400" />
                      Product Variants
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Configure sizes, colors, and pricing for each variant
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Quick Selection */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label className="text-purple-300 mb-3 block">Quick Select Sizes</Label>
                        <div className="flex flex-wrap gap-2">
                          {SIZES.map(size => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => {
                                if (selectedSizes.includes(size)) {
                                  setSelectedSizes(selectedSizes.filter(s => s !== size));
                                } else {
                                  setSelectedSizes([...selectedSizes, size]);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                selectedSizes.includes(size)
                                  ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                                  : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-purple-500/30'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-cyan-300 mb-3 block">Quick Select Colors</Label>
                        <div className="flex flex-wrap gap-2">
                          {COLORS.map(color => (
                            <button
                              key={color.name}
                              type="button"
                              onClick={() => {
                                if (selectedColors.includes(color.name)) {
                                  setSelectedColors(selectedColors.filter(c => c !== color.name));
                                } else {
                                  setSelectedColors([...selectedColors, color.name]);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                selectedColors.includes(color.name)
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                                  : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-cyan-500/30'
                              }`}
                            >
                              <span className={`w-3 h-3 rounded-full ${color.class} border border-slate-600`} />
                              {color.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Generate Button */}
                    <Button
                      type="button"
                      onClick={() => {
                        const newVariants: VariantData[] = [];
                        selectedSizes.forEach(size => {
                          selectedColors.forEach(color => {
                            const sku = `TSHIRT-${color.substring(0, 2).toUpperCase()}-${size}-${Date.now().toString(36).toUpperCase()}`;
                            newVariants.push({
                              size,
                              color,
                              stock: 0,
                              price: parseFloat(basePrice) || 29.99,
                              sku
                            });
                          });
                        });
                        setVariants(newVariants);
                        toast.success(`Generated ${newVariants.length} variants`);
                      }}
                      className="w-full bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 hover:border-purple-400 text-purple-300"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate {selectedSizes.length * selectedColors.length} Variants
                    </Button>

                    {/* Variants List */}
                    <div className="space-y-3">
                      {variants.map((variant, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg bg-slate-800/30 border border-purple-500/20 hover:border-purple-500/40 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className={`w-8 h-8 rounded-full border-2 border-slate-600`} style={{ backgroundColor: COLORS.find(c => c.name === variant.color)?.hex }} />
                              <span className="text-white font-medium w-24">{variant.size} / {variant.color}</span>
                            </div>
                            <Input
                              type="number"
                              placeholder="Stock"
                              value={variant.stock}
                              onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                              className="w-24 bg-slate-900/50 border-purple-500/30 text-white"
                            />
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Price"
                              value={variant.price}
                              onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                              className="w-24 bg-slate-900/50 border-purple-500/30 text-white"
                            />
                            <Input
                              value={variant.sku}
                              onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                              placeholder="SKU"
                              className="flex-1 bg-slate-900/50 border-purple-500/30 text-white text-xs"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => removeVariant(index)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {variants.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No variants yet. Select sizes/colors and click &quot;Generate&quot;</p>
                        </div>
                      )}
                    </div>

                    <Button
                      type="button"
                      onClick={addVariant}
                      variant="outline"
                      className="w-full border-dashed border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Manual Variant
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Images Tab */}
              {activeTab === 'images' && (
                <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-pink-400" />
                      Product Images
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Upload images for your t-shirt product
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-8 text-center hover:border-purple-400 transition-all cursor-pointer relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={uploading}
                      />
                      {uploading ? (
                        <RefreshCw className="w-12 h-12 mx-auto text-purple-400 animate-spin" />
                      ) : imageUrl ? (
                        <div className="space-y-4">
                          <NextImage src={imageUrl} alt="Uploaded t-shirt product image" width={256} height={256} className="max-h-64 mx-auto rounded-lg" />
                          <p className="text-green-400">Image uploaded successfully</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                          <p className="text-slate-400 mb-2">Click or drag to upload product image</p>
                          <p className="text-slate-500 text-sm">PNG, JPG up to 10MB</p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Summary */}
            <div className="space-y-6">
              <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-xl sticky top-24">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-cyan-400" />
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400">Variants</span>
                      <span className="text-2xl font-bold text-white">{variants.length}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400">Total Stock</span>
                      <span className="text-xl font-bold text-cyan-400">{totalStock}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Inventory Value</span>
                      <span className="text-xl font-bold text-green-400">${totalValue.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Sizes</span>
                      <span className="text-white">{selectedSizes.length} selected</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Colors</span>
                      <span className="text-white">{selectedColors.length} selected</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Conservation</span>
                      <span className="text-purple-400">{conservationPercentage}%</span>
                    </div>
                  </div>

                  {variants.length > 0 && (
                    <div className="pt-4 border-t border-purple-500/20">
                      <Label className="text-purple-300 mb-2 block">Preview Variants</Label>
                      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                        {variants.slice(0, 12).map((v, i) => (
                          <Badge key={i} variant="outline" className="border-purple-500/30 text-purple-300">
                            {v.size}/{v.color.substring(0, 3)}
                          </Badge>
                        ))}
                        {variants.length > 12 && (
                          <Badge className="bg-slate-800 text-slate-400">
                            +{variants.length - 12} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    Quick Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-400">
                  <p>• Use high-quality images (at least 1000x1000px)</p>
                  <p>• Include both light and dark color options</p>
                  <p>• Set conservative stock levels initially</p>
                  <p>• 10% conservation donation is recommended</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
