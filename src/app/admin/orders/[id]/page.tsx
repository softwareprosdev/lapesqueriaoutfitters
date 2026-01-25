'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  FileText,
  ShoppingBag,
  MapPin,
  CreditCard,
  Leaf,
  Copy,
  ExternalLink,
  X
} from 'lucide-react';
import { ShippingLabelPanel } from '@/components/admin/ShippingLabelPanel';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import type { OrderDetail } from '@/types';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  variant: {
    id: string;
    name: string;
    sku: string;
    size?: string | null;
    color?: string | null;
    material?: string | null;
    product: {
      id: string;
      name: string;
      images?: string[];
    };
  };
}

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry: string;
  cloverPaymentId?: string | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  createdAt: string;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  items: OrderItem[];
  conservationDonation?: {
    amount: number;
    percentage: number;
    status: string;
  } | null;
}

interface TimelineEvent {
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  user?: string;
}

interface OrderNote {
  id: string;
  content: string;
  createdAt: string;
  user?: {
    name: string;
  } | null;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [notes, setNotes] = useState<OrderNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState<'invoice' | 'packing-slip' | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: order ? `Invoice-${order.orderNumber}` : 'Document',
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
    onAfterPrint: () => setShowPrintModal(null),
  });

  const fetchOrderDetails = useCallback(async () => {
    setLoading(true);
    try {
      const [timelineRes, notesRes] = await Promise.all([
        fetch(`/api/admin/orders/${params.id}/timeline`),
        fetch(`/api/admin/orders/${params.id}/notes`),
      ]);

      if (timelineRes.ok) {
        const data = await timelineRes.json();
        setOrder(data.order);
        setTimeline(data.timeline);
      }

      if (notesRes.ok) {
        const data = await notesRes.json();
        setNotes(data.notes);
      }
    } catch (error) {
      console.error('Fetch order details error:', error);
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/orders/${params.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote }),
      });

      if (response.ok) {
        toast.success('Note added successfully');
        setNewNote('');
        fetchOrderDetails();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to add note');
      }
    } catch (error) {
      console.error('Add note error:', error);
      toast.error('Failed to add note');
    } finally {
      setSubmitting(false);
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  }

  function getIcon(iconName: string) {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      'shopping-bag': ShoppingBag,
      'clock': Clock,
      'truck': Truck,
      'check-circle': CheckCircle,
      'x-circle': XCircle,
      'message-square': MessageSquare,
      'package': Package,
    };
    return icons[iconName] || MessageSquare;
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'DELIVERED':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Order not found</p>
        <Button onClick={() => router.push('/admin/orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <Button onClick={() => router.push('/admin/orders')} variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Order #{order.orderNumber}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {order.customerName} • {order.customerEmail}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
          <Button
            variant="outline"
            onClick={() => {
              setShowPrintModal('invoice');
              setTimeout(() => handlePrint?.(), 100);
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            Print Invoice
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowPrintModal('packing-slip');
              setTimeout(() => handlePrint?.(), 100);
            }}
          >
            <Package className="h-4 w-4 mr-2" />
            Print Packing Slip
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Order Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {item.variant.product.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {[item.variant.size, item.variant.color, item.variant.material]
                          .filter(Boolean)
                          .join(' / ') || item.variant.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 font-mono mt-1">
                        SKU: {item.variant.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ${(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="text-gray-900 dark:text-white">${order.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tax</span>
                    <span className="text-gray-900 dark:text-white">${order.tax.toFixed(2)}</span>
                  </div>
                  {order.conservationDonation && (
                    <div className="flex justify-between text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded">
                      <span className="text-green-700 dark:text-green-400 flex items-center gap-1">
                        <Leaf className="h-4 w-4" />
                        Conservation ({order.conservationDonation.percentage}%)
                      </span>
                      <span className="text-green-700 dark:text-green-400 font-medium">
                        ${order.conservationDonation.amount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-slate-700">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-gray-900 dark:text-white">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Label Panel */}
          <ShippingLabelPanel order={order as unknown as OrderDetail} onLabelPurchased={fetchOrderDetails} />

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-700"></div>
                <div className="space-y-6">
                  {timeline.map((event, index) => {
                    const IconComponent = getIcon(event.icon);
                    return (
                      <div key={index} className="relative flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center z-10">
                          <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 pt-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{event.description}</p>
                          {event.user && (
                            <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">by {event.user}</p>
                          )}
                          <p className="text-gray-400 dark:text-gray-600 text-xs mt-1">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer & Shipping */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-gray-700 dark:text-gray-300">
                <p className="font-medium text-gray-900 dark:text-white">{order.customerName}</p>
                <p className="text-sm">{order.customerEmail}</p>
                <div className="pt-2">
                  {order.shippingAddress && <p>{order.shippingAddress}</p>}
                  {(order.shippingCity || order.shippingState || order.shippingZip) && (
                    <p>
                      {[order.shippingCity, order.shippingState].filter(Boolean).join(', ')}
                      {(order.shippingCity || order.shippingState) && order.shippingZip ? ' ' : ''}
                      {order.shippingZip}
                    </p>
                  )}
                  {order.shippingCountry && <p>{order.shippingCountry}</p>}
                </div>
                {!order.shippingAddress && !order.shippingCity && !order.shippingState && (
                  <p className="text-amber-600 dark:text-amber-400 text-sm mt-2">
                    Address not provided at checkout
                  </p>
                )}
              </div>
              {order.trackingNumber && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tracking</p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-900 dark:text-white">{order.trackingNumber}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(order.trackingNumber!, 'Tracking number')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  {order.carrier && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">via {order.carrier}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Amount Paid</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">${order.total.toFixed(2)}</p>
                </div>
                {order.cloverPaymentId && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Clover Payment ID</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded font-mono text-gray-700 dark:text-gray-300 break-all">
                        {order.cloverPaymentId}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(order.cloverPaymentId!, 'Payment ID')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <a
                      href={`https://clover.com/dashboard/transactions/${order.cloverPaymentId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-1"
                    >
                      View in Clover <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Conservation Donation */}
          {order.conservationDonation && (
            <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Leaf className="h-5 w-5" />
                  Conservation Donation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-400">Donation Amount</span>
                    <span className="font-bold text-green-700 dark:text-green-400">
                      ${order.conservationDonation.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 dark:text-green-500">Percentage</span>
                    <span className="text-green-600 dark:text-green-500">
                      {order.conservationDonation.percentage}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 dark:text-green-500">Status</span>
                    <span className="font-medium text-green-600 dark:text-green-500 uppercase">
                      {order.conservationDonation.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Order Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md resize-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  rows={3}
                />
                <Button type="submit" size="sm" disabled={submitting || !newNote.trim()}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {submitting ? 'Adding...' : 'Add Note'}
                </Button>
              </form>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {notes.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">No notes yet</p>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{note.content}</p>
                      <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-500">
                        <span>{note.user?.name || 'Unknown'}</span>
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print Modal */}
      {showPrintModal && order && (
        <div className="fixed inset-0 bg-black/80 z-50 overflow-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto relative">
              {/* Close button */}
              <button
                onClick={() => setShowPrintModal(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Print content */}
              <div ref={printRef} className="p-8">
                {showPrintModal === 'invoice' ? (
                  <div className="bg-white p-8">
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start mb-8 border-b pb-6">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
                        <p className="text-gray-600">La Pesqueria&apos;s Studio</p>
                        <p className="text-gray-600">Ocean-Inspired Handcrafted Jewelry</p>
                        <p className="text-gray-600">support@lapesqueria.com</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          <p className="font-semibold">Invoice #</p>
                          <p className="text-gray-600">{order.orderNumber}</p>
                          <p className="font-semibold mt-2">Date</p>
                          <p className="text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Bill To */}
                    <div className="mb-8">
                      <h2 className="text-lg font-semibold mb-3">Bill To:</h2>
                      <div className="text-gray-700">
                        <p className="font-medium">{order.customerName}</p>
                        <p>{order.customerEmail}</p>
                      </div>
                    </div>

                    {/* Ship To */}
                    <div className="mb-8">
                      <h2 className="text-lg font-semibold mb-3">Ship To:</h2>
                      <div className="text-gray-700">
                        <p className="font-medium">{order.customerName}</p>
                        <p>{order.shippingAddress}</p>
                        <p>{order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
                        <p>{order.shippingCountry}</p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-8">
                      <table className="w-full mb-4">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Item</th>
                            <th className="text-center py-2">Qty</th>
                            <th className="text-right py-2">Price</th>
                            <th className="text-right py-2">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item) => (
                            <tr key={item.id} className="border-b">
                              <td className="py-3">
                                <p className="font-medium">{item.variant.product.name}</p>
                                <p className="text-sm text-gray-500">
                                  {[item.variant.size, item.variant.color, item.variant.material].filter(Boolean).join(' / ') || item.variant.name}
                                </p>
                                <p className="text-xs text-gray-400 font-mono">SKU: {item.variant.sku}</p>
                              </td>
                              <td className="text-center py-3">{item.quantity}</td>
                              <td className="text-right py-3">${item.price.toFixed(2)}</td>
                              <td className="text-right py-3">${(item.quantity * item.price).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end">
                      <div className="w-64">
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">Shipping</span>
                          <span className="font-medium">${order.shipping.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">Tax</span>
                          <span className="font-medium">${order.tax.toFixed(2)}</span>
                        </div>
                        {order.conservationDonation && (
                          <div className="flex justify-between py-2 text-green-600">
                            <span>Conservation Donation ({order.conservationDonation.percentage}%)</span>
                            <span className="font-medium">${order.conservationDonation.amount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between py-2 border-t font-bold text-lg">
                          <span>Total</span>
                          <span>${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t text-center text-gray-500 text-sm">
                      <p>Thank you for your order!</p>
                      <p className="mt-1">10% of your purchase supports marine conservation.</p>
                    </div>
                  </div>
                ) : (
                  /* Packing Slip */
                  <div className="bg-white p-8">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8 border-b pb-6">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">PACKING SLIP</h1>
                        <p className="text-gray-600">La Pesqueria&apos;s Studio</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          <p className="font-semibold">Order #</p>
                          <p className="text-gray-600">{order.orderNumber}</p>
                          <p className="font-semibold mt-2">Date</p>
                          <p className="text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Ship To */}
                    <div className="mb-8">
                      <h2 className="text-lg font-semibold mb-3">Ship To:</h2>
                      <div className="text-gray-700">
                        <p className="font-medium">{order.customerName}</p>
                        <p>{order.shippingAddress}</p>
                        <p>{order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
                        <p>{order.shippingCountry}</p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-8">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-300">
                            <th className="text-left py-3">Item</th>
                            <th className="text-center py-3">Qty</th>
                            <th className="text-left py-3">SKU</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item) => (
                            <tr key={item.id} className="border-b">
                              <td className="py-4">
                                <p className="font-medium">{item.variant.product.name}</p>
                                <p className="text-sm text-gray-500">
                                  {[item.variant.size, item.variant.color, item.variant.material].filter(Boolean).join(' / ') || item.variant.name}
                                </p>
                              </td>
                              <td className="text-center py-4">{item.quantity}</td>
                              <td className="py-4 font-mono text-sm">{item.variant.sku}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t text-center text-gray-500 text-sm">
                      <p>Thank you for your order!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
