'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Shirt,
  Plus,
  Edit,
  Trash2,
  Package,
  Palette,
  Ruler,
  Save,
  RefreshCw,
  Check,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Types
interface TShirtCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  _count?: { products: number };
}

interface TShirtColor {
  id: string;
  name: string;
  hexCode: string | null;
  isActive: boolean;
  displayOrder: number;
}

interface TShirtSize {
  id: string;
  name: string;
  label: string;
  chestWidth: string | null;
  length: string | null;
  isActive: boolean;
  displayOrder: number;
}

interface TShirtInventoryItem {
  id: string;
  productId: string;
  colorId: string;
  sizeId: string;
  stock: number;
  price: number;
  sku: string | null;
  reorderPoint: number;
  safetyStock: number;
  product?: { id: string; name: string; basePrice: number };
  color?: TShirtColor;
  size?: TShirtSize;
}

export default function TShirtInventoryManagementPage() {
  const [activeTab, setActiveTab] = useState('categories');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [categories, setCategories] = useState<TShirtCategory[]>([]);
  const [colors, setColors] = useState<TShirtColor[]>([]);
  const [sizes, setSizes] = useState<TShirtSize[]>([]);
  const [inventory, setInventory] = useState<TShirtInventoryItem[]>([]);

  // Dialog states
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TShirtCategory | null>(null);
  const [showColorDialog, setShowColorDialog] = useState(false);
  const [editingColor, setEditingColor] = useState<TShirtColor | null>(null);
  const [showSizeDialog, setShowSizeDialog] = useState(false);
  const [editingSize, setEditingSize] = useState<TShirtSize | null>(null);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [editingInventory, setEditingInventory] = useState<TShirtInventoryItem | null>(null);
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<TShirtInventoryItem | null>(null);

  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', slug: '', isActive: true, displayOrder: 0 });
  const [colorForm, setColorForm] = useState({ name: '', hexCode: '#000000', isActive: true, displayOrder: 0 });
  const [sizeForm, setSizeForm] = useState({ name: '', label: '', chestWidth: '', length: '', isActive: true, displayOrder: 0 });
  const [adjustmentForm, setAdjustmentForm] = useState({ type: 'add' as 'add' | 'set' | 'subtract', quantity: 0, reason: '' });

  // Fetch all data
  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setRefreshing(true);

      const [catRes, colorRes, sizeRes, invRes] = await Promise.all([
        fetch('/api/admin/tshirt-inventory?type=categories'),
        fetch('/api/admin/tshirt-inventory?type=colors'),
        fetch('/api/admin/tshirt-inventory?type=sizes'),
        fetch('/api/admin/tshirt-inventory?type=inventory'),
      ]);

      if (catRes.ok) {
        const data = await catRes.json();
        setCategories(data.categories || []);
      }
      if (colorRes.ok) {
        const data = await colorRes.json();
        setColors(data.colors || []);
      }
      if (sizeRes.ok) {
        const data = await sizeRes.json();
        setSizes(data.sizes || []);
      }
      if (invRes.ok) {
        const data = await invRes.json();
        setInventory(data.inventory || []);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      if (!silent) toast.error('Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // CRUD Operations
  async function saveCategory() {
    try {
      const res = await fetch('/api/admin/tshirt-inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'category',
          action: editingCategory ? 'update' : 'create',
          id: editingCategory?.id,
          data: categoryForm
        })
      });

      if (!res.ok) throw new Error('Failed to save category');
      
      toast.success(editingCategory ? 'Category updated' : 'Category created');
      setShowCategoryDialog(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '', slug: '', isActive: true, displayOrder: 0 });
      fetchData(true);
    } catch {
      toast.error('Failed to save category');
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/admin/tshirt-inventory?entity=category&id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Category deleted');
      fetchData(true);
    } catch {
      toast.error('Failed to delete category');
    }
  }

  async function saveColor() {
    try {
      const res = await fetch('/api/admin/tshirt-inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'color',
          action: editingColor ? 'update' : 'create',
          id: editingColor?.id,
          data: colorForm
        })
      });

      if (!res.ok) throw new Error('Failed to save color');
      
      toast.success(editingColor ? 'Color updated' : 'Color created');
      setShowColorDialog(false);
      setEditingColor(null);
      setColorForm({ name: '', hexCode: '#000000', isActive: true, displayOrder: 0 });
      fetchData(true);
    } catch {
      toast.error('Failed to save color');
    }
  }

  async function deleteColor(id: string) {
    if (!confirm('Are you sure you want to delete this color?')) return;
    try {
      const res = await fetch(`/api/admin/tshirt-inventory?entity=color&id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Color deleted');
      fetchData(true);
    } catch {
      toast.error('Failed to delete color');
    }
  }

  async function saveSize() {
    try {
      const res = await fetch('/api/admin/tshirt-inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'size',
          action: editingSize ? 'update' : 'create',
          id: editingSize?.id,
          data: sizeForm
        })
      });

      if (!res.ok) throw new Error('Failed to save size');
      
      toast.success(editingSize ? 'Size updated' : 'Size created');
      setShowSizeDialog(false);
      setEditingSize(null);
      setSizeForm({ name: '', label: '', chestWidth: '', length: '', isActive: true, displayOrder: 0 });
      fetchData(true);
    } catch {
      toast.error('Failed to save size');
    }
  }

  async function deleteSize(id: string) {
    if (!confirm('Are you sure you want to delete this size?')) return;
    try {
      const res = await fetch(`/api/admin/tshirt-inventory?entity=size&id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Size deleted');
      fetchData(true);
    } catch {
      toast.error('Failed to delete size');
    }
  }

  async function saveInventory() {
    try {
      const res = await fetch('/api/admin/tshirt-inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'inventory',
          action: editingInventory ? 'update' : 'create',
          id: editingInventory?.id,
          data: editingInventory ? {
            colorId: editingInventory.colorId,
            sizeId: editingInventory.sizeId,
            stock: editingInventory.stock,
            price: editingInventory.price,
            sku: editingInventory.sku,
            reorderPoint: editingInventory.reorderPoint,
            safetyStock: editingInventory.safetyStock
          } : {
            colorId: editingInventory?.colorId,
            sizeId: editingInventory?.sizeId,
            stock: editingInventory?.stock || 0,
            price: editingInventory?.price || 0
          }
        })
      });

      if (!res.ok) throw new Error('Failed to save inventory');
      
      toast.success('Inventory updated');
      setShowInventoryDialog(false);
      setEditingInventory(null);
      fetchData(true);
    } catch {
      toast.error('Failed to save inventory');
    }
  }

  async function adjustStock() {
    if (!adjustingItem || adjustmentForm.quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    try {
      const res = await fetch('/api/admin/tshirt-inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'inventory',
          action: 'adjust',
          inventoryId: adjustingItem.id,
          quantity: adjustmentForm.quantity,
          type: adjustmentForm.type,
          reason: adjustmentForm.reason
        })
      });

      if (!res.ok) throw new Error('Failed to adjust stock');
      
      toast.success('Stock adjusted');
      setShowAdjustDialog(false);
      setAdjustingItem(null);
      setAdjustmentForm({ type: 'add', quantity: 0, reason: '' });
      fetchData(true);
    } catch {
      toast.error('Failed to adjust stock');
    }
  }

  async function deleteInventory(id: string) {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;
    try {
      const res = await fetch(`/api/admin/tshirt-inventory?entity=inventory&id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Inventory deleted');
      fetchData(true);
    } catch {
      toast.error('Failed to delete inventory');
    }
  }

  // Open dialogs for editing
  function openCategoryDialog(category?: TShirtCategory) {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || '',
        slug: category.slug,
        isActive: category.isActive,
        displayOrder: category.displayOrder
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '', slug: '', isActive: true, displayOrder: 0 });
    }
    setShowCategoryDialog(true);
  }

  function openColorDialog(color?: TShirtColor) {
    if (color) {
      setEditingColor(color);
      setColorForm({
        name: color.name,
        hexCode: color.hexCode || '#000000',
        isActive: color.isActive,
        displayOrder: color.displayOrder
      });
    } else {
      setEditingColor(null);
      setColorForm({ name: '', hexCode: '#000000', isActive: true, displayOrder: 0 });
    }
    setShowColorDialog(true);
  }

  function openSizeDialog(size?: TShirtSize) {
    if (size) {
      setEditingSize(size);
      setSizeForm({
        name: size.name,
        label: size.label,
        chestWidth: size.chestWidth || '',
        length: size.length || '',
        isActive: size.isActive,
        displayOrder: size.displayOrder
      });
    } else {
      setEditingSize(null);
      setSizeForm({ name: '', label: '', chestWidth: '', length: '', isActive: true, displayOrder: 0 });
    }
    setShowSizeDialog(true);
  }

  function openInventoryDialog(item?: TShirtInventoryItem) {
    setEditingInventory(item || null);
    setShowInventoryDialog(true);
  }

  function openAdjustDialog(item: TShirtInventoryItem) {
    setAdjustingItem(item);
    setAdjustmentForm({ type: 'add', quantity: 0, reason: '' });
    setShowAdjustDialog(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Shirt className="w-8 h-8 text-purple-500" />
            T-Shirt Inventory Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage categories, colors, sizes, and stock levels
          </p>
        </div>
        <Button onClick={() => fetchData()} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Package className="w-4 h-4" /> Categories
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="w-4 h-4" /> Colors
          </TabsTrigger>
          <TabsTrigger value="sizes" className="flex items-center gap-2">
            <Ruler className="w-4 h-4" /> Sizes
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Shirt className="w-4 h-4" /> Stock
          </TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">T-Shirt Categories</h2>
            <Button onClick={() => openCategoryDialog()}>
              <Plus className="w-4 h-4 mr-2" /> Add Category
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                No categories yet. Add your first category!
              </div>
            ) : (
              categories.map((category) => (
                <Card key={category.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <CardDescription>{category.slug}</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openCategoryDialog(category)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteCategory(category.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {category.description || 'No description'}
                    </p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        {category._count?.products || 0} products
                      </span>
                      <span className={category.isActive ? 'text-green-600' : 'text-red-600'}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">T-Shirt Colors</h2>
            <Button onClick={() => openColorDialog()}>
              <Plus className="w-4 h-4 mr-2" /> Add Color
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {colors.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                No colors yet. Add your first color!
              </div>
            ) : (
              colors.map((color) => (
                <Card key={color.id} className="overflow-hidden">
                  <div
                    className="h-16"
                    style={{ backgroundColor: color.hexCode || '#ccc' }}
                  />
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{color.name}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openColorDialog(color)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteColor(color.id)}>
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{color.hexCode}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Sizes Tab */}
        <TabsContent value="sizes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">T-Shirt Sizes</h2>
            <Button onClick={() => openSizeDialog()}>
              <Plus className="w-4 h-4 mr-2" /> Add Size
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {sizes.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                No sizes yet. Add your first size!
              </div>
            ) : (
              sizes.map((size) => (
                <Card key={size.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{size.name}</CardTitle>
                        <CardDescription>{size.label}</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openSizeDialog(size)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteSize(size.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                      Chest: {size.chestWidth || '-'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Length: {size.length || '-'}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Stock Levels</h2>
            <Button onClick={() => openInventoryDialog()}>
              <Plus className="w-4 h-4 mr-2" /> Add Stock Item
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Color</th>
                  <th className="text-left py-3 px-4">Size</th>
                  <th className="text-right py-3 px-4">Stock</th>
                  <th className="text-right py-3 px-4">Price</th>
                  <th className="text-right py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      No inventory items yet. Add your first stock item!
                    </td>
                  </tr>
                ) : (
                  inventory.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50 dark:hover:bg-slate-800">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: item.color?.hexCode || '#ccc' }}
                          />
                          {item.color?.name || '-'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {item.size?.name || '-'} ({item.size?.label})
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {item.stock}
                      </td>
                      <td className="py-3 px-4 text-right">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {item.stock === 0 ? (
                          <span className="text-red-600 text-sm">Out of Stock</span>
                        ) : item.stock <= item.safetyStock ? (
                          <span className="text-yellow-600 text-sm flex items-center justify-end gap-1">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="text-green-600 text-sm flex items-center justify-end gap-1">
                            <Check className="w-3 h-3" /> In Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openAdjustDialog(item)}>
                            Adjust
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openInventoryDialog(item)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteInventory(item.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="e.g., Ocean Theme"
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                value={categoryForm.slug}
                onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                placeholder="ocean-theme"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Category description..."
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={categoryForm.displayOrder}
                  onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryForm.isActive}
                    onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveCategory} className="flex-1">
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
              <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Color Dialog */}
      <Dialog open={showColorDialog} onOpenChange={setShowColorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingColor ? 'Edit Color' : 'Add Color'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={colorForm.name}
                onChange={(e) => setColorForm({ ...colorForm, name: e.target.value })}
                placeholder="e.g., Navy Blue"
              />
            </div>
            <div>
              <Label>Hex Code</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={colorForm.hexCode}
                  onChange={(e) => setColorForm({ ...colorForm, hexCode: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={colorForm.hexCode}
                  onChange={(e) => setColorForm({ ...colorForm, hexCode: e.target.value })}
                  placeholder="#000000"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={colorForm.displayOrder}
                  onChange={(e) => setColorForm({ ...colorForm, displayOrder: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={colorForm.isActive}
                    onChange={(e) => setColorForm({ ...colorForm, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveColor} className="flex-1">
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
              <Button variant="outline" onClick={() => setShowColorDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Size Dialog */}
      <Dialog open={showSizeDialog} onOpenChange={setShowSizeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSize ? 'Edit Size' : 'Add Size'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Size Code</Label>
                <Input
                  value={sizeForm.name}
                  onChange={(e) => setSizeForm({ ...sizeForm, name: e.target.value.toUpperCase() })}
                  placeholder="e.g., M"
                />
              </div>
              <div>
                <Label>Label</Label>
                <Input
                  value={sizeForm.label}
                  onChange={(e) => setSizeForm({ ...sizeForm, label: e.target.value })}
                  placeholder="e.g., Medium"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Chest Width</Label>
                <Input
                  value={sizeForm.chestWidth}
                  onChange={(e) => setSizeForm({ ...sizeForm, chestWidth: e.target.value })}
                  placeholder="e.g., 38-40"
                />
              </div>
              <div>
                <Label>Length</Label>
                <Input
                  value={sizeForm.length}
                  onChange={(e) => setSizeForm({ ...sizeForm, length: e.target.value })}
                  placeholder="e.g., 28"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={sizeForm.displayOrder}
                  onChange={(e) => setSizeForm({ ...sizeForm, displayOrder: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sizeForm.isActive}
                    onChange={(e) => setSizeForm({ ...sizeForm, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveSize} className="flex-1">
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
              <Button variant="outline" onClick={() => setShowSizeDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Inventory Dialog */}
      <Dialog open={showInventoryDialog} onOpenChange={setShowInventoryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingInventory ? 'Edit Inventory' : 'Add Inventory Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editingInventory && (
              <>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label>Color</Label>
                    <Select
                      value={editingInventory.colorId}
                      onValueChange={(value) => setEditingInventory({ ...editingInventory, colorId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map((color) => (
                          <SelectItem key={color.id} value={color.id}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: color.hexCode || '#ccc' }} />
                              {color.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label>Size</Label>
                    <Select
                      value={editingInventory.sizeId}
                      onValueChange={(value) => setEditingInventory({ ...editingInventory, sizeId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sizes.map((size) => (
                          <SelectItem key={size.id} value={size.id}>
                            {size.name} - {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      value={editingInventory.stock}
                      onChange={(e) => setEditingInventory({ ...editingInventory, stock: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingInventory.price}
                      onChange={(e) => setEditingInventory({ ...editingInventory, price: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Reorder Point</Label>
                    <Input
                      type="number"
                      value={editingInventory.reorderPoint}
                      onChange={(e) => setEditingInventory({ ...editingInventory, reorderPoint: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Safety Stock</Label>
                    <Input
                      type="number"
                      value={editingInventory.safetyStock}
                      onChange={(e) => setEditingInventory({ ...editingInventory, safetyStock: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </>
            )}
            <div className="flex gap-2">
              <Button onClick={saveInventory} className="flex-1">
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
              <Button variant="outline" onClick={() => setShowInventoryDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Adjust Stock Dialog */}
      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
          </DialogHeader>
          {adjustingItem && (
            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-lg">
                <p className="font-medium">
                  {adjustingItem.color?.name} - {adjustingItem.size?.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current Stock: {adjustingItem.stock}
                </p>
              </div>
              <div>
                <Label>Adjustment Type</Label>
                <Select
                  value={adjustmentForm.type}
                  onValueChange={(value: 'add' | 'set' | 'subtract') => setAdjustmentForm({ ...adjustmentForm, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add Stock (+)</SelectItem>
                    <SelectItem value="subtract">Remove Stock (-)</SelectItem>
                    <SelectItem value="set">Set Exact Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  value={adjustmentForm.quantity}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, quantity: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Reason (Optional)</Label>
                <Textarea
                  value={adjustmentForm.reason}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                  placeholder="e.g., New shipment received"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={adjustStock} className="flex-1">
                  Apply Adjustment
                </Button>
                <Button variant="outline" onClick={() => setShowAdjustDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
