'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search as SearchIcon,
  Globe,
  FileText,
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Settings,
  Map,
  ExternalLink,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

type TabType = 'settings' | 'redirects' | 'sitemap';

interface SEOSettings {
  id: string;
  pageType: string;
  pageId: string | null;
  slug: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  noIndex: boolean;
  noFollow: boolean;
  updatedAt: string;
}

interface Redirect {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: number;
  isActive: boolean;
  hitCount: number;
  lastHitAt: string | null;
  createdAt: string;
}

interface SitemapEntry {
  id: string;
  url: string;
  changeFreq: string;
  priority: number;
  lastMod: string;
  isActive: boolean;
}

const PAGE_TYPES = [
  { value: 'home', label: 'Home Page' },
  { value: 'product', label: 'Product Pages' },
  { value: 'category', label: 'Category Pages' },
  { value: 'blog', label: 'Blog Posts' },
  { value: 'custom', label: 'Custom Pages' },
];

const CHANGE_FREQ_OPTIONS = [
  'always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'
];

export default function SEOPage() {
  const [activeTab, setActiveTab] = useState<TabType>('settings');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SEOSettings[]>([]);
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [sitemapEntries, setSitemapEntries] = useState<SitemapEntry[]>([]);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [showModal, setShowModal] = useState<'settings' | 'redirect' | 'sitemap' | null>(null);
  const [editingItem, setEditingItem] = useState<SEOSettings | Redirect | SitemapEntry | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/seo?type=${activeTab}`);
      if (!response.ok) throw new Error('Failed to load data');

      const data = await response.json();
      setStats(data.stats || {});

      if (activeTab === 'settings') {
        setSettings(data.settings || []);
      } else if (activeTab === 'redirects') {
        setRedirects(data.redirects || []);
      } else if (activeTab === 'sitemap') {
        setSitemapEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Load SEO data error:', error);
      toast.error('Failed to load SEO data');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const deleteItem = async (id: string, type: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/admin/seo/${id}?type=${type}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success('Item deleted');
      loadData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete item');
    }
  };

  const toggleActive = async (id: string, type: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/seo/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, isActive: !isActive }),
      });

      if (!response.ok) throw new Error('Failed to update');

      toast.success(isActive ? 'Disabled' : 'Enabled');
      loadData();
    } catch (error) {
      console.error('Toggle error:', error);
      toast.error('Failed to update');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO Management</h1>
          <p className="text-gray-500 mt-1">Optimize your site for search engines</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadData()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            className="bg-teal-500 hover:bg-teal-600"
            onClick={() => {
              setEditingItem(null);
              setShowModal(activeTab === 'settings' ? 'settings' : activeTab === 'redirects' ? 'redirect' : 'sitemap');
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Meta Settings
            </div>
          </button>
          <button
            onClick={() => setActiveTab('redirects')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'redirects'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              Redirects
            </div>
          </button>
          <button
            onClick={() => setActiveTab('sitemap')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sitemap'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              Sitemap
            </div>
          </button>
        </nav>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeTab === 'settings' && (
          <>
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{(stats as Record<string, number>).total || 0}</h3>
                <p className="text-sm text-gray-600">Total Pages Configured</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-500 rounded-xl">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {((stats as Record<string, Record<string, number>>).byType?.product || 0)}
                </h3>
                <p className="text-sm text-gray-600">Product Pages</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-violet-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-500 rounded-xl">
                    <SearchIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {((stats as Record<string, Record<string, number>>).byType?.blog || 0)}
                </h3>
                <p className="text-sm text-gray-600">Blog Posts</p>
              </CardContent>
            </Card>
          </>
        )}
        {activeTab === 'redirects' && (
          <>
            <Card className="bg-gradient-to-br from-orange-50 to-amber-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-orange-500 rounded-xl">
                    <ArrowRight className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{(stats as Record<string, number>).total || 0}</h3>
                <p className="text-sm text-gray-600">Total Redirects</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-500 rounded-xl">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{(stats as Record<string, number>).active || 0}</h3>
                <p className="text-sm text-gray-600">Active Redirects</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <ExternalLink className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{(stats as Record<string, number>).totalHits || 0}</h3>
                <p className="text-sm text-gray-600">Total Hits</p>
              </CardContent>
            </Card>
          </>
        )}
        {activeTab === 'sitemap' && (
          <>
            <Card className="bg-gradient-to-br from-teal-50 to-cyan-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-teal-500 rounded-xl">
                    <Map className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{(stats as Record<string, number>).total || 0}</h3>
                <p className="text-sm text-gray-600">Total Entries</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-500 rounded-xl">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{(stats as Record<string, number>).active || 0}</h3>
                <p className="text-sm text-gray-600">Active Entries</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === 'settings' && 'Page Meta Settings'}
              {activeTab === 'redirects' && 'URL Redirects'}
              {activeTab === 'sitemap' && 'Sitemap Entries'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Settings Tab */}
            {activeTab === 'settings' && (
              settings.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No SEO settings configured yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {settings.map((setting) => (
                    <div key={setting.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              {PAGE_TYPES.find(t => t.value === setting.pageType)?.label || setting.pageType}
                            </span>
                            {setting.noIndex && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">noindex</span>
                            )}
                            {setting.noFollow && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">nofollow</span>
                            )}
                          </div>
                          <h3 className="font-medium">{setting.metaTitle || 'No title set'}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {setting.metaDescription || 'No description set'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingItem(setting);
                              setShowModal('settings');
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            onClick={() => deleteItem(setting.id, 'settings')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Redirects Tab */}
            {activeTab === 'redirects' && (
              redirects.length === 0 ? (
                <div className="text-center py-12">
                  <ArrowRight className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No redirects configured yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">From</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">To</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Hits</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {redirects.map((redirect) => (
                        <tr key={redirect.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono text-sm">{redirect.fromPath}</td>
                          <td className="py-3 px-4 font-mono text-sm">{redirect.toPath}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              redirect.statusCode === 301 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {redirect.statusCode}
                            </span>
                          </td>
                          <td className="py-3 px-4">{redirect.hitCount}</td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => toggleActive(redirect.id, 'redirect', redirect.isActive)}
                              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                redirect.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {redirect.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              {redirect.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingItem(redirect);
                                  setShowModal('redirect');
                                }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                                onClick={() => deleteItem(redirect.id, 'redirect')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* Sitemap Tab */}
            {activeTab === 'sitemap' && (
              sitemapEntries.length === 0 ? (
                <div className="text-center py-12">
                  <Map className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No sitemap entries yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">URL</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Frequency</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Priority</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sitemapEntries.map((entry) => (
                        <tr key={entry.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono text-sm">{entry.url}</td>
                          <td className="py-3 px-4 capitalize">{entry.changeFreq}</td>
                          <td className="py-3 px-4">{entry.priority}</td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => toggleActive(entry.id, 'sitemap', entry.isActive)}
                              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                entry.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {entry.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              {entry.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingItem(entry);
                                  setShowModal('sitemap');
                                }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                                onClick={() => deleteItem(entry.id, 'sitemap')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {showModal === 'settings' && (
        <SEOSettingsModal
          item={editingItem as SEOSettings | null}
          onClose={() => {
            setShowModal(null);
            setEditingItem(null);
          }}
          onSuccess={() => {
            setShowModal(null);
            setEditingItem(null);
            loadData();
          }}
        />
      )}
      {showModal === 'redirect' && (
        <RedirectModal
          item={editingItem as Redirect | null}
          onClose={() => {
            setShowModal(null);
            setEditingItem(null);
          }}
          onSuccess={() => {
            setShowModal(null);
            setEditingItem(null);
            loadData();
          }}
        />
      )}
      {showModal === 'sitemap' && (
        <SitemapModal
          item={editingItem as SitemapEntry | null}
          onClose={() => {
            setShowModal(null);
            setEditingItem(null);
          }}
          onSuccess={() => {
            setShowModal(null);
            setEditingItem(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// SEO Settings Modal
function SEOSettingsModal({
  item,
  onClose,
  onSuccess,
}: {
  item: SEOSettings | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    pageType: item?.pageType || 'home',
    pageId: item?.pageId || '',
    metaTitle: item?.metaTitle || '',
    metaDescription: item?.metaDescription || '',
    metaKeywords: item?.metaKeywords || '',
    canonicalUrl: item?.canonicalUrl || '',
    ogTitle: item?.ogTitle || '',
    ogDescription: item?.ogDescription || '',
    ogImage: item?.ogImage || '',
    noIndex: item?.noIndex || false,
    noFollow: item?.noFollow || false,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = item ? `/api/admin/seo/${item.id}` : '/api/admin/seo';
      const method = item ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'settings', ...formData }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }

      toast.success(item ? 'Settings updated' : 'Settings created');
      onSuccess();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">{item ? 'Edit' : 'Add'} SEO Settings</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Page Type</label>
                <select
                  value={formData.pageType}
                  onChange={(e) => setFormData({ ...formData, pageType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {PAGE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Page ID (optional)</label>
                <input
                  type="text"
                  value={formData.pageId}
                  onChange={(e) => setFormData({ ...formData, pageId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Product/Category/Blog ID"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Meta Title</label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Page title for search engines"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.metaTitle.length}/60 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Meta Description</label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg h-20"
                placeholder="Page description for search results"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.metaDescription.length}/160 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Meta Keywords</label>
              <input
                type="text"
                value={formData.metaKeywords}
                onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Canonical URL</label>
              <input
                type="text"
                value={formData.canonicalUrl}
                onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="https://example.com/page"
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Open Graph (Social Sharing)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">OG Title</label>
                  <input
                    type="text"
                    value={formData.ogTitle}
                    onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">OG Description</label>
                  <textarea
                    value={formData.ogDescription}
                    onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg h-16"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">OG Image URL</label>
                  <input
                    type="text"
                    value={formData.ogImage}
                    onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Indexing Options</h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.noIndex}
                    onChange={(e) => setFormData({ ...formData, noIndex: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">noindex</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.noFollow}
                    onChange={(e) => setFormData({ ...formData, noFollow: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">nofollow</span>
                </label>
              </div>
            </div>
          </div>
          <div className="p-6 border-t flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-teal-500 hover:bg-teal-600" disabled={saving}>
              {saving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
              {item ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Redirect Modal
function RedirectModal({
  item,
  onClose,
  onSuccess,
}: {
  item: Redirect | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    fromPath: item?.fromPath || '',
    toPath: item?.toPath || '',
    statusCode: item?.statusCode || 301,
    isActive: item?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = item ? `/api/admin/seo/${item.id}` : '/api/admin/seo';
      const method = item ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'redirect', ...formData }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }

      toast.success(item ? 'Redirect updated' : 'Redirect created');
      onSuccess();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md m-4">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">{item ? 'Edit' : 'Add'} Redirect</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">From Path</label>
              <input
                type="text"
                value={formData.fromPath}
                onChange={(e) => setFormData({ ...formData, fromPath: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
                placeholder="/old-page"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">To Path</label>
              <input
                type="text"
                value={formData.toPath}
                onChange={(e) => setFormData({ ...formData, toPath: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
                placeholder="/new-page"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Redirect Type</label>
              <select
                value={formData.statusCode}
                onChange={(e) => setFormData({ ...formData, statusCode: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value={301}>301 - Permanent</option>
                <option value={302}>302 - Temporary</option>
              </select>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Active</span>
            </label>
          </div>
          <div className="p-6 border-t flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-teal-500 hover:bg-teal-600" disabled={saving}>
              {saving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
              {item ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Sitemap Modal
function SitemapModal({
  item,
  onClose,
  onSuccess,
}: {
  item: SitemapEntry | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    url: item?.url || '',
    changeFreq: item?.changeFreq || 'weekly',
    priority: item?.priority || 0.5,
    isActive: item?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = item ? `/api/admin/seo/${item.id}` : '/api/admin/seo';
      const method = item ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sitemap', ...formData }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }

      toast.success(item ? 'Entry updated' : 'Entry created');
      onSuccess();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md m-4">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">{item ? 'Edit' : 'Add'} Sitemap Entry</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">URL</label>
              <input
                type="text"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
                placeholder="https://example.com/page"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Change Frequency</label>
              <select
                value={formData.changeFreq}
                onChange={(e) => setFormData({ ...formData, changeFreq: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {CHANGE_FREQ_OPTIONS.map(freq => (
                  <option key={freq} value={freq} className="capitalize">{freq}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority (0.0 - 1.0)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Active</span>
            </label>
          </div>
          <div className="p-6 border-t flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-teal-500 hover:bg-teal-600" disabled={saving}>
              {saving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
              {item ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
