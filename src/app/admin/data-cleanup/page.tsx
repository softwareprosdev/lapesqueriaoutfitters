'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Package,
  Users,
  FileText,
  FolderOpen,
  RefreshCw,
  Shield,
  Search,
  Filter,
  Eye,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import toast from 'react-hot-toast';

type DataType = 'orders' | 'products' | 'customers' | 'blog' | 'categories';

interface DataFlags {
  isLikelyReal: boolean;
  [key: string]: boolean;
}

interface DataItem {
  id: string;
  flags?: DataFlags;
  [key: string]: unknown;
}

interface Summary {
  orders: number;
  products: number;
  customers: number;
  categories: number;
  blogPosts: number;
}

export default function DataCleanupPage() {
  const [activeTab, setActiveTab] = useState<DataType>('orders');
  const [data, setData] = useState<DataItem[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'likely-dummy' | 'likely-real'>('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const tabs = [
    { id: 'orders' as DataType, label: 'Orders', icon: ShoppingBag, color: 'text-blue-500' },
    { id: 'products' as DataType, label: 'Products', icon: Package, color: 'text-green-500' },
    { id: 'customers' as DataType, label: 'Customers', icon: Users, color: 'text-purple-500' },
    { id: 'blog' as DataType, label: 'Blog Posts', icon: FileText, color: 'text-orange-500' },
    { id: 'categories' as DataType, label: 'Categories', icon: FolderOpen, color: 'text-cyan-500' },
  ];

  // Fetch summary on mount
  useEffect(() => {
    fetchSummary();
  }, []);

  // Fetch data when tab changes
  useEffect(() => {
    fetchData();
    setSelectedIds(new Set());
    setSearchQuery('');
    setFilterMode('all');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/admin/data-cleanup');
      const result = await res.json();
      if (result.summary) {
        setSummary(result.summary);
      }
    } catch {
      console.error('Failed to fetch summary');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/data-cleanup?type=${activeTab}`);
      const result = await res.json();

      const dataKey = activeTab === 'blog' ? 'posts' : activeTab;
      setData(result[dataKey] || []);
    } catch {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredData.map((item) => item.id)));
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/data-cleanup', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          ids: Array.from(selectedIds),
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(result.message);
        setSelectedIds(new Set());
        setShowDeleteDialog(false);
        setDeleteConfirmText('');
        fetchData();
        fetchSummary();
      } else {
        toast.error(result.error || 'Failed to delete');
      }
    } catch {
      toast.error('Failed to delete data');
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on search and filter mode
  const filteredData = data.filter((item) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    let matchesSearch = true;

    if (searchQuery) {
      if (activeTab === 'orders') {
        const order = item as { orderNumber?: string; customerEmail?: string; customerName?: string };
        matchesSearch =
          order.orderNumber?.toLowerCase().includes(searchLower) ||
          order.customerEmail?.toLowerCase().includes(searchLower) ||
          order.customerName?.toLowerCase().includes(searchLower) ||
          false;
      } else if (activeTab === 'products') {
        const product = item as { name?: string; sku?: string };
        matchesSearch =
          product.name?.toLowerCase().includes(searchLower) ||
          product.sku?.toLowerCase().includes(searchLower) ||
          false;
      } else if (activeTab === 'customers') {
        const customer = item as { email?: string; name?: string };
        matchesSearch =
          customer.email?.toLowerCase().includes(searchLower) ||
          customer.name?.toLowerCase().includes(searchLower) ||
          false;
      } else if (activeTab === 'blog') {
        const post = item as { title?: string };
        matchesSearch = post.title?.toLowerCase().includes(searchLower) || false;
      } else if (activeTab === 'categories') {
        const category = item as { name?: string };
        matchesSearch = category.name?.toLowerCase().includes(searchLower) || false;
      }
    }

    // Filter mode
    let matchesFilter = true;
    if (filterMode !== 'all' && item.flags) {
      if (filterMode === 'likely-dummy') {
        matchesFilter = !item.flags.isLikelyReal;
      } else if (filterMode === 'likely-real') {
        matchesFilter = item.flags.isLikelyReal;
      }
    }

    return matchesSearch && matchesFilter;
  });

  const renderOrderRow = (order: DataItem) => {
    const o = order as {
      id: string;
      orderNumber: string;
      customerEmail: string;
      customerName: string;
      total: number;
      status: string;
      createdAt: string;
      stripePaymentId?: string;
      items?: { id: string }[];
      flags?: DataFlags & {
        hasRealPayment: boolean;
        hasValidEmail: boolean;
        hasValidAddress: boolean;
      };
    };

    return (
      <tr key={o.id} className={`border-b border-slate-700 hover:bg-slate-800/50 ${selectedIds.has(o.id) ? 'bg-slate-800' : ''}`}>
        <td className="p-3">
          <Checkbox
            checked={selectedIds.has(o.id)}
            onCheckedChange={() => handleSelectItem(o.id)}
          />
        </td>
        <td className="p-3">
          <div className="font-mono text-sm">{o.orderNumber?.slice(-8) || o.id.slice(-8)}</div>
          <div className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</div>
        </td>
        <td className="p-3">
          <div>{o.customerName}</div>
          <div className="text-sm text-slate-400">{o.customerEmail}</div>
        </td>
        <td className="p-3">${o.total?.toFixed(2)}</td>
        <td className="p-3">
          <Badge variant={o.status === 'DELIVERED' ? 'default' : 'secondary'}>
            {o.status}
          </Badge>
        </td>
        <td className="p-3">
          <div className="flex gap-1 flex-wrap">
            {o.flags?.hasRealPayment ? (
              <Badge variant="outline" className="text-green-400 border-green-400">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Payment
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-400 border-red-400">
                <XCircle className="w-3 h-3 mr-1" /> No Payment
              </Badge>
            )}
            {o.flags?.isLikelyReal ? (
              <Badge className="bg-green-600">Likely Real</Badge>
            ) : (
              <Badge className="bg-orange-600">Likely Test</Badge>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const renderProductRow = (product: DataItem) => {
    const p = product as {
      id: string;
      name: string;
      sku: string;
      basePrice: number;
      images?: { url: string }[];
      variants?: { id: string }[];
      category?: { name: string };
      flags?: DataFlags & {
        hasImages: boolean;
        hasVariants: boolean;
        hasDescription: boolean;
      };
    };

    return (
      <tr key={p.id} className={`border-b border-slate-700 hover:bg-slate-800/50 ${selectedIds.has(p.id) ? 'bg-slate-800' : ''}`}>
        <td className="p-3">
          <Checkbox
            checked={selectedIds.has(p.id)}
            onCheckedChange={() => handleSelectItem(p.id)}
          />
        </td>
        <td className="p-3">
          <div className="flex items-center gap-3">
            {p.images?.[0] ? (
              <Image src={p.images[0].url} alt={p.name} width={40} height={40} className="rounded object-cover" />
            ) : (
              <div className="w-10 h-10 rounded bg-slate-700 flex items-center justify-center">
                <Package className="w-5 h-5 text-slate-500" />
              </div>
            )}
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-slate-400">SKU: {p.sku}</div>
            </div>
          </div>
        </td>
        <td className="p-3">${p.basePrice?.toFixed(2)}</td>
        <td className="p-3">{p.variants?.length || 0}</td>
        <td className="p-3">{p.category?.name || '-'}</td>
        <td className="p-3">
          <div className="flex gap-1 flex-wrap">
            {p.flags?.hasImages && (
              <Badge variant="outline" className="text-green-400 border-green-400">Images</Badge>
            )}
            {p.flags?.hasVariants && (
              <Badge variant="outline" className="text-blue-400 border-blue-400">Variants</Badge>
            )}
            {p.flags?.isLikelyReal ? (
              <Badge className="bg-green-600">Complete</Badge>
            ) : (
              <Badge className="bg-orange-600">Incomplete</Badge>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const renderCustomerRow = (customer: DataItem) => {
    const c = customer as {
      id: string;
      email: string;
      name?: string;
      createdAt: string;
      orders?: { id: string; total: number }[];
      flags?: DataFlags & {
        hasOrders: boolean;
        hasValidEmail: boolean;
      };
    };

    const totalSpent = c.orders?.reduce((sum, o) => sum + o.total, 0) || 0;

    return (
      <tr key={c.id} className={`border-b border-slate-700 hover:bg-slate-800/50 ${selectedIds.has(c.id) ? 'bg-slate-800' : ''}`}>
        <td className="p-3">
          <Checkbox
            checked={selectedIds.has(c.id)}
            onCheckedChange={() => handleSelectItem(c.id)}
          />
        </td>
        <td className="p-3">
          <div className="font-medium">{c.name || 'No Name'}</div>
          <div className="text-sm text-slate-400">{c.email}</div>
        </td>
        <td className="p-3">{c.orders?.length || 0}</td>
        <td className="p-3">${totalSpent.toFixed(2)}</td>
        <td className="p-3">{new Date(c.createdAt).toLocaleDateString()}</td>
        <td className="p-3">
          <div className="flex gap-1">
            {c.flags?.hasOrders && (
              <Badge variant="outline" className="text-green-400 border-green-400">Has Orders</Badge>
            )}
            {c.flags?.isLikelyReal ? (
              <Badge className="bg-green-600">Real</Badge>
            ) : (
              <Badge className="bg-orange-600">Test</Badge>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const renderBlogRow = (post: DataItem) => {
    const p = post as {
      id: string;
      title: string;
      published: boolean;
      createdAt: string;
      author?: { name: string };
    };

    return (
      <tr key={p.id} className={`border-b border-slate-700 hover:bg-slate-800/50 ${selectedIds.has(p.id) ? 'bg-slate-800' : ''}`}>
        <td className="p-3">
          <Checkbox
            checked={selectedIds.has(p.id)}
            onCheckedChange={() => handleSelectItem(p.id)}
          />
        </td>
        <td className="p-3">
          <div className="font-medium">{p.title}</div>
          <div className="text-sm text-slate-400">By: {p.author?.name || 'Unknown'}</div>
        </td>
        <td className="p-3">
          {p.published ? (
            <Badge className="bg-green-600">Published</Badge>
          ) : (
            <Badge variant="secondary">Draft</Badge>
          )}
        </td>
        <td className="p-3">{new Date(p.createdAt).toLocaleDateString()}</td>
      </tr>
    );
  };

  const renderCategoryRow = (category: DataItem) => {
    const c = category as {
      id: string;
      name: string;
      slug: string;
      _count?: { products: number };
    };

    return (
      <tr key={c.id} className={`border-b border-slate-700 hover:bg-slate-800/50 ${selectedIds.has(c.id) ? 'bg-slate-800' : ''}`}>
        <td className="p-3">
          <Checkbox
            checked={selectedIds.has(c.id)}
            onCheckedChange={() => handleSelectItem(c.id)}
            disabled={(c._count?.products || 0) > 0}
          />
        </td>
        <td className="p-3">
          <div className="font-medium">{c.name}</div>
          <div className="text-sm text-slate-400">/{c.slug}</div>
        </td>
        <td className="p-3">{c._count?.products || 0}</td>
        <td className="p-3">
          {(c._count?.products || 0) > 0 ? (
            <Badge variant="secondary">Has Products</Badge>
          ) : (
            <Badge variant="outline" className="text-orange-400 border-orange-400">Empty</Badge>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-teal-500" />
            Data Cleanup Manager
          </h1>
          <p className="text-slate-400 mt-2">
            Review and manage data. Items flagged as &quot;Likely Test&quot; may be dummy data.
            <span className="text-orange-400 ml-2">⚠️ Deletions are permanent!</span>
          </p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {tabs.map((tab) => {
              const count = summary[tab.id === 'blog' ? 'blogPosts' : tab.id as keyof Summary];
              return (
                <Card
                  key={tab.id}
                  className={`bg-slate-900 border-slate-800 cursor-pointer hover:border-slate-600 transition-colors ${activeTab === tab.id ? 'border-teal-500' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <tab.icon className={`w-5 h-5 ${tab.color}`} />
                      <span className="text-2xl font-bold">{count}</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">{tab.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Main Content */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {tabs.find((t) => t.id === activeTab)?.icon &&
                    (() => {
                      const Icon = tabs.find((t) => t.id === activeTab)!.icon;
                      return <Icon className="w-5 h-5" />;
                    })()}
                  {tabs.find((t) => t.id === activeTab)?.label}
                </CardTitle>
                <CardDescription>
                  {filteredData.length} items • {selectedIds.size} selected
                </CardDescription>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-slate-800 border-slate-700 w-48"
                  />
                </div>

                <Select value={filterMode} onValueChange={(v) => setFilterMode(v as typeof filterMode)}>
                  <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="likely-dummy">Likely Dummy</SelectItem>
                    <SelectItem value="likely-real">Likely Real</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchData}
                  disabled={loading}
                  className="border-slate-700"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-4 p-3 bg-slate-800 rounded-lg">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectedIds.size === filteredData.length && filteredData.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-slate-400">
                  {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
                </span>
              </div>

              <AnimatePresence>
                {selectedIds.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteDialog(true)}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Selected ({selectedIds.size})
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Data Table */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No items found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700 text-left text-sm text-slate-400">
                      <th className="p-3 w-12"></th>
                      {activeTab === 'orders' && (
                        <>
                          <th className="p-3">Order</th>
                          <th className="p-3">Customer</th>
                          <th className="p-3">Total</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Flags</th>
                        </>
                      )}
                      {activeTab === 'products' && (
                        <>
                          <th className="p-3">Product</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Variants</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Status</th>
                        </>
                      )}
                      {activeTab === 'customers' && (
                        <>
                          <th className="p-3">Customer</th>
                          <th className="p-3">Orders</th>
                          <th className="p-3">Total Spent</th>
                          <th className="p-3">Joined</th>
                          <th className="p-3">Status</th>
                        </>
                      )}
                      {activeTab === 'blog' && (
                        <>
                          <th className="p-3">Title</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Created</th>
                        </>
                      )}
                      {activeTab === 'categories' && (
                        <>
                          <th className="p-3">Category</th>
                          <th className="p-3">Products</th>
                          <th className="p-3">Status</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {activeTab === 'orders' && filteredData.map(renderOrderRow)}
                    {activeTab === 'products' && filteredData.map(renderProductRow)}
                    {activeTab === 'customers' && filteredData.map(renderCustomerRow)}
                    {activeTab === 'blog' && filteredData.map(renderBlogRow)}
                    {activeTab === 'categories' && filteredData.map(renderCategoryRow)}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-slate-900 border-slate-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-5 h-5" />
                Confirm Deletion
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                You are about to permanently delete <strong className="text-white">{selectedIds.size}</strong> {activeTab}.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="my-4">
              <label className="text-sm text-slate-400 block mb-2">
                Type <strong className="text-red-500">DELETE</strong> to confirm:
              </label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="bg-slate-800 border-slate-700"
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setDeleteConfirmText('');
                  setShowDeleteDialog(false);
                }}
                className="bg-slate-800 border-slate-700"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleteConfirmText !== 'DELETE' || loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Delete Permanently'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
