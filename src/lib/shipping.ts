

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


export function getShippingOptionsForClover(subtotalCents: number) {
  const availableRates = getAvailableShippingRates(subtotalCents);

  return availableRates.map(rate => ({
    id: rate.id,
    name: rate.name,
    description: rate.description,
    amount: rate.amount,
    currency: rate.currency,
    estimatedDays: rate.estimatedDays,
    durationTerms: rate.durationTerms,
    type: rate.type,
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
