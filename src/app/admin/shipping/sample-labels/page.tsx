'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { USPSLabel, UPSLabel, FedExLabel } from '@/components/admin/ShippingLabel';
import { Printer, Download, Package, Truck, Package as PackageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

// Sample test data for label printing
const SAMPLE_ORDERS = [
  {
    id: '1',
    orderNumber: 'LP-001',
    customerName: 'Maria Garcia',
    shippingAddress: '1428 Ocean Drive',
    shippingAddress2: 'Apt 4B',
    shippingCity: 'South Padre Island',
    shippingState: 'TX',
    shippingZip: '78597',
    shippingCountry: 'US',
    customerPhone: '(555) 123-4567',
  },
  {
    id: '2',
    orderNumber: 'LP-002',
    customerName: 'James Thompson',
    shippingAddress: '2567 Coastal Highway',
    shippingAddress2: 'Suite 200',
    shippingCity: 'Galveston',
    shippingState: 'TX',
    shippingZip: '77550',
    shippingCountry: 'US',
    customerPhone: '(555) 234-5678',
  },
  {
    id: '3',
    orderNumber: 'LP-003',
    customerName: 'Sarah Williams',
    shippingAddress: '8901 Seashell Lane',
    shippingCity: 'Corpus Christi',
    shippingState: 'TX',
    shippingZip: '78401',
    shippingCountry: 'US',
  },
];

export default function SampleLabelsPage() {
  const [selectedCarrier, setSelectedCarrier] = useState<'USPS' | 'UPS' | 'FedEx'>('USPS');
  const [selectedOrder, setSelectedOrder] = useState(SAMPLE_ORDERS[0]);
  const [isPrinting, setIsPrinting] = useState(false);
  const printContainerRef = useRef<HTMLDivElement>(null);

  // Generate sample tracking numbers
  const generateTracking = useCallback((carrier: string) => {
    if (carrier === 'USPS') {
      return '9400' + Math.floor(Math.random() * 10000000000000000).toString().padStart(16, '0');
    } else if (carrier === 'FedEx') {
      return '7489' + Math.floor(Math.random() * 100000000000).toString().padStart(12, '0');
    } else {
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      return '1Z' + Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }
  }, []);

  const trackingNumber = generateTracking(selectedCarrier);

  const handlePrint = useCallback(() => {
    setIsPrinting(true);
    // Create a temporary print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print');
      setIsPrinting(false);
      return;
    }

    const labelContent = printContainerRef.current?.innerHTML || '';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedCarrier} Label</title>
          <style>
            @page {
              size: 4in 6in;
              margin: 0;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                margin: 0;
                padding: 0;
              }
              @page {
                size: 4in 6in;
                margin: 0;
              }
            }
            body {
              margin: 0;
              padding: 0;
              width: 4in;
              height: 6in;
            }
            .label-container {
              width: 4in !important;
              height: 6in !important;
              overflow: hidden;
            }
          </style>
        </head>
        <body>
          <div class="label-container">
            ${labelContent}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setIsPrinting(false);
  }, [selectedCarrier]);

  const handleDownloadSVG = useCallback(() => {
    // Create a simple SVG-based label for download
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <rect width="600" height="400" fill="white" stroke="black" stroke-width="2"/>
        <text x="300" y="40" text-anchor="middle" font-family="Arial" font-size="32" font-weight="bold">${selectedCarrier}</text>
        <text x="300" y="65" text-anchor="middle" font-family="Arial" font-size="14">${selectedCarrier === 'USPS' ? 'PRIORITY MAIL' : selectedCarrier === 'UPS' ? 'GROUND' : 'GROUND'}</text>
        <line x1="20" y1="80" x2="580" y2="80" stroke="black" stroke-width="2"/>
        <text x="30" y="110" font-family="Arial" font-size="16" font-weight="bold">FROM:</text>
        <text x="30" y="135" font-family="Arial" font-size="14">La Pesqueria Outfitters</text>
        <text x="30" y="155" font-family="Arial" font-size="14">4400 N 23rd St Suite 135</text>
        <text x="30" y="175" font-family="Arial" font-size="14">McAllen, TX 78504</text>
        <rect x="20" y="200" width="560" height="140" fill="none" stroke="black" stroke-width="2" rx="5"/>
        <text x="35" y="225" font-family="Arial" font-size="12" font-weight="bold">TO:</text>
        <text x="35" y="250" font-family="Arial" font-size="18" font-weight="bold">${selectedOrder.customerName}</text>
        <text x="35" y="275" font-family="Arial" font-size="16">${selectedOrder.shippingAddress}</text>
        ${selectedOrder.shippingAddress2 ? `<text x="35" y="295" font-family="Arial" font-size="16">${selectedOrder.shippingAddress2}</text>` : ''}
        <text x="35" y="320" font-family="Arial" font-size="16">${selectedOrder.shippingCity}, ${selectedOrder.shippingState} ${selectedOrder.shippingZip}</text>
        <text x="35" y="340" font-family="Arial" font-size="14">${selectedOrder.shippingCountry}</text>
        ${selectedOrder.customerPhone ? `<text x="35" y="360" font-family="Arial" font-size="12">Phone: ${selectedOrder.customerPhone}</text>` : ''}
        <rect x="20" y="350" width="560" height="45" fill="black"/>
        <text x="300" y="375" fill="white" text-anchor="middle" font-family="Courier" font-size="14" letter-spacing="3">${trackingNumber}</text>
      </svg>
    `;
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCarrier}-label-${selectedOrder.orderNumber}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedCarrier, selectedOrder, trackingNumber]);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sample Shipping Labels</h1>
          <p className="text-gray-600">
            Generate and print sample 4x6 shipping labels for testing your bluetooth printer.
          </p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Carrier Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Carrier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(['USPS', 'UPS', 'FedEx'] as const).map((carrier) => (
                <Button
                  key={carrier}
                  variant={selectedCarrier === carrier ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCarrier(carrier)}
                >
                  {carrier === 'USPS' && '📮'}
                  {carrier === 'UPS' && '📦'}
                  {carrier === 'FedEx' && '✈️'}
                  <span className="ml-2">{carrier}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Order Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PackageIcon className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {SAMPLE_ORDERS.map((order) => (
                <Button
                  key={order.id}
                  variant={selectedOrder.id === order.id ? 'default' : 'outline'}
                  className="w-full justify-start text-sm"
                  onClick={() => setSelectedOrder(order)}
                >
                  <span className="truncate">{order.customerName}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {order.shippingCity}
                  </span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Print Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Printer className="h-5 w-5" />
                Print Label
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600">
                <p><strong>Carrier:</strong> {selectedCarrier}</p>
                <p><strong>Tracking:</strong></p>
                <p className="font-mono text-xs break-all">{trackingNumber}</p>
              </div>
              <Button
                onClick={handlePrint}
                className="w-full"
                variant="default"
                disabled={isPrinting}
              >
                <Printer className="h-4 w-4 mr-2" />
                {isPrinting ? 'Opening...' : 'Print 4x6 Label'}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleDownloadSVG}
              >
                <Download className="h-4 w-4 mr-2" />
                Download SVG
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Label Preview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Label Preview (4x6 inches)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center bg-gray-200 p-8 rounded-lg print-preview-container">
              {/* This is the label that gets printed */}
              <div ref={printContainerRef} className="print-label">
                {selectedCarrier === 'USPS' && (
                  <USPSLabel
                    order={selectedOrder}
                    trackingNumber={trackingNumber}
                    service="Priority Mail"
                    weight="0.5"
                  />
                )}
                {selectedCarrier === 'UPS' && (
                  <UPSLabel
                    order={selectedOrder}
                    trackingNumber={trackingNumber}
                    service="Ground"
                    weight="0.5"
                  />
                )}
                {selectedCarrier === 'FedEx' && (
                  <FedExLabel
                    order={selectedOrder}
                    trackingNumber={trackingNumber}
                    service="Ground"
                    weight="0.5"
                  />
                )}
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-gray-500">
              <p>
                Preview shown above. Click &quot;Print 4x6 Label&quot; to print.
              </p>
              <p className="mt-1">
                Configure your printer to use 4x6 inch label size with no margins.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bluetooth Printer Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bluetooth Printer Setup Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">For iOS/Android Mobile Printing:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Ensure Bluetooth is enabled on your device</li>
                  <li>Pair with the printer before printing</li>
                  <li>Select the printer in your app&apos;s print dialog</li>
                  <li>Set paper size to 4x6&quot; or &quot;4x6 Label&quot;</li>
                  <li>Disable &quot;Scale to Fit&quot; for exact sizing</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Common Printer Settings:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Paper Type: Thermal (Direct Thermal)</li>
                  <li>Print Density: Medium-High</li>
                  <li>Print Speed: Medium</li>
                  <li>Mode: Label / Receipt</li>
                  <li>Gap / Black Mark: Depends on label type</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .print-preview-container {
            display: none !important;
          }
        }
        .print-label {
          width: 6in;
          height: 4in;
        }
        @media screen {
          .print-label {
            transform: scale(0.5);
            transform-origin: top center;
          }
        }
      `}</style>
    </div>
  );
}
