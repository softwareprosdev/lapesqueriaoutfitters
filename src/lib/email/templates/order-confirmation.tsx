import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Link,
  Img,
} from '@react-email/components';

interface OrderConfirmationEmailProps {
  customerName: string;
  orderNumber: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    variant?: string;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  conservationDonation?: {
    amount: number;
    percentage: number;
  };
  shippingAddress: string;
}

export const OrderConfirmationEmail = ({
  customerName,
  orderNumber,
  orderDate,
  items,
  subtotal,
  shipping,
  tax,
  total,
  conservationDonation,
  shippingAddress,
}: OrderConfirmationEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Img
            src="https://lapesqueria.com/images/lapescerialogo.png"
            width="150"
            height="150"
            alt="La Pesqueria Outfitters"
            style={logo}
          />
          <Heading style={h1}>Order Confirmation</Heading>
        </Section>

        {/* Greeting */}
        <Text style={text}>Hi {customerName},</Text>
        <Text style={text}>
          Thank you for your order! We&apos;ve received your order and are preparing it for shipment.
        </Text>

        {/* Order Details */}
        <Section style={orderDetailsSection}>
          <Heading style={h2}>Order Details</Heading>
          <Text style={orderInfo}>
            Order Number: <strong>{orderNumber}</strong>
          </Text>
          <Text style={orderInfo}>
            Order Date: <strong>{orderDate}</strong>
          </Text>
        </Section>

        <Hr style={hr} />

        {/* Items */}
        <Section>
          <Heading style={h2}>Order Items</Heading>
          {items.map((item, index) => (
            <div key={index} style={itemRow}>
              <Text style={itemName}>
                {item.name}
                {item.variant && <span style={variantText}> ({item.variant})</span>}
              </Text>
              <Text style={itemDetails}>
                Qty: {item.quantity} × ${item.price.toFixed(2)} = $
                {(item.quantity * item.price).toFixed(2)}
              </Text>
            </div>
          ))}
        </Section>

        <Hr style={hr} />

        {/* Totals */}
        <Section style={totalsSection}>
          <div style={totalRow}>
            <Text style={totalLabel}>Subtotal:</Text>
            <Text style={totalValue}>${subtotal.toFixed(2)}</Text>
          </div>
          <div style={totalRow}>
            <Text style={totalLabel}>Shipping:</Text>
            <Text style={totalValue}>${shipping.toFixed(2)}</Text>
          </div>
          <div style={totalRow}>
            <Text style={totalLabel}>Tax:</Text>
            <Text style={totalValue}>${tax.toFixed(2)}</Text>
          </div>
          {conservationDonation && (
            <div style={{ ...totalRow, backgroundColor: '#e0f2fe', padding: '8px' }}>
              <Text style={{ ...totalLabel, color: '#0369a1' }}>
                Donation ({conservationDonation.percentage}%):
              </Text>
              <Text style={{ ...totalValue, color: '#0369a1' }}>
                ${conservationDonation.amount.toFixed(2)}
              </Text>
            </div>
          )}
          <div style={{ ...totalRow, borderTop: '2px solid #000', paddingTop: '8px' }}>
            <Text style={{ ...totalLabel, fontSize: '18px', fontWeight: 'bold' }}>Total:</Text>
            <Text style={{ ...totalValue, fontSize: '18px', fontWeight: 'bold' }}>
              ${total.toFixed(2)}
            </Text>
          </div>
        </Section>

        <Hr style={hr} />

        {/* Shipping Address */}
        <Section>
          <Heading style={h2}>Shipping Address</Heading>
          <Text style={text}>{shippingAddress}</Text>
        </Section>

        <Hr style={hr} />

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            Questions about your order? Reply to this email or contact us at{' '}
            <Link href="mailto:support@lapesqueria.com">support@lapesqueria.com</Link>
          </Text>
          <Text style={footerText}>
            Track your order: <Link href="https://lapesqueria.com/account">View Order Status</Link>
          </Text>
          <Text style={copyright}>
            © {new Date().getFullYear()} La Pesqueria Outfitters. Premium Fishing Apparel & Gear.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  padding: '32px 20px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#001F3F',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '16px 0',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#001F3F',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '24px 0 12px',
};

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '12px 20px',
};

const orderInfo = {
  color: '#4b5563',
  fontSize: '14px',
  margin: '4px 20px',
};

const orderDetailsSection = {
  margin: '20px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
};

const itemRow = {
  margin: '12px 20px',
  padding: '12px',
  backgroundColor: '#f9fafb',
  borderRadius: '4px',
};

const itemName = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 4px 0',
};

const variantText = {
  fontSize: '14px',
  color: '#6b7280',
  fontWeight: 'normal',
};

const itemDetails = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '4px 0 0 0',
};

const totalsSection = {
  margin: '20px',
};

const totalRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
};

const totalLabel = {
  fontSize: '16px',
  color: '#4b5563',
  margin: 0,
};

const totalValue = {
  fontSize: '16px',
  color: '#1f2937',
  fontWeight: '600',
  margin: 0,
};

const footer = {
  margin: '20px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '8px 0',
};

const copyright = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '16px 0 0 0',
};

export default OrderConfirmationEmail;
