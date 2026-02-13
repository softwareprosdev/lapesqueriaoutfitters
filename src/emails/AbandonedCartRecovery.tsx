import {
  Text,
  Section,
  Row,
  Column,
  Heading,
  Button,
} from '@react-email/components';
import * as React from 'react';
import OceanEmailLayout from './components/OceanEmailLayout';

interface CartItem {
  productName: string;
  quantity: number;
  price: number;
}

interface AbandonedCartRecoveryEmailProps {
  customerName?: string;
  items: CartItem[];
  cartValue: number;
  checkoutUrl: string;
}

export default function AbandonedCartRecoveryEmail({
  customerName = 'there',
  items,
  cartValue,
  checkoutUrl,
}: AbandonedCartRecoveryEmailProps) {
  return (
    <OceanEmailLayout preview="You left some great gear behind! Complete your order today.">
      <Section style={heroSection}>
        <Heading style={h1}>You Left Some Gear Behind!</Heading>
        <Text style={heroText}>
          Hey {customerName}, we noticed you were checking out some great fishing gear.
          Your items are still waiting for you!
        </Text>
      </Section>

      {items && items.length > 0 && (
        <Section style={section}>
          <Heading style={h2}>Your Cart</Heading>
          {items.map((item, index) => (
            <div key={index} style={itemRow}>
              <Row>
                <Column style={{ width: '70%' }}>
                  <Text style={itemName}>{item.productName}</Text>
                  <Text style={itemQuantity}>Qty: {item.quantity}</Text>
                </Column>
                <Column style={{ width: '30%', textAlign: 'right' }}>
                  <Text style={itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                </Column>
              </Row>
            </div>
          ))}
          <div style={totalRow}>
            <Row>
              <Column style={{ width: '70%' }}>
                <Text style={totalLabel}>Cart Total</Text>
              </Column>
              <Column style={{ width: '30%', textAlign: 'right' }}>
                <Text style={totalValue}>${cartValue.toFixed(2)}</Text>
              </Column>
            </Row>
          </div>
        </Section>
      )}

      <Section style={ctaSection}>
        <Button href={checkoutUrl} style={ctaButton}>
          Complete Your Order
        </Button>
      </Section>

      <Section style={section}>
        <Text style={bodyText}>
          Remember, every purchase supports marine conservation in South Padre Island
          and the Rio Grande Valley. Don&apos;t miss out on making a difference!
        </Text>
      </Section>
    </OceanEmailLayout>
  );
}

const heroSection = {
  textAlign: 'center' as const,
  padding: '32px 0',
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
  paddingBottom: '12px',
  marginBottom: '12px',
};

const itemName = {
  color: '#0f172a',
  fontSize: '16px',
  fontWeight: '600',
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

const totalRow = {
  borderTop: '2px solid #e2e8f0',
  paddingTop: '12px',
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

const ctaSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const ctaButton = {
  backgroundColor: '#0891b2',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '16px 32px',
};

const bodyText = {
  color: '#475569',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
  textAlign: 'center' as const,
};
