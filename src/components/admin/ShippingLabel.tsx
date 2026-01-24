'use client';

import React from 'react';
import Image from 'next/image';

interface ShippingLabelProps {
  order: {
    orderNumber: string;
    customerName: string;
    shippingAddress: string;
    shippingAddress2?: string;
    shippingCity: string;
    shippingState: string;
    shippingZip: string;
    shippingCountry: string;
    customerPhone?: string | null;
  };
  carrier: 'USPS' | 'UPS' | 'FedEx';
  trackingNumber: string;
  service: string;
  weight?: string;
  date?: string;
}

/**
 * 4x6 Shipping Label Component
 * Designed for thermal bluetooth printers with scannable barcode
 */
export const ShippingLabel = React.forwardRef<HTMLDivElement, ShippingLabelProps>(
  ({ order, carrier, trackingNumber, service, weight, date }, ref) => {
    // Carrier-specific configuration
    const carrierConfig = {
      USPS: {
        name: 'USPS',
        color: '#333333',
        barColor: '#000000',
        serviceName: service || 'PRIORITY MAIL',
        logoText: '📮',
      },
      UPS: {
        name: 'UPS',
        color: '#351C15',
        barColor: '#000000',
        serviceName: service || 'GROUND',
        logoText: 'UPS',
      },
      FedEx: {
        name: 'FEDEX',
        color: '#4D148C',
        barColor: '#000000',
        serviceName: service || 'GROUND',
        logoText: '✈️',
      },
    };

    const config = carrierConfig[carrier];
    const barHeight = 48;

    // Generate barcode bars (Code128 style)
    const generateBarcodeBars = (data: string): {x: number; width: number}[] => {
      const bars: {x: number; width: number}[] = [];
      let x = 0;
      const barW = 2;
      const spaceW = 1;
      
      // Start pattern
      bars.push({ x, width: barW * 2 });
      x += barW * 2 + spaceW * 2;
      
      for (let i = 0; i < data.length; i++) {
        const charCode = data.charCodeAt(i);
        const value = ((charCode - 32 + i) % 90) + 1;
        
        for (let j = 0; j < 3; j++) {
          const w = ((value >> (j * 2)) & 3) + 1;
          bars.push({ x, width: w * barW });
          x += w * barW + spaceW;
        }
      }
      
      // Stop pattern
      bars.push({ x, width: barW * 3 });
      
      return bars;
    };

    const barcodeBars = generateBarcodeBars(trackingNumber);

    return (
      <div
        ref={ref}
        className="bg-white relative"
        style={{
          width: '6in',
          height: '4in',
          padding: '0.125in',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
        >
          {/* Header with Carrier */}
          <div
            className="flex justify-between items-start mb-1"
            style={{ 
              borderBottom: `3px solid ${config.color}`, 
              paddingBottom: '6px' 
            }}
          >
            <div>
              <div
                className="font-bold"
                style={{
                  fontSize: '32px',
                  color: config.color,
                  letterSpacing: '2px',
                  fontWeight: '900',
                }}
              >
                {carrier === 'UPS' ? config.name : `${config.logoText} ${config.name}`}
              </div>
              <div style={{ fontSize: '11px', color: config.color, marginTop: '2px', fontWeight: 'bold' }}>
                {config.serviceName}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* La Pesqueria Logo */}
              <div style={{ width: '60px', height: '30px', position: 'relative' }}>
                <Image
                  src="/images/lapescerialogo.png"
                  alt="La Pesqueria Outfitters"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div className="text-right">
                <div style={{ fontSize: '9px', color: '#666', fontWeight: 'bold' }}>TRACKING #</div>
                <div
                  className="font-mono font-bold"
                  style={{
                    fontSize: '13px',
                    color: config.color,
                    letterSpacing: '1px',
                  }}
                >
                  {trackingNumber}
                </div>
              </div>
            </div>
          </div>

        {/* From Address */}
        <div className="mb-2">
          <div
            className="font-bold"
            style={{
              fontSize: '10px',
              color: '#666',
              marginBottom: '2px',
            }}
          >
            FROM:
          </div>
          <div style={{ fontSize: '13px', color: '#000', lineHeight: '1.3' }}>
            <div className="font-bold" style={{ fontSize: '14px' }}>La Pesqueria Outfitters</div>
            <div>4400 N 23rd St Suite 135</div>
            <div>McAllen, TX 78504</div>
          </div>
        </div>

        {/* To Address - Large and Clear */}
        <div
          className="mb-2"
          style={{
            border: `3px solid ${config.color}`,
            borderRadius: '3px',
            padding: '10px',
            backgroundColor: '#fff',
          }}
        >
          <div
            className="font-bold"
            style={{
              fontSize: '10px',
              color: config.color,
              marginBottom: '4px',
              textTransform: 'uppercase',
            }}
          >
            To:
          </div>
          <div style={{ fontSize: '16px', color: '#000', lineHeight: '1.35', fontWeight: 'bold' }}>
            <div style={{ fontSize: '18px' }}>{order.customerName}</div>
            <div>{order.shippingAddress}</div>
            {order.shippingAddress2 && <div>{order.shippingAddress2}</div>}
            <div>
              {order.shippingCity}, {order.shippingState} {order.shippingZip}
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>{order.shippingCountry}</div>
          </div>
          {order.customerPhone && (
            <div style={{ fontSize: '11px', color: '#666', marginTop: '6px' }}>
              Phone: {order.customerPhone}
            </div>
          )}
        </div>

        {/* Bottom Section: Barcode and Info */}
        <div className="flex justify-between items-end">
          {/* Scannable Barcode */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                backgroundColor: '#fff',
                border: `2px solid ${config.color}`,
                borderRadius: '4px',
                padding: '8px',
              }}
            >
              {/* Barcode Visual */}
              <div style={{ position: 'relative', height: barHeight }}>
                {barcodeBars.map((bar, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: bar.x,
                      top: 0,
                      width: bar.width,
                      height: barHeight,
                      backgroundColor: config.barColor,
                    }}
                  />
                ))}
              </div>
              
              {/* Human readable tracking below barcode */}
              <div
                className="font-mono text-center"
                style={{
                  fontSize: '11px',
                  color: config.color,
                  letterSpacing: '2px',
                  marginTop: '4px',
                  fontWeight: 'bold',
                }}
              >
                {trackingNumber}
              </div>
              
              {/* Service Type Barcode for USPS */}
              {carrier === 'USPS' && (
                <div style={{ fontSize: '8px', color: '#666', textAlign: 'center', marginTop: '2px' }}>
                  USPS DELIVERY CONFIRMATION
                </div>
              )}
            </div>
          </div>

          {/* Service and Weight Info */}
          <div className="text-right ml-4" style={{ fontSize: '11px', color: '#666', minWidth: '100px' }}>
            {weight && <div style={{ fontWeight: 'bold' }}>WT: {weight} LB</div>}
            <div>{date || new Date().toLocaleDateString()}</div>
            <div style={{ fontWeight: 'bold', color: config.color, fontSize: '14px' }}>
              {order.shippingZip}
            </div>
            {carrier === 'USPS' && (
              <div style={{ fontSize: '9px', marginTop: '2px' }}>
                <div>PS FORM 3877</div>
              </div>
            )}
          </div>
        </div>

        {/* Order Number */}
        <div
          className="text-center"
          style={{
            fontSize: '10px',
            color: '#666',
            borderTop: `1px solid ${config.color}`,
            paddingTop: '4px',
            marginTop: '4px',
          }}
        >
          Order #: {order.orderNumber} | {carrier} {config.serviceName}
        </div>

        {/* Carrier-specific footer */}
        <div
          className="text-center"
          style={{
            position: 'absolute',
            bottom: '4px',
            left: '0.125in',
            right: '0.125in',
            fontSize: '8px',
            color: '#999',
          }}
        >
          {carrier === 'USPS' && 'United States Postal Service - Domestic Mail Manual Compliant'}
          {carrier === 'UPS' && 'UPS - United Parcel Service - Brown'}
          {carrier === 'FedEx' && 'FedEx Corporation - Federal Express'}
        </div>
      </div>
    );
  }
);

ShippingLabel.displayName = 'ShippingLabel';

/**
 * USPS 4x6 Label - Pre-configured
 */
export const USPSLabel = React.forwardRef<HTMLDivElement, Omit<ShippingLabelProps, 'carrier'>>(
  (props, ref) => <ShippingLabel ref={ref} {...props} carrier="USPS" />,
);
USPSLabel.displayName = 'USPSLabel';

/**
 * UPS 4x6 Label - Pre-configured
 */
export const UPSLabel = React.forwardRef<HTMLDivElement, Omit<ShippingLabelProps, 'carrier'>>(
  (props, ref) => <ShippingLabel ref={ref} {...props} carrier="UPS" />,
);
UPSLabel.displayName = 'UPSLabel';

/**
 * FedEx 4x6 Label - Pre-configured
 */
export const FedExLabel = React.forwardRef<HTMLDivElement, Omit<ShippingLabelProps, 'carrier'>>(
  (props, ref) => <ShippingLabel ref={ref} {...props} carrier="FedEx" />,
);
FedExLabel.displayName = 'FedExLabel';
