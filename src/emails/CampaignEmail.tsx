import {
  Text,
  Section,
  Heading,
} from '@react-email/components';
import * as React from 'react';
import OceanEmailLayout from './components/OceanEmailLayout';

interface CampaignEmailProps {
  content: string;
  preheader?: string;
  recipientName?: string;
}

export default function CampaignEmail({
  content,
  preheader,
  recipientName,
}: CampaignEmailProps) {
  return (
    <OceanEmailLayout preview={preheader || 'News from La Pesqueria Outfitters'}>
      {recipientName && (
        <Section style={greetingSection}>
          <Heading style={greeting}>Hey {recipientName}!</Heading>
        </Section>
      )}

      <Section style={contentSection}>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </Section>

      <Section style={footerNote}>
        <Text style={footerText}>
          You&apos;re receiving this because you subscribed to La Pesqueria Outfitters.
        </Text>
      </Section>
    </OceanEmailLayout>
  );
}

const greetingSection = {
  marginBottom: '16px',
};

const greeting = {
  color: '#0f172a',
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '0',
};

const contentSection = {
  marginBottom: '32px',
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#334155',
};

const footerNote = {
  marginTop: '24px',
  paddingTop: '16px',
  borderTop: '1px solid #e2e8f0',
};

const footerText = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: '0',
  textAlign: 'center' as const,
};
