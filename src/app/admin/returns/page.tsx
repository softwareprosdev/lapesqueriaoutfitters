'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Truck,
  DollarSign,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface ReturnItem {
  id: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  condition?: string;
  restockable: boolean;
}

interface Return {
  id: string;
  returnNumber: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  reason: string;
  reasonDetails?: string;
  status: string;
  refundAmount?: number;
  refundMethod?: string;
  returnTrackingNumber?: string;
  createdAt: string;
  order: {
    orderNumber: string;
    total: number;
    createdAt: string;
  };
  items: ReturnItem[];
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  received: number;
  refunded: number;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  APPROVED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  RECEIVED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  INSPECTING: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  REFUND_PENDING: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  REFUNDED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-400',
};

const REASON_LABELS: Record<string, string> = {
  DEFECTIVE: 'Defective Product',
  WRONG_ITEM: 'Wrong Item Received',
  NOT_AS_DESCRIBED: 'Not as Described',
  CHANGED_MIND: 'Changed Mind',
  SIZE_ISSUE: 'Size Issue',
  QUALITY_ISSUE: 'Quality Issue',
  ARRIVED_LATE: 'Arrived Late',
  OTHER: 'Other',
};

export default function ReturnsPage() {
  const router = useRouter();
  const [returns, setReturns] = useState<Return[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, received: 0, refunded: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadReturns = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/returns?${params}`);
      if (!response.ok) throw new Error('Failed to load returns');

      const data = await response.json();
      setReturns(data.returns);
      setStats(data.stats);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Load returns error:', error);
      toast.error('Failed to load returns');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    loadReturns();
  }, [loadReturns]);

  const updateReturnStatus = async (returnId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/returns/${returnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update return');

      toast.success(`Return ${newStatus.toLowerCase().replace('_', ' ')}`);
      loadReturns();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Update return error:', error);
      toast.error('Failed to update return status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Returns & Refunds</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage return requests and process refunds</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-gray-400 dark:text-slate-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-900/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 uppercase">Pending</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-500">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500 dark:text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-900/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400 uppercase">Approved</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-500">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500 dark:text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-900/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 dark:text-purple-400 uppercase">Received</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-500">{stats.received}</p>
              </div>
              <Truck className="w-8 h-8 text-purple-500 dark:text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-900/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 dark:text-green-400 uppercase">Refunded</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-500">{stats.refunded}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500 dark:text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search by return #, order #, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 dark:text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="RECEIVED">Received</option>
                <option value="INSPECTING">Inspecting</option>
                <option value="REFUND_PENDING">Refund Pending</option>
                <option value="REFUNDED">Refunded</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <Button variant="outline" onClick={() => loadReturns()} className="dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Returns Table */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Return Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : returns.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No returns found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Return #</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Order</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Customer</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Reason</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Amount</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Date</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map((returnItem) => (
                    <tr key={returnItem.id} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm text-gray-900 dark:text-gray-200">{returnItem.returnNumber.slice(0, 8)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => router.push(`/admin/orders/${returnItem.orderId}`)}
                          className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium text-sm"
                        >
                          #{returnItem.order.orderNumber.slice(0, 8)}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{returnItem.customerName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{returnItem.customerEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{REASON_LABELS[returnItem.reason] || returnItem.reason}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(returnItem.refundAmount || 0)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[returnItem.status]}`}>
                          {returnItem.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(returnItem.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                          onClick={() => {
                            setSelectedReturn(returnItem);
                            setShowDetailModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="dark:border-slate-700 dark:text-slate-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="dark:border-slate-700 dark:text-slate-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Return Detail Modal */}
      {showDetailModal && selectedReturn && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-slate-700">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Return #{selectedReturn.returnNumber.slice(0, 8)}</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Order #{selectedReturn.order.orderNumber.slice(0, 8)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[selectedReturn.status]}`}>
                  {selectedReturn.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Customer Information</h3>
                <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 border border-gray-100 dark:border-slate-700">
                  <p className="font-medium text-gray-900 dark:text-white">{selectedReturn.customerName}</p>
                  <p className="text-gray-600 dark:text-gray-400">{selectedReturn.customerEmail}</p>
                </div>
              </div>

              {/* Return Reason */}
              <div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Return Reason</h3>
                <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 border border-gray-100 dark:border-slate-700">
                  <p className="font-medium text-gray-900 dark:text-white">{REASON_LABELS[selectedReturn.reason]}</p>
                  {selectedReturn.reasonDetails && (
                    <p className="text-gray-600 dark:text-gray-400 mt-2">{selectedReturn.reasonDetails}</p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Return Items</h3>
                <div className="space-y-2">
                  {selectedReturn.items.map((item) => (
                    <div key={item.id} className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 flex justify-between items-center border border-gray-100 dark:border-slate-700">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.productName}</p>
                        {item.variantName && <p className="text-sm text-gray-500 dark:text-gray-400">{item.variantName}</p>}
                        <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.unitPrice * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Refund Amount */}
              <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 border border-teal-100 dark:border-teal-800">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-teal-800 dark:text-teal-300">Total Refund Amount</span>
                  <span className="text-xl font-bold text-teal-700 dark:text-teal-400">
                    {formatCurrency(selectedReturn.refundAmount || 0)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-slate-700">
                {selectedReturn.status === 'PENDING' && (
                  <>
                    <Button
                      onClick={() => updateReturnStatus(selectedReturn.id, 'APPROVED')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Return
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => updateReturnStatus(selectedReturn.id, 'REJECTED')}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Return
                    </Button>
                  </>
                )}
                {selectedReturn.status === 'APPROVED' && (
                  <Button
                    onClick={() => updateReturnStatus(selectedReturn.id, 'RECEIVED')}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Mark as Received
                  </Button>
                )}
                {selectedReturn.status === 'RECEIVED' && (
                  <Button
                    onClick={() => updateReturnStatus(selectedReturn.id, 'INSPECTING')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Start Inspection
                  </Button>
                )}
                {(selectedReturn.status === 'INSPECTING' || selectedReturn.status === 'REFUND_PENDING') && (
                  <Button
                    onClick={() => updateReturnStatus(selectedReturn.id, 'REFUNDED')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Process Refund
                  </Button>
                )}
                <Button variant="outline" onClick={() => setShowDetailModal(false)} className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
