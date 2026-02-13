import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface CloverConfig {
  apiToken: string;
  merchantId: string;
}

interface FetchOptions {
  limit?: number;
  offset?: number;
}

/**
 * Fetches data from a Clover API endpoint with proper expansions
 */
async function fetchCloverData(
  endpoint: string,
  config: CloverConfig,
  options: FetchOptions = {}
) {
  const baseUrl = 'https://api.clover.com/v3/merchants';

  // Build query parameters
  const params = new URLSearchParams();

  // Pagination
  if (options.limit) params.set('limit', options.limit.toString());
  if (options.offset) params.set('offset', options.offset.toString());

  // Add expansions based on endpoint type
  const expansions = getExpansionsForEndpoint(endpoint);
  if (expansions) {
    params.set('expand', expansions);
  }

  const queryString = params.toString();
  const url = `${baseUrl}/${config.merchantId}/${endpoint}${queryString ? `?${queryString}` : ''}`;

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

/**
 * Returns appropriate expand parameters for each endpoint type
 * to fetch all related data in a single request
 */
function getExpansionsForEndpoint(endpoint: string): string | null {
  switch (endpoint) {
    case 'items':
      // Expand to get categories, stock, tax rates, and modifier groups
      return 'categories,itemStock,taxRates,modifierGroups';

    case 'orders':
      // Expand to get line items, payments, customer, and employee info
      return 'lineItems,payments,customers,employee';

    case 'customers':
      // Expand to get email addresses, phone numbers, and addresses
      return 'emailAddresses,phoneNumbers,addresses';

    case 'modifier_groups':
      // Expand to get individual modifiers and associated items
      return 'modifiers,items';

    case 'payments':
      // Expand to get order and tender info
      return 'order,tender,cardTransaction';

    default:
      return null;
  }
}

/**
 * Fetches all pages of data for endpoints that may have pagination
 */
async function fetchAllPages(
  endpoint: string,
  config: CloverConfig,
  maxRecords: number = 1000
): Promise<any[]> {
  const pageSize = 100;
  let offset = 0;
  let allElements: any[] = [];
  let hasMore = true;

  while (hasMore && allElements.length < maxRecords) {
    const response = await fetchCloverData(endpoint, config, {
      limit: pageSize,
      offset,
    });

    const elements = response.elements || [];
    allElements = [...allElements, ...elements];

    // Check if there are more pages
    hasMore = elements.length === pageSize;
    offset += pageSize;
  }

  return allElements;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const apiToken = body.apiToken || process.env.CLOVER_ACCESS_TOKEN;
    const merchantId = body.merchantId || process.env.CLOVER_MERCHANT_ID;

    if (!apiToken || !merchantId) {
      return NextResponse.json(
        { error: 'API Token and Merchant ID are required. Configure CLOVER_ACCESS_TOKEN and CLOVER_MERCHANT_ID environment variables or provide them in the request.' },
        { status: 400 }
      );
    }

    // Fetch data from multiple Clover endpoints in parallel
    // Each fetch includes proper expand parameters for complete data
    const [
      itemsResult,
      categoriesResult,
      customersResult,
      ordersResult,
      paymentsResult,
      modifiersResult,
      taxRatesResult,
    ] = await Promise.allSettled([
      fetchAllPages('items', { apiToken, merchantId }),
      fetchCloverData('categories', { apiToken, merchantId }),
      fetchAllPages('customers', { apiToken, merchantId }),
      fetchAllPages('orders', { apiToken, merchantId }),
      fetchAllPages('payments', { apiToken, merchantId }),
      fetchCloverData('modifier_groups', { apiToken, merchantId }),
      fetchCloverData('tax_rates', { apiToken, merchantId }),
    ]);

    const syncData = {
      items: itemsResult.status === 'fulfilled' ? itemsResult.value : [],
      categories: categoriesResult.status === 'fulfilled'
        ? categoriesResult.value.elements || []
        : [],
      customers: customersResult.status === 'fulfilled' ? customersResult.value : [],
      orders: ordersResult.status === 'fulfilled' ? ordersResult.value : [],
      payments: paymentsResult.status === 'fulfilled' ? paymentsResult.value : [],
      modifiers: modifiersResult.status === 'fulfilled'
        ? modifiersResult.value.elements || []
        : [],
      taxRates: taxRatesResult.status === 'fulfilled'
        ? taxRatesResult.value.elements || []
        : [],
    };

    // Check for any failures and log them
    const results = [
      { name: 'Items', result: itemsResult },
      { name: 'Categories', result: categoriesResult },
      { name: 'Customers', result: customersResult },
      { name: 'Orders', result: ordersResult },
      { name: 'Payments', result: paymentsResult },
      { name: 'Modifiers', result: modifiersResult },
      { name: 'Tax Rates', result: taxRatesResult },
    ];

    const failures = results.filter(item => item.result.status === 'rejected');
    const warnings: string[] = [];

    if (failures.length > 0) {
      console.warn('Some Clover API calls failed:', failures.map(f => ({
        endpoint: f.name,
        error: f.result.status === 'rejected' ? (f.result.reason as Error).message : 'Unknown'
      })));

      failures.forEach(f => {
        if (f.result.status === 'rejected') {
          warnings.push(`${f.name}: ${(f.result.reason as Error).message}`);
        }
      });
    }

    // Count items for display
    const counts = {
      items: syncData.items.length,
      categories: syncData.categories.length,
      customers: syncData.customers.length,
      orders: syncData.orders.length,
      payments: syncData.payments.length,
      modifiers: syncData.modifiers.length,
      taxRates: syncData.taxRates.length,
    };

    return NextResponse.json({
      ...syncData,
      counts,
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  } catch (error: unknown) {
    console.error('Error fetching Clover data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch Clover data' },
      { status: 500 }
    );
  }
}
