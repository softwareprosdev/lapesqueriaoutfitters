'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Search, ChevronRight, ChevronDown, 
  Folder, FolderOpen, Tag, GripVertical, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from '@/components/admin/ImageUpload';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  icon?: string;
  productCount?: number;
  children?: Category[];
}

const CATEGORY_ICONS = [
  { id: 'apparel', label: 'Fishing Apparel', icon: '👕' },
  { id: 'gear', label: 'Fishing Gear', icon: '🎣' },
  { id: 'rods', label: 'Rods & Reels', icon: '🎯' },
  { id: 'lures', label: 'Lures & Baits', icon: '🐟' },
  { id: 'tackle', label: 'Tackle & Terminal', icon: '🔧' },
  { id: 'accessories', label: 'Accessories', icon: '🛠️' },
  { id: 'sale', label: 'Sale / New', icon: '🏷️' },
  { id: 'default', label: 'General', icon: '📦' },
];

const MAIN_CATEGORIES = [
  'Fishing Apparel',
  'Fishing Gear & Supplies', 
  'Rods & Reels',
  'Lures & Baits',
  'Tackle & Terminal',
  'Accessories',
  'Sale / New Arrivals',
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'hidden'>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    parentId: '',
    isActive: true,
    sortOrder: 0,
    icon: 'default',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      
      // Build hierarchy from flat list
      const categoriesWithHierarchy = buildHierarchy(data);
      setCategories(categoriesWithHierarchy);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const buildHierarchy = (flatCategories: Category[]): Category[] => {
    const categoryMap = new Map<string, Category>();
    const roots: Category[] = [];

    // First pass: create all category objects
    flatCategories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build tree
    flatCategories.forEach(cat => {
      const category = categoryMap.get(cat.id)!;
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        categoryMap.get(cat.parentId)!.children!.push(category);
      } else {
        roots.push(category);
      }
    });

    // Sort by sortOrder
    const sortRecursive = (cats: Category[]) => {
      cats.sort((a, b) => a.sortOrder - b.sortOrder);
      cats.forEach(cat => {
        if (cat.children && cat.children.length > 0) {
          sortRecursive(cat.children);
        }
      });
    };
    sortRecursive(roots);

    return roots;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'name') {
      const baseSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug: baseSlug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        parentId: formData.parentId || null,
      };

      const url = editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories';
      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchCategories();
        resetForm();
        toast.success(editingId ? 'Category updated!' : 'Category created!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save category');
      }
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image: category.image || '',
      parentId: category.parentId || '',
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      icon: 'default',
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const response = await fetch(`/api/admin/categories/${deletingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCategories();
        toast.success('Category deleted');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    } finally {
      setShowDeleteDialog(false);
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      parentId: '',
      isActive: true,
      sortOrder: 0,
      icon: 'default',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const filterCategories = (cats: Category[]): Category[] => {
    return cats.filter(cat => {
      const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' && cat.isActive) ||
        (filterStatus === 'hidden' && !cat.isActive);
      
      const filtered = (matchesSearch && matchesStatus) 
        ? { ...cat, children: cat.children ? filterCategories(cat.children) : [] }
        : { ...cat, children: cat.children ? filterCategories(cat.children) : [] };
      
      // Keep if this cat matches OR has matching children
      return matchesSearch || matchesStatus || (filtered.children && filtered.children.length > 0);
    });
  };

  const CategoryIcon = ({ iconId, className = "w-5 h-5" }: { iconId: string; className?: string }) => {
    const icon = CATEGORY_ICONS.find(i => i.id === iconId);
    return <span className={className}>{icon?.icon || '📦'}</span>;
  };

  const CategoryRow = ({ category, level = 0 }: { category: Category; level?: number }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedIds.has(category.id);
    const productCount = category.productCount || 0;

    return (
      <>
        <tr className="hover:bg-gray-50 dark:hover:bg-slate-800/50 border-b">
          <td className="px-4 py-3">
            <div 
              className="flex items-center gap-2"
              style={{ paddingLeft: `${level * 24 + 8}px` }}
            >
              {hasChildren ? (
                <button
                  onClick={() => toggleExpanded(category.id)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              ) : (
                <span className="w-6" />
              )}
              <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
              <CategoryIcon iconId={category.icon || 'default'} />
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="font-medium">{category.name}</div>
            <div className="text-sm text-gray-500 font-mono">{category.slug}</div>
          </td>
          <td className="px-4 py-3">
            {category.parentId ? (
              <Badge variant="outline" className="text-xs">
                Sub-category
              </Badge>
            ) : (
              <Badge className="bg-[#001F3F] text-white text-xs">
                Main
              </Badge>
            )}
          </td>
          <td className="px-4 py-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {productCount} products
            </span>
          </td>
          <td className="px-4 py-3">
            {category.isActive ? (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Active
              </Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                Hidden
              </Badge>
            )}
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(category)}
                className="h-8 w-8"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setDeletingId(category.id);
                  setShowDeleteDialog(true);
                }}
                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </td>
        </tr>
        {hasChildren && isExpanded && (
          category.children!.map(child => (
            <CategoryRow key={child.id} category={child} level={level + 1} />
          ))
        )}
      </>
    );
  };

  const filteredCategories = filterCategories(categories);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#001F3F]">Category Management</h1>
          <p className="text-gray-600 mt-1">
            Organize your products with hierarchical categories
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-[#001F3F] hover:bg-[#002D5C]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={(v: 'all' | 'active' | 'hidden') => setFilterStatus(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="hidden">Hidden Only</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchCategories}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category Tree Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5" />
            All Categories ({filteredCategories.reduce((acc, c) => acc + 1 + (c.children?.length || 0), 0)})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-[#001F3F] border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-500">Loading categories...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No categories found</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create your first category
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50 dark:bg-slate-800/50">
                    <th className="text-left px-4 py-3 font-medium text-sm text-gray-600 dark:text-gray-400">Icon</th>
                    <th className="text-left px-4 py-3 font-medium text-sm text-gray-600 dark:text-gray-400">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-sm text-gray-600 dark:text-gray-400">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-sm text-gray-600 dark:text-gray-400">Products</th>
                    <th className="text-left px-4 py-3 font-medium text-sm text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-sm text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map(category => (
                    <CategoryRow key={category.id} category={category} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions - Main Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Quick Add Main Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {MAIN_CATEGORIES.map(catName => (
              <Button
                key={catName}
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormData({
                    name: catName,
                    slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    description: '',
                    image: '',
                    parentId: '',
                    isActive: true,
                    sortOrder: 0,
                    icon: 'default',
                  });
                  setShowForm(true);
                }}
              >
                <Plus className="w-3 h-3 mr-1" />
                {catName}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Category Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Fishing Apparel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  placeholder="fishing-apparel"
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
                className="w-full min-h-[80px] px-3 py-2 border rounded-md"
                placeholder="Describe this category..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Parent Category</Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, parentId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None (Main Category)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (Main Category)</SelectItem>
                    {categories.filter(c => !c.parentId && c.id !== editingId).map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  min={0}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_ICONS.map(icon => (
                  <button
                    key={icon.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon: icon.id }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.icon === icon.id 
                        ? 'border-[#001F3F] bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    title={icon.label}
                  >
                    <span className="text-2xl">{icon.icon}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <ImageUpload
                label="Category Image"
                helperText="Upload an image for this category (optional)"
                currentImage={formData.image || undefined}
                onUploadComplete={(url) => setFormData(prev => ({ ...prev, image: url }))}
                onRemove={() => setFormData(prev => ({ ...prev, image: '' }))}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 rounded"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Category is active and visible
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#001F3F] hover:bg-[#002D5C]">
                {editingId ? 'Save Changes' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete this category? Any products in this category will need to be reassigned.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
