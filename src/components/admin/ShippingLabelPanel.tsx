'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Package,
  Truck,
  Printer,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { OrderDetail } from '@/types';
import { ShippingLabel, USPSLabel, UPSLabel, FedExLabel } from '@/components/admin/ShippingLabel';

interface ShippingRate {
  id: string;
  provider: string;
  servicelevel: {
    name: string;
    token: string;
  };
  amount: string;
  currency: string;
  estimated_days: number | null;
  duration_terms: string;
}

interface ShippingLabel {
  id: string;
  carrier: string;
  service: string;
  trackingNumber: string;
  labelUrl: string | null;
  cost: number;
  status: string;
  createdAt: string;
}

interface TrackingEvent {
  date: string;
  time: string;
  location: string;
  status: string;
  statusDetails: string;
}

interface TrackingInfo {
  carrier: string;
  trackingNumber: string;
  status: string;
  statusDetails: string;
  estimatedDelivery?: string;
  events: TrackingEvent[];
  trackingUrl?: string;
}

interface ShippingLabelPanelProps {
  order: OrderDetail;
  onLabelPurchased?: () => void;
}

export function ShippingLabelPanel({ order, onLabelPurchased }: ShippingLabelPanelProps) {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [label, setLabel] = useState<ShippingLabel | null>(null);
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [loadingRates, setLoadingRates] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState(false);
  const [purchasingLabel, setPurchasingLabel] = useState(false);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [showLabelPreview, setShowLabelPreview] = useState(false);

  // Fetch existing label on mount
  useEffect(() => {
    fetchExistingLabel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.id]);

  // Fetch tracking when label exists
  useEffect(() => {
    if (order.trackingNumber && order.carrier) {
      fetchTracking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.trackingNumber, order.carrier]);

  async function fetchExistingLabel() {
    setLoadingLabel(true);
    try {
      const res = await fetch(`/api/admin/shipping/labels?orderId=${order.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.label) {
          setLabel(data.label);
        }
      }
    } catch (error) {
      console.error('Failed to fetch label:', error);
    } finally {
      setLoadingLabel(false);
    }
  }

  async function fetchRates() {
    setLoadingRates(true);
    setRates([]);
    setSelectedRate(null);

    try {
      // Calculate total weight from items
      const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

      const res = await fetch('/api/admin/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: {
            name: order.customerName,
            line1: order.shippingAddress,
            city: order.shippingCity,
            state: order.shippingState,
            postalCode: order.shippingZip,
            country: order.shippingCountry,
          },
          items: order.items.map(item => ({ quantity: item.quantity })),
          totalQuantity,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRates(data.rates || []);
        if (data.rates?.length > 0) {
          setSelectedRate(data.rates[0]);
        }
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to fetch rates');
      }
    } catch (error) {
      console.error('Failed to fetch rates:', error);
      toast.error('Failed to fetch shipping rates');
    } finally {
      setLoadingRates(false);
    }
  }

  async function purchaseLabel() {
    if (!selectedRate) {
      toast.error('Please select a shipping rate');
      return;
    }

    setPurchasingLabel(true);
    try {
      const res = await fetch('/api/admin/shipping/labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          rateId: selectedRate.id,
          carrier: selectedRate.provider,
          service: selectedRate.servicelevel.name,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Shipping label purchased successfully!');
        setLabel({
          id: data.label.id,
          carrier: data.label.carrier,
          service: data.label.service,
          trackingNumber: data.label.trackingNumber,
          labelUrl: data.label.labelUrl,
          cost: data.label.cost,
          status: 'created',
          createdAt: new Date().toISOString(),
        });
        setRates([]);
        setSelectedRate(null);
        onLabelPurchased?.();
      } else {
        toast.error(data.error || 'Failed to purchase label');
      }
    } catch (error) {
      console.error('Failed to purchase label:', error);
      toast.error('Failed to purchase shipping label');
    } finally {
      setPurchasingLabel(false);
    }
  }

  async function fetchTracking() {
    setLoadingTracking(true);
    try {
      const res = await fetch(`/api/admin/shipping/tracking?orderId=${order.id}`);
      if (res.ok) {
        const data = await res.json();
        setTracking(data);
      }
    } catch (error) {
      console.error('Failed to fetch tracking:', error);
    } finally {
      setLoadingTracking(false);
    }
  }

  function getTrackingStatusColor(status: string) {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 'text-green-400 bg-green-900/30';
      case 'TRANSIT':
        return 'text-blue-400 bg-blue-900/30';
      case 'FAILURE':
      case 'RETURNED':
        return 'text-red-400 bg-red-900/30';
      default:
        return 'text-slate-400 bg-slate-800';
    }
  }

  // If label already purchased, show label info and tracking
  if (label || order.trackingNumber) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Shipping Label
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Label Info */}
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-semibold text-green-400">Label Purchased</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-400">Carrier:</span>
                <p className="font-medium text-white">{label?.carrier || order.carrier}</p>
              </div>
              <div>
                <span className="text-slate-400">Service:</span>
                <p className="font-medium text-white">{label?.service || 'Standard'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400">Tracking Number:</span>
                <p className="font-medium font-mono text-white">{label?.trackingNumber || order.trackingNumber}</p>
              </div>
              {label?.cost && (
                <div>
                  <span className="text-slate-400">Cost:</span>
                  <p className="font-medium text-white">${label.cost.toFixed(2)}</p>
                </div>
              )}
            </div>
            {label?.labelUrl ? (
              <div className="mt-4 space-y-3">
                {/* Primary Print Button */}
                <Button
                  onClick={() => window.open(label.labelUrl!, '_blank')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                >
                  <Printer className="h-5 w-5 mr-2" />
                  Print Shipping Label
                </Button>

                {/* Secondary Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLabelPreview(!showLabelPreview)}
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    {showLabelPreview ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Hide Preview
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Label
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = label.labelUrl!;
                      link.download = `shipping-label-${order.orderNumber || 'label'}.pdf`;
                      link.click();
                    }}
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>

                {/* Label Preview */}
                {showLabelPreview && (
                  <div className="border border-slate-600 rounded-lg overflow-hidden">
                    <div className="bg-slate-800 px-3 py-2 flex items-center justify-between">
                      <span className="text-sm text-slate-300">Shipping Label Preview</span>
                      <span className="text-xs text-slate-500">4x6 Label</span>
                    </div>
                    <div className="bg-white p-4 flex justify-center">
                      {label.labelUrl?.includes('svg') || label.labelUrl?.includes('sample-label') ? (
                        // SVG or sample label - render as image
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={label.labelUrl}
                          alt="Shipping Label"
                          className="max-w-full h-auto border border-gray-300 shadow-md"
                          style={{ maxHeight: '500px' }}
                        />
                      ) : (
                        // PDF - try to embed with fallback
                        <object
                          data={label.labelUrl}
                          type="application/pdf"
                          className="w-full h-96"
                        >
                          {/* Fallback if PDF can't be embedded */}
                          <div className="flex flex-col items-center justify-center h-96 bg-slate-100 text-slate-600">
                            <Printer className="h-12 w-12 mb-4 text-slate-400" />
                            <p className="text-sm font-medium mb-2">PDF Preview Not Available</p>
                            <p className="text-xs text-slate-500 mb-4 text-center px-4">
                              Your browser cannot display this PDF inline.
                            </p>
                            <Button
                              size="sm"
                              onClick={() => window.open(label.labelUrl!, '_blank')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open PDF in New Tab
                            </Button>
                          </div>
                        </object>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* No real label URL - Show sample label using our component */
              <div className="mt-4 space-y-3">
                {/* Sample Label Info */}
                <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-amber-400">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Sample Label (Test Mode)</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    No shipping label purchased yet. This is a sample label for testing your printer.
                  </p>
                </div>

                {/* Primary Print Button */}
                <Button
                  onClick={() => setShowLabelPreview(!showLabelPreview)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                >
                  <Printer className="h-5 w-5 mr-2" />
                  {showLabelPreview ? 'Hide Sample Label' : 'Show Sample Label'}
                </Button>

                {/* Label Preview */}
                {showLabelPreview && (
                  <div className="border border-slate-600 rounded-lg overflow-hidden">
                    <div className="bg-slate-800 px-3 py-2 flex items-center justify-between">
                      <span className="text-sm text-slate-300">Sample Label Preview</span>
                      <span className="text-xs text-slate-500">4x6 Label</span>
                    </div>
                    <div className="bg-gray-100 p-4 flex justify-center">
                      <div style={{ transform: 'scale(0.6)', transformOrigin: 'top center' }}>
                        {(label?.carrier === 'UPS' || order.carrier === 'UPS') && (
                          <UPSLabel
                            order={{
                              orderNumber: order.orderNumber,
                              customerName: order.customerName,
                              shippingAddress: order.shippingAddress,
                              shippingCity: order.shippingCity,
                              shippingState: order.shippingState,
                              shippingZip: order.shippingZip,
                              shippingCountry: order.shippingCountry,
                            }}
                            trackingNumber={label?.trackingNumber || order.trackingNumber || '1Z' + Math.random().toString(36).substring(2, 18).toUpperCase()}
                            service={label?.service || order.carrier || 'Ground'}
                            weight="0.5"
                          />
                        )}
                        {(label?.carrier === 'FedEx' || order.carrier === 'FedEx') && (
                          <FedExLabel
                            order={{
                              orderNumber: order.orderNumber,
                              customerName: order.customerName,
                              shippingAddress: order.shippingAddress,
                              shippingCity: order.shippingCity,
                              shippingState: order.shippingState,
                              shippingZip: order.shippingZip,
                              shippingCountry: order.shippingCountry,
                            }}
                            trackingNumber={label?.trackingNumber || order.trackingNumber || '7489' + Math.floor(Math.random() * 100000000000).toString().padStart(12, '0')}
                            service={label?.service || order.carrier || 'Ground'}
                            weight="0.5"
                          />
                        )}
                        {(!label?.carrier && !order.carrier || label?.carrier === 'USPS' || order.carrier === 'USPS') && (
                          <USPSLabel
                            order={{
                              orderNumber: order.orderNumber,
                              customerName: order.customerName,
                              shippingAddress: order.shippingAddress,
                              shippingCity: order.shippingCity,
                              shippingState: order.shippingState,
                              shippingZip: order.shippingZip,
                              shippingCountry: order.shippingCountry,
                            }}
                            trackingNumber={label?.trackingNumber || order.trackingNumber || '9400' + Math.floor(Math.random() * 10000000000000000).toString().padStart(16, '0')}
                            service={label?.service || 'Priority Mail'}
                            weight="0.5"
                          />
                        )}
                      </div>
                    </div>
                    <div className="bg-slate-800 px-3 py-2 text-center">
                      <Button
                        size="sm"
                        onClick={() => window.open('/admin/shipping/sample-labels', '_blank')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Open Sample Label Printer
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tracking Info */}
          {(order.trackingNumber || label?.trackingNumber) && (
            <div className="border border-slate-700 rounded-lg p-4 bg-slate-900">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold flex items-center gap-2 text-white">
                  <Truck className="h-4 w-4" />
                  Tracking Updates
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchTracking}
                  disabled={loadingTracking}
                  className="text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingTracking ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {loadingTracking ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                </div>
              ) : tracking ? (
                <div className="space-y-3">
                  {/* Current Status */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getTrackingStatusColor(tracking.status)}`}>
                      {tracking.status}
                    </span>
                    <span className="text-sm text-slate-400">{tracking.statusDetails}</span>
                  </div>

                  {tracking.estimatedDelivery && (
                    <p className="text-sm text-slate-400">
                      Estimated delivery: <span className="font-medium text-white">{tracking.estimatedDelivery}</span>
                    </p>
                  )}

                  {/* Tracking Events */}
                  {tracking.events.length > 0 && (
                    <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                      {tracking.events.slice(0, 5).map((event, index) => (
                        <div key={index} className="text-sm border-l-2 border-slate-700 pl-3">
                          <p className="font-medium text-slate-200">{event.statusDetails || event.status}</p>
                          <p className="text-slate-500">
                            {event.location && `${event.location} • `}
                            {event.date} {event.time}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {tracking.trackingUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 border-slate-700 text-slate-300 hover:bg-slate-800"
                      onClick={() => window.open(tracking.trackingUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Track on Carrier Site
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Click refresh to load tracking info</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show rate selection and purchase UI
  return (
    <Card className="border-slate-700 bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Package className="h-5 w-5" />
          Create Shipping Label
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Shipping Address */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
          <h4 className="font-medium text-sm text-slate-300 mb-2">Ship To:</h4>
          <p className="text-sm text-slate-200">{order.customerName}</p>
          <p className="text-sm text-slate-400">{order.shippingAddress}</p>
          <p className="text-sm text-slate-400">
            {order.shippingCity}, {order.shippingState} {order.shippingZip}
          </p>
          <p className="text-sm text-slate-400">{order.shippingCountry}</p>
        </div>

        {/* Get Rates Button */}
        {rates.length === 0 && (
          <Button
            onClick={fetchRates}
            disabled={loadingRates}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loadingRates ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Getting Rates...
              </>
            ) : (
              <>
                <Truck className="h-4 w-4 mr-2" />
                Get Shipping Rates
              </>
            )}
          </Button>
        )}

        {/* Rate Selection */}
        {rates.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-slate-300">Select Shipping Service:</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {rates.map((rate) => (
                <div
                  key={rate.id}
                  onClick={() => setSelectedRate(rate)}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedRate?.id === rate.id
                      ? 'border-blue-500 bg-blue-900/30'
                      : 'border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={selectedRate?.id === rate.id}
                      onChange={() => setSelectedRate(rate)}
                      className="text-blue-500 bg-slate-800 border-slate-600"
                    />
                    <div>
                      <p className="font-medium text-sm text-white">
                        {rate.provider} {rate.servicelevel.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {rate.estimated_days
                          ? `${rate.estimated_days} business day${rate.estimated_days > 1 ? 's' : ''}`
                          : rate.duration_terms || 'Delivery time varies'}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-white">${rate.amount}</span>
                </div>
              ))}
            </div>

            {/* Purchase Button */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={purchaseLabel}
                disabled={!selectedRate || purchasingLabel}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {purchasingLabel ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Purchasing...
                  </>
                ) : (
                  <>
                    <Package className="h-4 w-4 mr-2" />
                    Purchase Label {selectedRate && `($${selectedRate.amount})`}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setRates([]);
                  setSelectedRate(null);
                }}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-900/20 border border-amber-900/50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>
                Make sure the shipping address is correct before proceeding.
                Label purchases cannot be undone.
              </p>
            </div>
          </div>
        )}

        {loadingLabel && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            <span className="ml-2 text-sm text-slate-500">Loading label info...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
