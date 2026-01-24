import Stripe from 'stripe';

// Lazy initialize Stripe to avoid build-time errors when env var is missing
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    _stripe = new Stripe(apiKey, {
      apiVersion: '2025-12-15.clover',
    });
  }
  return _stripe;
}

// Shipping rate configurations
export interface ShippingRate {
  id: string;
  name: string;
  description: string;
  amount: number; // in cents
  currency: string;
  estimatedDays: number;
  durationTerms: string;
  type: 'standard' | 'express' | 'free';
}

// Static shipping rates (can be managed via Stripe Dashboard for dynamic rates)
export const SHIPPING_RATES: ShippingRate[] = [
  {
    id: 'shr_standard',
    name: 'Standard Shipping',
    description: 'Delivered in 5-7 business days',
    amount: 595, // $5.95
    currency: 'usd',
    estimatedDays: 5,
    durationTerms: '5-7 business days',
    type: 'standard',
  },
  {
    id: 'shr_express',
    name: 'Express Shipping',
    description: 'Delivered in 2-3 business days',
    amount: 1295, // $12.95
    currency: 'usd',
    estimatedDays: 2,
    durationTerms: '2-3 business days',
    type: 'express',
  },
  {
    id: 'shr_free',
    name: 'Free Shipping',
    description: 'Free on orders $50+, delivered in 7-10 business days',
    amount: 0,
    currency: 'usd',
    estimatedDays: 7,
    durationTerms: '7-10 business days',
    type: 'free',
  },
];

// Get available shipping rates based on order subtotal
export function getAvailableShippingRates(subtotalCents: number): ShippingRate[] {
  const rates = [...SHIPPING_RATES];

  // Only show free shipping if order is $50+ (5000 cents)
  if (subtotalCents < 5000) {
    return rates.filter(rate => rate.type !== 'free');
  }

  return rates;
}

// Calculate shipping for checkout session
export function getShippingOptionsForStripe(subtotalCents: number): Stripe.Checkout.SessionCreateParams.ShippingOption[] {
  const availableRates = getAvailableShippingRates(subtotalCents);

  return availableRates.map(rate => ({
    shipping_rate_data: {
      type: 'fixed_amount' as const,
      fixed_amount: {
        amount: rate.amount,
        currency: rate.currency,
      },
      display_name: rate.name,
      delivery_estimate: {
        minimum: {
          unit: 'business_day' as const,
          value: rate.estimatedDays,
        },
        maximum: {
          unit: 'business_day' as const,
          value: rate.estimatedDays + 2,
        },
      },
    },
  }));
}

// Validate US address (basic validation)
export function validateUSAddress(address: {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!address.line1 || address.line1.trim().length < 3) {
    errors.push('Street address is required');
  }

  if (!address.city || address.city.trim().length < 2) {
    errors.push('City is required');
  }

  if (!address.state || address.state.trim().length !== 2) {
    errors.push('State must be a 2-letter code (e.g., TX, CA)');
  }

  // Basic US ZIP code validation
  const zipRegex = /^\d{5}(-\d{4})?$/;
  if (!address.postalCode || !zipRegex.test(address.postalCode.trim())) {
    errors.push('Valid ZIP code is required (e.g., 78597 or 78597-1234)');
  }

  if (address.country && address.country.toUpperCase() !== 'US' && address.country.toUpperCase() !== 'USA') {
    errors.push('Currently only shipping to US addresses');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Format shipping rate for API response
export function formatShippingRateForResponse(rate: ShippingRate) {
  return {
    id: rate.id,
    provider: "La Pesqueria Outfitters",
    servicelevel: {
      name: rate.name,
      token: rate.type,
    },
    amount: (rate.amount / 100).toFixed(2),
    currency: rate.currency.toUpperCase(),
    estimated_days: rate.estimatedDays,
    duration_terms: rate.durationTerms,
    attributes: rate.type === 'free' ? ['FREE'] : rate.type === 'express' ? ['FASTEST'] : ['CHEAPEST'],
  };
}
