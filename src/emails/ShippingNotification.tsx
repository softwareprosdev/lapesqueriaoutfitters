import {
  Text,
  Section,
  Heading,
  Button,
} from '@react-email/components';
import * as React from 'react';
import OceanEmailLayout from './components/OceanEmailLayout';

interface ShippingNotificationEmailProps {
  orderNumber: string;
  customerName: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery?: string;
  items: Array<{
    name: string;
    variantName?: string | null;
    quantity: number;
  }>;
}

export default function ShippingNotificationEmail({
  orderNumber,
  customerName,
  trackingNumber,
  carrier,
  estimatedDelivery,
  items,
}: ShippingNotificationEmailProps) {
  // Generate tracking URL based on carrier
  const getTrackingUrl = () => {
    const trackingUrls: Record<string, string> = {
      'USPS': `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
      'UPS': `https://www.ups.com/track?tracknum=${trackingNumber}`,
      'FedEx': `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    };
    return trackingUrls[carrier] || `https://www.google.com/search?q=${trackingNumber}`;
  };

  return (
    <OceanEmailLayout preview={`Your order ${orderNumber} has shipped!`}>
      {/* Hero section */}
      <Section style={heroSection}>
        <div style={shippingIcon}>📦</div>
        <Heading style={h1}>Your Order is On Its Way!</Heading>
        <Text style={heroText}>
          Hi {customerName}, your fishing gear order has been shipped and is heading your way!
        </Text>
      </Section>

      {/* Tracking info */}
      <Section style={trackingSection}>
        <Text style={trackingLabel}>Tracking Number</Text>
        <Text style={trackingNumberStyle}>{trackingNumber}</Text>
        <Text style={trackingCarrier}>Carrier: {carrier}</Text>
        {estimatedDelivery && (
          <Text style={estimatedText}>
            Estimated Delivery: {estimatedDelivery}
          </Text>
        )}

        <div style={buttonContainer}>
          <Button style={button} href={getTrackingUrl()}>
            Track Your Package
          </Button>
        </div>
      </Section>

      {/* Order items */}
      <Section style={section}>
        <Heading style={h2}>Items in This Shipment</Heading>
        {items.map((item, index) => (
          <div key={index} style={itemRow}>
            <Text style={itemName}>
              {item.name}
              {item.variantName && ` - ${item.variantName}`}
            </Text>
            <Text style={itemQuantity}>Quantity: {item.quantity}</Text>
          </div>
        ))}
      </Section>

      {/* Care instructions */}
      <Section style={careSection}>
        <Heading style={h2}>🎣 Caring for Your Fishing Apparel</Heading>
        <Text style={bodyText}>
          To keep your fishing apparel looking great:
        </Text>
        <Text style={bodyText}>
          • Machine wash cold with like colors<br />
          • Tumble dry low or hang dry<br />
          • Do not use fabric softener on performance shirts<br />
          • Rinse salt-resistant hats with fresh water after saltwater use
        </Text>
      </Section>

      {/* Thank you */}
      <Section style={section}>
        <Text style={thankYouText}>
          Thank you for your order! We hope you love your new fishing gear.
          Remember, 10% of your purchase supports local marine conservation! 🎣
        </Text>
      </Section>
    </OceanEmailLayout>
  );
}

// Styles
const heroSection = {
  textAlign: 'center' as const,
  padding: '32px 0',
};

const shippingIcon: React.CSSProperties = {
  fontSize: '64px',
  lineHeight: '1',
  margin: '0 0 16px',
};

const h1 = {
  color: '#0f172a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 12px',
  lineHeight: '1.3',
};

const heroText = {
  color: '#475569',
  fontSize: '16px',
  margin: '0',
  lineHeight: '1.5',
};

const trackingSection = {
  backgroundColor: '#f1f5f9',
  borderRadius: '8px',
  padding: '24px',
  marginBottom: '32px',
  textAlign: 'center' as const,
};

const trackingLabel = {
  color: '#64748b',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 8px',
};

const trackingNumberStyle: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '24px',
  fontWeight: 'bold',
  fontFamily: 'monospace',
  margin: '0 0 8px',
  letterSpacing: '1px',
};

const trackingCarrier = {
  color: '#64748b',
  fontSize: '14px',
  margin: '0 0 4px',
};

const estimatedText = {
  color: '#0891b2',
  fontSize: '14px',
  fontWeight: '600',
  margin: '12px 0 0',
};

const buttonContainer: React.CSSProperties = {
  marginTop: '20px',
};

const button = {
  backgroundColor: '#0891b2',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  cursor: 'pointer',
};

const section = {
  marginBottom: '32px',
};

const h2 = {
  color: '#0f172a',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const itemRow = {
  borderLeft: '3px solid #0891b2',
  paddingLeft: '16px',
  marginBottom: '12px',
};

const itemName = {
  color: '#0f172a',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const itemQuantity = {
  color: '#64748b',
  fontSize: '14px',
  margin: '0',
};

const careSection = {
  backgroundColor: '#ecfeff',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '32px',
};

const bodyText = {
  color: '#0e7490',
  fontSize: '14px',
  lineHeight: '1.8',
  margin: '0 0 12px',
};

const thankYouText = {
  color: '#0e7490',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
  textAlign: 'center' as const,
  fontStyle: 'italic',
};
