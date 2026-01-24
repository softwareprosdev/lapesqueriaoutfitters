'use client';

import React from 'react';
import Image from 'next/image';

interface InvoiceTemplateProps {
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string | null;
    shippingAddress: string;
    shippingCity: string;
    shippingState: string;
    shippingZip: string;
    shippingCountry: string;
    total: number;
    subtotal: number;
    shippingCost: number;
    tax: number;
    createdAt: string;
    items: Array<{
      id: string;
      quantity: number;
      price: number;
      variant: {
        sku: string;
        size?: string;
        color?: string;
        material?: string;
        product: {
          name: string;
        };
      };
    }>;
    conservationDonation?: {
      amount: number;
      percentage: number;
    };
  };
}

export const InvoiceTemplate = React.forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ order }, ref) => {
    return (
      <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto" style={{ minHeight: '100vh' }}>
        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
            <p className="text-gray-600">La Pesqueria Outfitters</p>
            <p className="text-gray-600">Premium Fishing Apparel & Gear</p>
            <p className="text-gray-600">support@lapesqueria.com</p>
          </div>
          <div className="text-right">
            <div className="mb-4">
              <Image
                src="/images/lapescerialogo.png"
                alt="La Pesqueria Outfitters"
                width={120}
                height={120}
                className="object-contain"
              />
            </div>
            <div className="text-sm space-y-1">
              <p className="font-semibold">INVOICE NUMBER: {order.orderNumber}</p>
              <p className="font-semibold">DATE: {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric'
              })}</p>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-8 grid grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-bold mb-3 text-gray-900">Bill To:</h2>
            <div className="text-gray-800">
              <p className="font-semibold text-lg">{order.customerName}</p>
              <p className="text-gray-700">{order.customerEmail}</p>
              {order.customerPhone && <p className="text-gray-700">{order.customerPhone}</p>}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold mb-3 text-gray-900">Ship To:</h2>
            <div className="text-gray-800">
              <p className="font-semibold text-lg">{order.customerName}</p>
              <div className="mt-1">
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
              {order.customerPhone && <p className="text-gray-700 mt-1">{order.customerPhone}</p>}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-900 border-b-2 border-gray-900">
                <th className="text-left py-3 px-4 font-bold text-white">Item</th>
                <th className="text-left py-3 px-4 font-bold text-white">SKU</th>
                <th className="text-left py-3 px-4 font-bold text-white">Variant</th>
                <th className="text-right py-3 px-4 font-bold text-white">Qty</th>
                <th className="text-right py-3 px-4 font-bold text-white">Price</th>
                <th className="text-right py-3 px-4 font-bold text-white">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-3 px-4 text-gray-900 font-medium">{item.variant.product.name}</td>
                  <td className="py-3 px-4 text-gray-700 font-mono text-sm">
                    {item.variant.sku}
                  </td>
                  <td className="py-3 px-4 text-gray-700 text-sm">
                    {[item.variant.size, item.variant.color, item.variant.material]
                      .filter(Boolean)
                      .join(', ') || '-'}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900 font-medium">{item.quantity}</td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900">
                    ${(item.quantity * item.price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="flex justify-between py-2 border-b border-gray-300">
              <span className="text-gray-800 font-medium">Subtotal</span>
              <span className="font-bold text-gray-900">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-300">
              <span className="text-gray-800 font-medium">Shipping</span>
              <span className="font-bold text-gray-900">${order.shippingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-300">
              <span className="text-gray-800 font-medium">Tax</span>
              <span className="font-bold text-gray-900">${order.tax.toFixed(2)}</span>
            </div>
            {order.conservationDonation && (
              <div className="flex justify-between py-2 border-b border-green-300 bg-green-100 px-3 py-2 rounded">
                <span className="font-semibold text-green-900">
                  Conservation Donation ({order.conservationDonation.percentage}%)
                </span>
                <span className="font-semibold text-green-900">
                  ${order.conservationDonation.amount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between py-3 border-b-2 border-gray-900 mt-2">
              <span className="font-bold text-xl text-gray-900">Total</span>
              <span className="font-bold text-xl text-gray-900">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-900 pt-6 text-center text-gray-800 text-sm">
          <p className="mb-2 font-medium">Thank you for your purchase!</p>
          {order.conservationDonation && (
            <p className="text-green-800 font-semibold">
              Your purchase includes a ${order.conservationDonation.amount.toFixed(2)} donation
              to local marine conservation efforts.
            </p>
          )}
          <p className="mt-4 text-gray-600">
            La Pesqueria Outfitters • Premium Fishing Apparel & Gear • McAllen, Texas
          </p>
        </div>
      </div>
    );
  }
);

InvoiceTemplate.displayName = 'InvoiceTemplate';
