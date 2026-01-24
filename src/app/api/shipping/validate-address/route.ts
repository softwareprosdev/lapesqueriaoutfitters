import { NextRequest, NextResponse } from 'next/server';
import { validateUSAddress } from '@/lib/shipping';

export interface AddressValidationResult {
  isValid: boolean;
  validatedAddress?: {
    name?: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  messages: Array<{
    source: string;
    code: string;
    type: 'error' | 'warning' | 'info';
    text: string;
  }>;
}

// US State codes for validation
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC', 'PR', 'VI', 'GU', 'AS', 'MP'
];

// Basic ZIP code validation regex
const ZIP_REGEX = /^\d{5}(-\d{4})?$/;

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    // Normalize and clean input
    const street1 = address?.street1?.trim() || address?.line1?.trim() || '';
    const street2 = address?.street2?.trim() || address?.line2?.trim() || '';
    const city = address?.city?.trim() || '';
    const state = (address?.state?.trim() || '').toUpperCase();
    const zip = address?.zip?.trim() || address?.postalCode?.trim() || '';
    const country = (address?.country?.trim() || 'US').toUpperCase();
    const name = address?.name?.trim() || '';

    // Basic validation
    if (!street1 || !city || !state || !zip) {
      return NextResponse.json({
        isValid: false,
        messages: [{
          source: 'validation',
          code: 'INCOMPLETE_ADDRESS',
          type: 'error',
          text: 'Please provide a complete address (street, city, state, zip)'
        }]
      } as AddressValidationResult, { status: 400 });
    }

    // Validate ZIP format for US addresses
    if (country === 'US' && !ZIP_REGEX.test(zip)) {
      return NextResponse.json({
        isValid: false,
        messages: [{
          source: 'validation',
          code: 'INVALID_ZIP',
          type: 'error',
          text: 'Please enter a valid US ZIP code (e.g., 12345 or 12345-6789)'
        }]
      } as AddressValidationResult, { status: 400 });
    }

    // Validate state code for US addresses
    if (country === 'US' && !US_STATES.includes(state)) {
      return NextResponse.json({
        isValid: false,
        messages: [{
          source: 'validation',
          code: 'INVALID_STATE',
          type: 'error',
          text: 'Please enter a valid 2-letter US state code (e.g., TX, CA, NY)'
        }]
      } as AddressValidationResult, { status: 400 });
    }

    // Use the shipping utility for validation
    const validation = validateUSAddress({
      line1: street1,
      line2: street2,
      city,
      state,
      postalCode: zip,
      country,
    });

    if (!validation.valid) {
      return NextResponse.json({
        isValid: false,
        messages: validation.errors.map(error => ({
          source: 'validation',
          code: 'VALIDATION_ERROR',
          type: 'error' as const,
          text: error
        }))
      } as AddressValidationResult, { status: 400 });
    }

    // Address is valid
    return NextResponse.json({
      isValid: true,
      validatedAddress: {
        name: name || undefined,
        street1,
        street2: street2 || undefined,
        city,
        state,
        zip,
        country,
      },
      messages: [{
        source: 'system',
        code: 'VALIDATION_SUCCESS',
        type: 'info',
        text: 'Address validated successfully'
      }]
    } as AddressValidationResult);

  } catch (error: unknown) {
    console.error('Address Validation Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to validate address';

    return NextResponse.json({
      isValid: false,
      messages: [{
        source: 'system',
        code: 'VALIDATION_ERROR',
        type: 'error',
        text: message
      }]
    } as AddressValidationResult, { status: 500 });
  }
}
