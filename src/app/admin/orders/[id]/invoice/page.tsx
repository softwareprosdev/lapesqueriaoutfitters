'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { InvoiceTemplate } from '@/components/admin/InvoiceTemplate';
import { Printer, Download, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import type { OrderDetail } from '@/types';

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef<HTMLDivElement>(null);

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
    contentRef: invoiceRef,
    documentTitle: `Invoice-${order?.orderNumber || 'Unknown'}`,
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

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current || !order) return;

    try {
      // Dynamically import jspdf and html2canvas for client-side only
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default || html2canvasModule;

      // For jsPDF, we need to use the named export
      const jspdfModule = await import('jspdf');
      const { jsPDF } = jspdfModule;

      toast.loading('Generating PDF...');

      // Capture the invoice as canvas
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Calculate dimensions to fit A4
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save(`Invoice-${order.orderNumber}.pdf`);
      toast.dismiss();
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.dismiss();
      toast.error('Failed to generate PDF. Please try printing instead.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading invoice...</p>
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
          <div className="flex gap-2">
            <Button onClick={handleDownloadPDF} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print Invoice
            </Button>
          </div>
        </div>

        {/* Invoice Preview */}
        <Card>
          <CardContent className="p-0">
            <InvoiceTemplate ref={invoiceRef} order={{
              ...order,
              createdAt: typeof order.createdAt === 'string' ? order.createdAt : order.createdAt.toISOString(),
              items: order.items.map(item => ({
                ...item,
                variant: {
                  ...item.variant,
                  size: item.variant.size || undefined,
                  color: item.variant.color || undefined,
                  material: item.variant.material || undefined
                }
              })),
              conservationDonation: order.conservationDonation || undefined
            }} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
