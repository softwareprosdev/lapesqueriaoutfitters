'use client';

import React from 'react';
import Image from 'next/image';

interface PackingSlipTemplateProps {
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    shippingAddress: string;
    shippingCity: string;
    shippingState: string;
    shippingZip: string;
    shippingCountry: string;
    createdAt: string;
    items: Array<{
      id: string;
      quantity: number;
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
  };
}

export const PackingSlipTemplate = React.forwardRef<HTMLDivElement, PackingSlipTemplateProps>(
  ({ order }, ref) => {
    return (
      <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto" style={{ minHeight: '100vh' }}>
        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b-2 border-gray-800 pb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">PACKING SLIP</h1>
            <p className="text-gray-600 text-lg">La Pesqueria Outfitters</p>
          </div>
          <div className="text-right">
            <Image
              src="/images/lapescerialogo.png"
              alt="La Pesqueria Outfitters"
              width={100}
              height={100}
              className="object-contain mb-2"
            />
            <div className="text-sm">
              <p className="font-semibold">Order #</p>
              <p className="text-gray-600 font-mono">{order.orderNumber}</p>
              <p className="font-semibold mt-2">Date</p>
              <p className="text-gray-600">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Ship To */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
          <h2 className="text-xl font-bold mb-3 text-gray-800">SHIP TO:</h2>
          <div className="text-gray-700 text-lg">
            <p className="font-bold text-xl">{order.customerName}</p>
            <p className="mt-2">{order.shippingAddress}</p>
            <p>
              {order.shippingCity}, {order.shippingState} {order.shippingZip}
            </p>
            <p>{order.shippingCountry}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">ITEMS TO PACK:</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="text-left py-4 px-4 font-bold">ITEM</th>
                <th className="text-left py-4 px-4 font-bold">SKU</th>
                <th className="text-left py-4 px-4 font-bold">VARIANT</th>
                <th className="text-center py-4 px-4 font-bold">QTY</th>
                <th className="text-center py-4 px-4 font-bold w-20">✓</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr
                  key={item.id}
                  className={`border-b-2 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <td className="py-4 px-4 font-medium text-gray-800">
                    {item.variant.product.name}
                  </td>
                  <td className="py-4 px-4 font-mono text-sm text-gray-600">
                    {item.variant.sku}
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {[item.variant.size, item.variant.color, item.variant.material]
                      .filter(Boolean)
                      .join(', ') || '-'}
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-xl">
                    {item.quantity}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="w-8 h-8 border-2 border-gray-400 rounded"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Items Count */}
        <div className="mb-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-blue-900">TOTAL ITEMS:</span>
            <span className="text-2xl font-bold text-blue-900">
              {order.items.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
        </div>

        {/* Packing Checklist */}
        <div className="mb-8 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <h3 className="text-lg font-bold mb-3 text-yellow-900">PACKING CHECKLIST:</h3>
          <div className="space-y-2 text-yellow-900">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-yellow-600 rounded"></div>
              <span>All items checked and packed</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-yellow-600 rounded"></div>
              <span>Thank you card included</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-yellow-600 rounded"></div>
              <span>Conservation information included</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-yellow-600 rounded"></div>
              <span>Package sealed securely</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 pt-6 text-center text-gray-600">
          <p className="text-sm">
            Thank you for supporting ocean conservation with every purchase!
          </p>
          <p className="mt-2 text-xs text-gray-500">
            La Pesqueria Outfitters • 4400 N 23rd St Suite 135, McAllen, TX
          </p>
          <p className="mt-4 text-xs text-gray-400">
            For packing use only - Not a customer receipt
          </p>
        </div>
      </div>
    );
  }
);

PackingSlipTemplate.displayName = 'PackingSlipTemplate';
