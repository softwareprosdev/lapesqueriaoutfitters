/**
 * Clover POS API Client
 * 
 * Integration for pulling inventory, orders, and customer data from Clover POS
 * Documentation: https://docs.clover.com/docs
 */

interface CloverConfig {
  appId: string;
  appSecret: string;
  merchantId?: string;
  accessToken?: string;
  environment: 'sandbox' | 'production';
}

interface CloverOrder {
  id: string;
  total: number;
  state: string;
  createdTime: number;
  lineItems: CloverLineItem[];
  customer?: { id: string; firstName?: string; lastName?: string };
}

interface CloverLineItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variations?: { name: string; price: number }[];
}

interface CloverInventoryItem {
  id: string;
  name: string;
  price: number;
  stockCount?: number;
  categories?: { id: string; name: string }[];
  alternateName?: string;
}

interface CloverEmployee {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

class CloverClient {
  private config: CloverConfig;
  private baseUrl: string;

  constructor(config: CloverConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'production'
      ? 'https://api.clover.com'
      : 'https://sandbox.clover.com';
  }

  /**
   * Get headers for API requests
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.accessToken) {
      headers['Authorization'] = `Bearer ${this.config.accessToken}`;
    }

    return headers;
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code: string): Promise<{ accessToken: string; merchantId: string }> {
    const response = await fetch(`${this.baseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.appId,
        client_secret: this.config.appSecret,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      merchantId: data.merchant_id,
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.appId,
        client_secret: this.config.appSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  /**
   * Get merchant info
   */
  async getMerchant(): Promise<{
    id: string;
    name: string;
    currency: string;
    timezone: string;
  }> {
    const response = await fetch(`${this.baseUrl}/v3/merchant`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get merchant: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      name: data.name,
      currency: data.currency,
      timezone: data.timezone,
    };
  }

  /**
   * Get orders from Clover
   */
  async getOrders(params: {
    filter?: string;
    expand?: string;
    limit?: number;
  } = {}): Promise<CloverOrder[]> {
    const queryParams = new URLSearchParams();
    
    if (params.filter) queryParams.set('filter', params.filter);
    if (params.expand) queryParams.set('expand', params.expand);
    if (params.limit) queryParams.set('limit', params.limit.toString());

    const url = `${this.baseUrl}/v3/orders?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get orders: ${response.statusText}`);
    }

    const data = await response.json();
    return data.elements || [];
  }

  /**
   * Get single order
   */
  async getOrder(orderId: string): Promise<CloverOrder> {
    const response = await fetch(`${this.baseUrl}/v3/orders/${orderId}?expand=lineItems,customers`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get order: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get inventory items
   */
  async getInventoryItems(params: {
    filter?: string;
    expand?: string;
    limit?: number;
  } = {}): Promise<CloverInventoryItem[]> {
    const queryParams = new URLSearchParams();
    
    if (params.filter) queryParams.set('filter', params.filter);
    if (params.expand) queryParams.set('expand', params.expand);
    if (params.limit) queryParams.set('limit', params.limit.toString());

    const url = `${this.baseUrl}/v3/merchants/${this.config.merchantId}/inventory/items?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get inventory: ${response.statusText}`);
    }

    const data = await response.json();
    return data.elements || [];
  }

  /**
   * Update inventory stock
   */
  async updateStock(itemId: string, stockCount: number): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/v3/merchants/${this.config.merchantId}/inventory/items/${itemId}`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          stockCount,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update stock: ${response.statusText}`);
    }
  }

  /**
   * Get categories
   */
  async getCategories(): Promise<{ id: string; name: string }[]> {
    const response = await fetch(
      `${this.baseUrl}/v3/merchants/${this.config.merchantId}/categories`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to get categories: ${response.statusText}`);
    }

    const data = await response.json();
    return data.elements || [];
  }

  /**
   * Get employees
   */
  async getEmployees(): Promise<CloverEmployee[]> {
    const response = await fetch(
      `${this.baseUrl}/v3/employees`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to get employees: ${response.statusText}`);
    }

    const data = await response.json();
    return data.elements || [];
  }

  /**
   * Get customers
   */
  async getCustomers(params: {
    filter?: string;
    limit?: number;
  } = {}): Promise<Array<{
    id: string;
    firstName?: string;
    lastName?: string;
    emailAddresses?: string[];
    phoneNumbers?: string[];
  }>> {
    const queryParams = new URLSearchParams();
    if (params.filter) queryParams.set('filter', params.filter);
    if (params.limit) queryParams.set('limit', params.limit.toString());

    const url = `${this.baseUrl}/v3/merchants/${this.config.merchantId}/customers?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get customers: ${response.statusText}`);
    }

    const data = await response.json();
    return data.elements || [];
  }
}

/**
 * Create Clover client instance from environment
 */
export function createCloverClient(): CloverClient | null {
  const appId = process.env.CLOVER_APP_ID;
  const appSecret = process.env.CLOVER_APP_SECRET;
  const accessToken = process.env.CLOVER_ACCESS_TOKEN;
  const merchantId = process.env.CLOVER_MERCHANT_ID;
  const environment = process.env.CLOVER_ENVIRONMENT as 'sandbox' | 'production' || 'production';

  if (!appId || !appSecret) {
    console.warn('Clover credentials not configured');
    return null;
  }

  return new CloverClient({
    appId,
    appSecret,
    accessToken,
    merchantId,
    environment,
  });
}

export { CloverClient };
export type { CloverConfig, CloverOrder, CloverLineItem, CloverInventoryItem, CloverEmployee };
