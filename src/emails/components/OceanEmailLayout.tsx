import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Link,
} from '@react-email/components';
import * as React from 'react';

interface OceanEmailLayoutProps {
  children: React.ReactNode;
  preview?: string;
}

export default function OceanEmailLayout({ children, preview }: OceanEmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        {preview && <div style={previewText}>{preview}</div>}
        <Container style={container}>
          {/* Header with ocean wave theme */}
          <Section style={header}>
            <Text style={headerTitle}>🎣 La Pesqueria Outfitters</Text>
            <Text style={headerSubtitle}>
              Premium Fishing Apparel & Gear
            </Text>
          </Section>

          {/* Main content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Conservation message */}
          <Section style={conservationBox}>
            <Text style={conservationTitle}>🐟 Local Conservation</Text>
            <Text style={conservationText}>
              10% of every purchase supports marine conservation and habitat restoration
              in South Padre Island and the Rio Grande Valley.
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              <Link href="https://lapesqueria.com" style={link}>
                Visit Our Store
              </Link>
              {' · '}
              <Link href="https://lapesqueria.com/conservation" style={link}>
                Conservation Impact
              </Link>
              {' · '}
              <Link href="https://lapesqueria.com/contact" style={link}>
                Contact Us
              </Link>
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} La Pesqueria Outfitters. All rights reserved.
            </Text>
            <Text style={footerTextSmall}>
              McAllen, Texas · Rio Grande Valley
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f0f9ff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const previewText = {
  display: 'none',
  overflow: 'hidden',
  lineHeight: '1px',
  opacity: 0,
  maxHeight: 0,
  maxWidth: 0,
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  backgroundColor: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
  background: '#0891b2',
  padding: '32px 24px',
  textAlign: 'center' as const,
};

const headerTitle = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px',
  lineHeight: '1.2',
};

const headerSubtitle = {
  color: '#e0f2fe',
  fontSize: '14px',
  margin: '0',
  fontWeight: '500',
};

const content = {
  padding: '24px',
};

const conservationBox = {
  backgroundColor: '#ecfeff',
  border: '2px solid #06b6d4',
  borderRadius: '8px',
  padding: '20px',
  margin: '0 24px 24px',
};

const conservationTitle = {
  color: '#0e7490',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px',
  textAlign: 'center' as const,
};

const conservationText = {
  color: '#0e7490',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
  textAlign: 'center' as const,
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '26px 0',
};

const footer = {
  textAlign: 'center' as const,
  padding: '0 24px',
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '8px 0',
};

const footerTextSmall = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '4px 0',
};

const link = {
  color: '#0891b2',
  textDecoration: 'none',
};
