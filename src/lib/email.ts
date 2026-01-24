import { Resend } from 'resend';

// Resend API key must be set in environment variables
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Initialize Resend client - will be null if no API key is configured
export const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export const EMAIL_CONFIG = {
  from: process.env.FROM_EMAIL || "La Pesqueria <orders@lapesqueria.com>",
  replyTo: process.env.REPLY_TO_EMAIL || 'support@lapesqueria.com',
} as const;

interface SendEmailParams {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  replyTo?: string;
}

export async function sendEmail({ to, subject, react, replyTo }: SendEmailParams) {
  // Skip email sending if no valid API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.warn('Email not sent - RESEND_API_KEY not configured');
    return null;
  }

  try {
    if (!resend) {
      throw new Error('Email service not configured');
    }
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: Array.isArray(to) ? to : [to],
      subject,
      react,
      replyTo: replyTo || EMAIL_CONFIG.replyTo,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Email sent successfully:', data?.id);
    return data;
  } catch (error: unknown) {
    console.error('Email sending failed:', error);
    throw error;
  }
}
