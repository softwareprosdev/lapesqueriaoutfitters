import {
  Text,
  Section,
  Heading,
  Button,
} from '@react-email/components';
import * as React from 'react';
import OceanEmailLayout from './components/OceanEmailLayout';

interface StaffInviteEmailProps {
  inviterName: string;
  role: string;
  inviteUrl: string;
  expiresAt: string;
}

export default function StaffInviteEmail({
  inviterName,
  role,
  inviteUrl,
  expiresAt,
}: StaffInviteEmailProps) {
  return (
    <OceanEmailLayout preview={`You've been invited to join La Pesqueria Outfitters as ${role}`}>
      <Section style={heroSection}>
        <Heading style={h1}>You&apos;re Invited!</Heading>
        <Text style={heroText}>
          {inviterName} has invited you to join the La Pesqueria Outfitters team
          as a <strong>{role}</strong>.
        </Text>
      </Section>

      <Section style={detailsSection}>
        <Text style={detailLabel}>Role</Text>
        <Text style={detailValue}>{role}</Text>
        <Text style={detailLabel}>Invited by</Text>
        <Text style={detailValue}>{inviterName}</Text>
        <Text style={detailLabel}>Expires</Text>
        <Text style={detailValue}>{expiresAt}</Text>
      </Section>

      <Section style={ctaSection}>
        <Button href={inviteUrl} style={ctaButton}>
          Accept Invite
        </Button>
      </Section>

      <Section style={noteSection}>
        <Text style={noteText}>
          This invite link will expire on {expiresAt}. If you did not expect
          this invitation, you can safely ignore this email.
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

const detailsSection = {
  backgroundColor: '#f1f5f9',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
};

const detailLabel = {
  color: '#64748b',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '12px 0 4px',
};

const detailValue = {
  color: '#0f172a',
  fontSize: '16px',
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

const noteSection = {
  marginTop: '16px',
};

const noteText = {
  color: '#94a3b8',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '0',
  textAlign: 'center' as const,
};
