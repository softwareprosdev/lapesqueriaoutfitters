'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PackingSlipTemplate } from '@/components/admin/PackingSlipTemplate';
import { Printer, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import type { OrderDetail } from '@/types';

export default function PackingSlipPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const slipRef = useRef<HTMLDivElement>(null);

  const fetchOrder = useCallback(async () => {

    try {
      const response = await fetch(`/api/admin/orders/${params.id}/invoice`);
      const data = await response.json();

      if (response.ok) {
        setOrder(data.order);
      } else {
        toast.error(data.error || 'Failed to fetch order');
      }
    } catch (error) {
      console.error('Fetch order error:', error);
      toast.error('Failed to fetch order');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handlePrint = useReactToPrint({
    contentRef: slipRef,
    documentTitle: `Packing-Slip-${order?.orderNumber || 'Unknown'}`,
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
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading packing slip...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600 mb-4">Order not found</p>
        <Button onClick={() => router.push('/admin/orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Action Bar */}
        <div className="mb-6 flex justify-between items-center">
          <Button onClick={() => router.push('/admin/orders')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Packing Slip
          </Button>
        </div>

        {/* Packing Slip Preview */}
        <Card>
          <CardContent className="p-0">
            <PackingSlipTemplate ref={slipRef} order={{
              ...order,
                          createdAt: order.createdAt.toISOString(),
                          items: order.items.map(item => ({
                            ...item,
                            variant: {
                              ...item.variant,
                              size: item.variant.size || undefined,
                              color: item.variant.color || undefined,
                              material: item.variant.material || undefined
                            }
                          }))
                        }} />          </CardContent>
        </Card>
      </div>
    </div>
  );
}
