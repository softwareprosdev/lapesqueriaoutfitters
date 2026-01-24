import Stripe from 'stripe';

// Stripe is optional - will be null if keys are not provided
// This allows the build to succeed even without Stripe configured
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  : null;

export const STRIPE_CONFIG = {
  currency: 'usd',
  paymentMethodTypes: ['card'] as const,
  mode: 'payment' as const,
} as const;

export const isStripeEnabled = () => {
  return stripe !== null && !!process.env.STRIPE_SECRET_KEY;
};

// Helper function to get stripe instance (throws only at runtime, not build time)
export const getStripe = () => {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }
  return stripe;
};
