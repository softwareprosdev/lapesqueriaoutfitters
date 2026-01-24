import {
  Text,
  Section,
  Row,
  Column,
  Heading,
} from '@react-email/components';
import * as React from 'react';
import OceanEmailLayout from './components/OceanEmailLayout';

interface OrderItem {
  name: string;
  variantName?: string | null;
  quantity: number;
  price: number;
}

interface OrderConfirmationEmailProps {
  orderId: string;
  orderNumber?: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  conservationAmount: number;
  rewardsPoints: number;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export default function OrderConfirmationEmail({
  orderId,
  orderNumber,
  items,
  subtotal,
  shipping,
  tax,
  total,
  conservationAmount,
  rewardsPoints,
  shippingAddress,
}: OrderConfirmationEmailProps) {
  const displayOrderNumber = orderNumber || `#${orderId.slice(0, 8).toUpperCase()}`;

  return (
    <OceanEmailLayout preview={`Order ${displayOrderNumber} confirmed - Thank you for your purchase!`}>
      {/* Success message */}
      <Section style={heroSection}>
        <div style={checkmark}>✓</div>
        <Heading style={h1}>Thank You for Your Order!</Heading>
        <Text style={heroText}>
          Your order has been received and is being processed.
        </Text>
      </Section>

      {/* Order details */}
      <Section style={orderDetailsSection}>
        <Row>
          <Column>
            <Text style={label}>Order Number</Text>
            <Text style={value}>{displayOrderNumber}</Text>
          </Column>
          <Column>
            <Text style={label}>Order Date</Text>
            <Text style={value}>{new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</Text>
          </Column>
        </Row>
      </Section>

      {/* Order items */}
      <Section style={section}>
        <Heading style={h2}>Order Items</Heading>
        {items.map((item, index) => (
          <div key={index} style={itemRow}>
            <Row>
              <Column style={{ width: '70%' }}>
                <Text style={itemName}>{item.name}</Text>
                {item.variantName && (
                  <Text style={itemVariant}>{item.variantName}</Text>
                )}
                <Text style={itemQuantity}>Quantity: {item.quantity}</Text>
              </Column>
              <Column style={{ width: '30%', textAlign: 'right' }}>
                <Text style={itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
              </Column>
            </Row>
          </div>
        ))}
      </Section>

      {/* Order summary */}
      <Section style={summarySection}>
        <Row style={summaryRow}>
          <Column style={{ width: '70%' }}>
            <Text style={summaryLabel}>Subtotal</Text>
          </Column>
          <Column style={{ width: '30%', textAlign: 'right' }}>
            <Text style={summaryValue}>${subtotal.toFixed(2)}</Text>
          </Column>
        </Row>
        <Row style={summaryRow}>
          <Column style={{ width: '70%' }}>
            <Text style={summaryLabel}>Shipping</Text>
          </Column>
          <Column style={{ width: '30%', textAlign: 'right' }}>
            <Text style={summaryValue}>
              {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
            </Text>
          </Column>
        </Row>
        <Row style={summaryRow}>
          <Column style={{ width: '70%' }}>
            <Text style={summaryLabel}>Tax</Text>
          </Column>
          <Column style={{ width: '30%', textAlign: 'right' }}>
            <Text style={summaryValue}>${tax.toFixed(2)}</Text>
          </Column>
        </Row>
        <div style={divider} />
        <Row style={summaryRow}>
          <Column style={{ width: '70%' }}>
            <Text style={totalLabel}>Total</Text>
          </Column>
          <Column style={{ width: '30%', textAlign: 'right' }}>
            <Text style={totalValue}>${total.toFixed(2)}</Text>
          </Column>
        </Row>
      </Section>

      {/* Shipping address */}
      <Section style={section}>
        <Heading style={h2}>Shipping Address</Heading>
        <Text style={addressText}>
          {shippingAddress.name}<br />
          {shippingAddress.line1}<br />
          {shippingAddress.line2 && <>{shippingAddress.line2}<br /></>}
          {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}<br />
          {shippingAddress.country}
        </Text>
      </Section>

      {/* Impact boxes */}
      <Section style={impactSection}>
        <div style={impactBox}>
          <Text style={impactEmoji}>🐟</Text>
          <Text style={impactAmount}>${conservationAmount.toFixed(2)}</Text>
          <Text style={impactLabel}>Conservation Donation</Text>
          <Text style={impactText}>
            Your purchase is helping protect local marine life and habitats!
          </Text>
        </div>
      </Section>

      <Section style={impactSection}>
        <div style={rewardsBox}>
          <Text style={impactEmoji}>🏆</Text>
          <Text style={impactAmount}>{rewardsPoints} Points</Text>
          <Text style={impactLabel}>Rewards Earned</Text>
          <Text style={impactText}>
            Check your account to see your new tier and benefits!
          </Text>
        </div>
      </Section>

      {/* Next steps */}
      <Section style={section}>
        <Heading style={h2}>What's Next?</Heading>
        <Text style={bodyText}>
          1. We're preparing your order with care<br />
          2. You'll receive a shipping confirmation when your order ships<br />
          3. Track your order status in your account dashboard
        </Text>
      </Section>

      {/* Thank you */}
      <Section style={section}>
        <Text style={thankYouText}>
          Thank you for supporting local marine conservation! Every purchase
          helps protect marine ecosystems in South Padre Island and the Rio Grande Valley.
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

const checkmark = {
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

const orderDetailsSection = {
  backgroundColor: '#f1f5f9',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
};

const label = {
  color: '#64748b',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px',
};

const value = {
  color: '#0f172a',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
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
  borderBottom: '1px solid #e2e8f0',
  paddingBottom: '16px',
  marginBottom: '16px',
};

const itemName = {
  color: '#0f172a',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const itemVariant = {
  color: '#64748b',
  fontSize: '14px',
  margin: '0 0 4px',
};

const itemQuantity = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: '0',
};

const itemPrice = {
  color: '#0f172a',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
};

const summarySection = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
};

const summaryRow = {
  marginBottom: '8px',
};

const summaryLabel = {
  color: '#64748b',
  fontSize: '14px',
  margin: '0',
};

const summaryValue = {
  color: '#0f172a',
  fontSize: '14px',
  margin: '0',
};

const divider = {
  borderTop: '2px solid #e2e8f0',
  margin: '12px 0',
};

const totalLabel = {
  color: '#0f172a',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0',
};

const totalValue = {
  color: '#0891b2',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0',
};

const addressText = {
  color: '#475569',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
};

const impactSection = {
  marginBottom: '16px',
};

const impactBox = {
  backgroundColor: '#ecfeff',
  border: '2px solid #06b6d4',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
};

const rewardsBox = {
  backgroundColor: '#eff6ff',
  border: '2px solid #3b82f6',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
};

const impactEmoji = {
  fontSize: '48px',
  lineHeight: '1',
  margin: '0 0 8px',
};

const impactAmount = {
  color: '#0891b2',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 4px',
  lineHeight: '1',
};

const impactLabel = {
  color: '#0e7490',
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 8px',
};

const impactText = {
  color: '#0e7490',
  fontSize: '13px',
  margin: '0',
  lineHeight: '1.4',
};

const bodyText = {
  color: '#475569',
  fontSize: '14px',
  lineHeight: '1.8',
  margin: '0',
};

const thankYouText = {
  color: '#0e7490',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
  textAlign: 'center' as const,
  fontStyle: 'italic',
};
