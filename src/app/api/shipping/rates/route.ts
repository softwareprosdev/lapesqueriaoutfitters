import { NextRequest, NextResponse } from 'next/server';
import {
  getAvailableShippingRates,
  formatShippingRateForResponse,
  validateUSAddress
} from '@/lib/shipping';

export async function POST(request: NextRequest) {
  try {
    const { address, items, subtotal } = await request.json();

    // Validate address
    if (!address || !address.line1 || !address.city || !address.state || !address.postalCode) {
      return NextResponse.json({ error: 'Incomplete address' }, { status: 400 });
    }

    // Validate US address format
    const validation = validateUSAddress(address);
    if (!validation.valid) {
      return NextResponse.json({
        error: 'Invalid address',
        details: validation.errors
      }, { status: 400 });
    }

    // Calculate subtotal in cents
    const subtotalCents = subtotal
      ? Math.round(parseFloat(subtotal) * 100)
      : items?.reduce((sum: number, item: { price: number; quantity: number }) =>
          sum + (item.price * item.quantity * 100), 0) || 0;

    // Get available shipping rates based on order subtotal
    const availableRates = getAvailableShippingRates(subtotalCents);

    // Format rates for response
    const rates = availableRates.map(formatShippingRateForResponse);

    return NextResponse.json({ rates });

  } catch (error) {
    console.error('Shipping Rate Error:', error);

    // Return standard rates on error
    const fallbackRates = getAvailableShippingRates(0);
    return NextResponse.json({
      rates: fallbackRates.map(formatShippingRateForResponse),
      error: 'Could not calculate custom rates, showing standard options'
    });
  }
}
