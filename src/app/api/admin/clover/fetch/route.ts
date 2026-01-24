import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface CloverConfig {
  apiToken: string;
  merchantId: string;
}

async function fetchCloverData(endpoint: string, config: CloverConfig) {
  const baseUrl = 'https://api.clover.com/v3/merchants';
  const url = `${baseUrl}/${config.merchantId}/${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Clover API error: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { apiToken, merchantId }: CloverConfig = await request.json();

    if (!apiToken || !merchantId) {
      return NextResponse.json(
        { error: 'API Token and Merchant ID are required' },
        { status: 400 }
      );
    }

    // Fetch data from multiple Clover endpoints
    const [
      itemsResponse,
      categoriesResponse,
      customersResponse,
      ordersResponse,
      paymentsResponse,
      modifiersResponse,
      taxRatesResponse,
    ] = await Promise.allSettled([
      fetchCloverData('items', { apiToken, merchantId }),
      fetchCloverData('categories', { apiToken, merchantId }),
      fetchCloverData('customers', { apiToken, merchantId }),
      fetchCloverData('orders', { apiToken, merchantId }),
      fetchCloverData('payments', { apiToken, merchantId }),
      fetchCloverData('modifier_groups', { apiToken, merchantId }),
      fetchCloverData('tax_rates', { apiToken, merchantId }),
    ]);

    const syncData = {
      items: itemsResponse.status === 'fulfilled' ? itemsResponse.value.elements || [] : [],
      categories: categoriesResponse.status === 'fulfilled' ? categoriesResponse.value.elements || [] : [],
      customers: customersResponse.status === 'fulfilled' ? customersResponse.value.elements || [] : [],
      orders: ordersResponse.status === 'fulfilled' ? ordersResponse.value.elements || [] : [],
      payments: paymentsResponse.status === 'fulfilled' ? paymentsResponse.value.elements || [] : [],
      modifiers: modifiersResponse.status === 'fulfilled' ? modifiersResponse.value.elements || [] : [],
      taxRates: taxRatesResponse.status === 'fulfilled' ? taxRatesResponse.value.elements || [] : [],
    };

    // Check for any failures and log them
    const failures = [
      { name: 'Items', result: itemsResponse },
      { name: 'Categories', result: categoriesResponse },
      { name: 'Customers', result: customersResponse },
      { name: 'Orders', result: ordersResponse },
      { name: 'Payments', result: paymentsResponse },
      { name: 'Modifiers', result: modifiersResponse },
      { name: 'Tax Rates', result: taxRatesResponse },
    ].filter(item => item.result.status === 'rejected');

    if (failures.length > 0) {
      console.warn('Some Clover API calls failed:', failures.map(f => ({
        endpoint: f.name,
        error: f.result.status === 'rejected' ? f.result.reason : 'Unknown'
      })));
    }

    return NextResponse.json(syncData);
  } catch (error: unknown) {
    console.error('Error fetching Clover data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch Clover data' },
      { status: 500 }
    );
  }
}