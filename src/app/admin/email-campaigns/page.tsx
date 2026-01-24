'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  Send,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  Eye,
  Pause,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  MousePointerClick,
  BarChart3,
  Calendar,
  Sparkles,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  preheader: string | null;
  content: string;
  type: string;
  status: string;
  targetAudience: string | null;
  segmentName: string | null;
  recipientCount: number;
  scheduledAt: string | null;
  sentAt: string | null;
  completedAt: string | null;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalUnsubscribed: number;
  createdAt: string;
  updatedAt: string;
  _count: { recipients: number };
}

interface Stats {
  total: number;
  sent: number;
  scheduled: number;
  totalEmailsSent: number;
  totalOpens: number;
  totalClicks: number;
  avgOpenRate: number;
  avgClickRate: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const CAMPAIGN_TYPES = [
  { value: 'NEWSLETTER', label: 'Newsletter' },
  { value: 'PROMOTIONAL', label: 'Promotional' },
  { value: 'ABANDONED_CART', label: 'Abandoned Cart' },
  { value: 'WELCOME', label: 'Welcome' },
  { value: 'REENGAGEMENT', label: 'Re-engagement' },
  { value: 'ANNOUNCEMENT', label: 'Announcement' },
  { value: 'CUSTOM', label: 'Custom' },
];

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
  SENDING: 'bg-yellow-100 text-yellow-800',
  SENT: 'bg-green-100 text-green-800',
  PAUSED: 'bg-orange-100 text-orange-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function EmailCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const loadCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        status: statusFilter,
        type: typeFilter,
      });
      if (searchQuery) {
        params.set('search', searchQuery);
      }

      const response = await fetch(`/api/admin/email-campaigns?${params}`);
      if (!response.ok) throw new Error('Failed to load campaigns');

      const result = await response.json();
      setCampaigns(result.campaigns);
      setStats(result.stats);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Load campaigns error:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, searchQuery]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const sendCampaign = async (campaign: Campaign) => {
    if (!confirm(`Are you sure you want to send "${campaign.name}" to ${campaign.recipientCount} recipients?`)) {
      return;
    }

    setSendingId(campaign.id);
    try {
      const response = await fetch(`/api/admin/email-campaigns/${campaign.id}/send`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send campaign');
      }

      const result = await response.json();
      toast.success(result.message);
      loadCampaigns();
    } catch (error) {
      console.error('Send campaign error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send campaign');
    } finally {
      setSendingId(null);
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const response = await fetch(`/api/admin/email-campaigns/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete campaign');

      toast.success('Campaign deleted');
      loadCampaigns();
    } catch (error) {
      console.error('Delete campaign error:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && campaigns.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Campaigns</h1>
          <p className="text-gray-500 mt-1">Create and manage email marketing campaigns</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadCampaigns()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            className="bg-teal-500 hover:bg-teal-600"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500 rounded-xl">
                  <Mail className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
              <p className="text-sm text-gray-600">Total Campaigns</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-500 rounded-xl">
                  <Send className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalEmailsSent.toLocaleString()}</h3>
              <p className="text-sm text-gray-600">Emails Sent</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-500 rounded-xl">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.avgOpenRate.toFixed(1)}%</h3>
              <p className="text-sm text-gray-600">Avg. Open Rate</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange-500 rounded-xl">
                  <MousePointerClick className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.avgClickRate.toFixed(1)}%</h3>
              <p className="text-sm text-gray-600">Avg. Click Rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="SENDING">Sending</option>
          <option value="SENT">Sent</option>
          <option value="PAUSED">Paused</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Types</option>
          {CAMPAIGN_TYPES.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-500" />
            Campaigns ({pagination?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No campaigns found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowCreateModal(true)}
              >
                Create Your First Campaign
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Campaign</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Recipients</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Performance</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">{campaign.subject}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">
                          {CAMPAIGN_TYPES.find(t => t.value === campaign.type)?.label || campaign.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[campaign.status]}`}>
                          {campaign.status === 'DRAFT' && <Edit2 className="w-3 h-3" />}
                          {campaign.status === 'SCHEDULED' && <Clock className="w-3 h-3" />}
                          {campaign.status === 'SENDING' && <RefreshCw className="w-3 h-3 animate-spin" />}
                          {campaign.status === 'SENT' && <CheckCircle className="w-3 h-3" />}
                          {campaign.status === 'PAUSED' && <Pause className="w-3 h-3" />}
                          {campaign.status === 'CANCELLED' && <AlertCircle className="w-3 h-3" />}
                          {campaign.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{campaign.recipientCount.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {campaign.status === 'SENT' ? (
                          <div className="text-sm">
                            <div className="flex items-center gap-4">
                              <span className="text-green-600">
                                {campaign.totalSent > 0 ? ((campaign.totalOpened / campaign.totalSent) * 100).toFixed(1) : 0}% opens
                              </span>
                              <span className="text-blue-600">
                                {campaign.totalOpened > 0 ? ((campaign.totalClicked / campaign.totalOpened) * 100).toFixed(1) : 0}% clicks
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {campaign.sentAt ? (
                            <>
                              <p>Sent {formatDate(campaign.sentAt)}</p>
                            </>
                          ) : campaign.scheduledAt ? (
                            <p className="text-blue-600">
                              Scheduled {formatDate(campaign.scheduledAt)}
                            </p>
                          ) : (
                            <p className="text-gray-500">
                              Created {formatDate(campaign.createdAt)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCampaign(campaign)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {campaign.status === 'DRAFT' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-teal-500 hover:bg-teal-600"
                                onClick={() => sendCampaign(campaign)}
                                disabled={sendingId === campaign.id}
                              >
                                {sendingId === campaign.id ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Send className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => deleteCampaign(campaign.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * pagination.limit + 1} to{' '}
                {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} campaigns
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {showCreateModal && (
          <CreateCampaignModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              loadCampaigns();
            }}
          />
        )}

        {selectedCampaign && (
          <ViewCampaignModal
            campaign={selectedCampaign}
            onClose={() => setSelectedCampaign(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Create Campaign Modal
function CreateCampaignModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    preheader: '',
    content: '',
    type: 'NEWSLETTER',
    segmentName: 'All Newsletter Subscribers',
    scheduledAt: '',
  });
  const [saving, setSaving] = useState(false);
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Determine targetAudience JSON based on segmentName
    let targetAudienceJson = '{}';
    if (formData.segmentName === 'All Newsletter Subscribers') {
      targetAudienceJson = JSON.stringify({ subscribedToNewsletter: true });
    } else if (formData.segmentName === 'Customers Who Have Ordered') {
      targetAudienceJson = JSON.stringify({ hasOrdered: true });
    } else if (formData.segmentName === 'All Customers') {
      targetAudienceJson = JSON.stringify({});
    }

    try {
      const response = await fetch('/api/admin/email-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          targetAudience: targetAudienceJson,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create campaign');
      }

      toast.success('Campaign created successfully');
      onSuccess();
    } catch (error) {
      console.error('Create campaign error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create campaign');
    } finally {
      setSaving(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGeneratingAi(true);
    try {
      const response = await fetch('/api/ai/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiPrompt,
          type: formData.type
        }),
      });

      if (!response.ok) throw new Error('AI generation failed');

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        subject: data.subject || prev.subject,
        preheader: data.preheader || prev.preheader,
        content: data.content || prev.content
      }));
      
      setShowAiPrompt(false);
      toast.success('Generated content with AI!');
    } catch (error) {
      console.error('AI error:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Create New Campaign
            </h2>
            <div className="flex gap-2">
              <Button 
                type="button" 
                size="sm" 
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0"
                onClick={() => setShowAiPrompt(!showAiPrompt)}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate with AI
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <AnimatePresence>
            {showAiPrompt && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-4 bg-violet-50 rounded-lg border border-violet-100">
                  <label className="block text-sm font-medium text-violet-900 mb-2">
                    What should this email be about?
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g. Summer sale announcement with 20% off all bracelets..."
                      className="flex-1 px-3 py-2 border border-violet-200 rounded-lg focus:ring-2 focus:ring-violet-500"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAiGenerate())}
                    />
                    <Button 
                      onClick={handleAiGenerate}
                      disabled={isGeneratingAi || !aiPrompt.trim()}
                      className="bg-violet-600 hover:bg-violet-700 text-white"
                    >
                      {isGeneratingAi ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Generate'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Campaign Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., January Newsletter"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Campaign Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                {CAMPAIGN_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., 🌊 New Ocean-Inspired Bracelets Just Arrived!"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Preheader (Preview Text)</label>
              <input
                type="text"
                value={formData.preheader}
                onChange={(e) => setFormData({ ...formData, preheader: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Short preview text shown after subject line"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email Content (HTML)</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 h-48 font-mono text-sm"
                placeholder="<h1>Hello!</h1><p>Your email content here...</p>"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Target Audience</label>
              <select
                value={formData.segmentName}
                onChange={(e) => {
                  const selectedSegment = e.target.value;
                  setFormData({ ...formData, segmentName: selectedSegment });
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="All Newsletter Subscribers">All Newsletter Subscribers</option>
                <option value="All Customers">All Customers</option>
                <option value="Customers Who Have Ordered">Customers Who Have Ordered</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Schedule (Optional)</label>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to save as draft and send manually
              </p>
            </div>
          </div>
          <div className="p-6 border-t flex gap-3 justify-end bg-gray-50 rounded-b-xl">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-teal-500 hover:bg-teal-600 text-white"
              disabled={saving}
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Create Campaign
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// View Campaign Modal
function ViewCampaignModal({
  campaign,
  onClose,
}: {
  campaign: Campaign;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">{campaign.name}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Campaign Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[campaign.status]}`}>
                {campaign.status}
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium">
                {CAMPAIGN_TYPES.find(t => t.value === campaign.type)?.label || campaign.type}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Recipients</p>
              <p className="font-medium">{campaign.recipientCount.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Segment</p>
              <p className="font-medium">{campaign.segmentName || 'All'}</p>
            </div>
          </div>

          {/* Performance Stats */}
          {campaign.status === 'SENT' && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Performance Metrics
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{campaign.totalSent}</p>
                  <p className="text-sm text-gray-500">Sent</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{campaign.totalOpened}</p>
                  <p className="text-sm text-gray-500">Opened</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">{campaign.totalClicked}</p>
                  <p className="text-sm text-gray-500">Clicked</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">{campaign.totalBounced}</p>
                  <p className="text-sm text-gray-500">Bounced</p>
                </div>
              </div>
            </div>
          )}

          {/* Email Content */}
          <div>
            <h3 className="font-semibold mb-3">Email Subject</h3>
            <p className="bg-gray-50 p-3 rounded-lg">{campaign.subject}</p>
          </div>

          {campaign.preheader && (
            <div>
              <h3 className="font-semibold mb-3">Preheader</h3>
              <p className="bg-gray-50 p-3 rounded-lg text-gray-600">{campaign.preheader}</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-3">Email Content</h3>
            <div className="bg-gray-50 p-4 rounded-lg border max-h-64 overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: campaign.content }} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}