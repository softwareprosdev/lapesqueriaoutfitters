'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Database,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  Store
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CloverConfig {
  apiToken: string;
  merchantId: string;
}

interface SyncData {
  items: any[];
  categories: any[];
  customers: any[];
  orders: any[];
  payments: any[];
  modifiers: any[];
  taxRates: any[];
}

interface SyncOptions {
  importItems: boolean;
  importCategories: boolean;
  importCustomers: boolean;
  importOrders: boolean;
  importPayments: boolean;
  importModifiers: boolean;
  importTaxRates: boolean;
  updateExisting: boolean;
  skipDuplicates: boolean;
}

export default function CloverSyncPage() {
  const [config, setConfig] = useState<CloverConfig>({
    apiToken: '',
    merchantId: ''
  });

  const [syncOptions, setSyncOptions] = useState<SyncOptions>({
    importItems: true,
    importCategories: true,
    importCustomers: true,
    importOrders: true,
    importPayments: true,
    importModifiers: true,
    importTaxRates: true,
    updateExisting: true,
    skipDuplicates: true
  });

  const [envConfigured, setEnvConfigured] = useState<{ configured: boolean; merchantId?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [syncData, setSyncData] = useState<SyncData | null>(null);
  const [syncProgress, setSyncProgress] = useState<string>('');
  const [syncResults, setSyncResults] = useState<any>(null);

  // Check if env vars are configured on mount
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const response = await fetch('/api/admin/clover/config');
        if (response.ok) {
          const data = await response.json();
          setEnvConfigured(data);
        }
      } catch {
        // Silently fail - user can still enter manually
      }
    };
    checkConfig();
  }, []);

  const handleConfigChange = (field: keyof CloverConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (field: keyof SyncOptions, value: boolean) => {
    setSyncOptions(prev => ({ ...prev, [field]: value }));
  };

  const fetchCloverData = async () => {
    if (!config.apiToken && !config.merchantId && !envConfigured?.configured) {
      toast.error('Please enter both API Token and Merchant ID');
      return;
    }

    setIsLoading(true);
    setSyncProgress('Connecting to Clover API...');

    try {
      const response = await fetch('/api/admin/clover/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiToken: config.apiToken,
          merchantId: config.merchantId
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch Clover data');
      }

      const data = await response.json();
      setSyncData(data);
      setSyncProgress('Data fetched successfully!');
      toast.success('Clover data fetched successfully');
    } catch (error) {
      console.error('Error fetching Clover data:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch Clover data');
    } finally {
      setIsLoading(false);
    }
  };

  const importSelectedData = async () => {
    if (!syncData) {
      toast.error('No data to import. Please fetch Clover data first.');
      return;
    }

    setIsLoading(true);
    setSyncProgress('Importing selected data...');

    try {
      const response = await fetch('/api/admin/clover/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config,
          syncData,
          options: syncOptions
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to import data');
      }

      const results = await response.json();
      setSyncResults(results);
      setSyncProgress('Import completed successfully!');
      toast.success('Data imported successfully');
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import data');
    } finally {
      setIsLoading(false);
    }
  };

  const getDataCount = (data: any[] | undefined, enabled: boolean) => {
    if (!enabled || !data) return 0;
    return data.length;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-[#001F3F]">
          Clover POS Integration
        </h1>
        <p className="text-gray-600">
          Sync your Clover point-of-sale data with your e-commerce platform
        </p>
      </div>

      {/* Configuration */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5 text-[#001F3F]" />
            Clover Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="apiToken">API Token</Label>
              <Input
                id="apiToken"
                type="password"
                placeholder="Enter your Clover API token"
                value={config.apiToken}
                onChange={(e) => handleConfigChange('apiToken', e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Get this from your Clover Dashboard → Settings → API Tokens
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="merchantId">Merchant ID</Label>
              <Input
                id="merchantId"
                placeholder="Enter your Merchant ID"
                value={config.merchantId}
                onChange={(e) => handleConfigChange('merchantId', e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Found in your Clover dashboard URL or Account settings
              </p>
            </div>
          </div>

          {envConfigured?.configured && (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  Clover credentials detected from environment variables
                </p>
                <p className="text-xs text-green-600">
                  Merchant ID: {envConfigured.merchantId}
                </p>
              </div>
              <Badge variant="outline" className="border-green-300 text-green-700">Configured</Badge>
            </div>
          )}

          <div className="flex gap-3">
            {envConfigured?.configured && (
              <Button
                onClick={() => {
                  // Send empty credentials - server will use env vars
                  setConfig({ apiToken: '', merchantId: '' });
                  fetchCloverData();
                }}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Now (Use Configured Credentials)
                  </>
                )}
              </Button>
            )}
            <Button
              onClick={fetchCloverData}
              disabled={isLoading || !config.apiToken || !config.merchantId}
              className="bg-[#001F3F] hover:bg-[#002D5C]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Fetching Data...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Fetch with Manual Credentials
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sync Options */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#001F3F]" />
            Import Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="items"
                checked={syncOptions.importItems}
                onCheckedChange={(checked) => handleOptionChange('importItems', checked as boolean)}
              />
              <Label htmlFor="items" className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#FF4500]" />
                Items/Products ({getDataCount(syncData?.items, syncOptions.importItems)})
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="categories"
                checked={syncOptions.importCategories}
                onCheckedChange={(checked) => handleOptionChange('importCategories', checked as boolean)}
              />
              <Label htmlFor="categories" className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-500" />
                Categories ({getDataCount(syncData?.categories, syncOptions.importCategories)})
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="customers"
                checked={syncOptions.importCustomers}
                onCheckedChange={(checked) => handleOptionChange('importCustomers', checked as boolean)}
              />
              <Label htmlFor="customers" className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                Customers ({getDataCount(syncData?.customers, syncOptions.importCustomers)})
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="orders"
                checked={syncOptions.importOrders}
                onCheckedChange={(checked) => handleOptionChange('importOrders', checked as boolean)}
              />
              <Label htmlFor="orders" className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-purple-500" />
                Orders ({getDataCount(syncData?.orders, syncOptions.importOrders)})
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="payments"
                checked={syncOptions.importPayments}
                onCheckedChange={(checked) => handleOptionChange('importPayments', checked as boolean)}
              />
              <Label htmlFor="payments" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-500" />
                Payments ({getDataCount(syncData?.payments, syncOptions.importPayments)})
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="modifiers"
                checked={syncOptions.importModifiers}
                onCheckedChange={(checked) => handleOptionChange('importModifiers', checked as boolean)}
              />
              <Label htmlFor="modifiers" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-orange-500" />
                Modifiers ({getDataCount(syncData?.modifiers, syncOptions.importModifiers)})
              </Label>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="updateExisting"
                  checked={syncOptions.updateExisting}
                  onCheckedChange={(checked) => handleOptionChange('updateExisting', checked as boolean)}
                />
                <Label htmlFor="updateExisting">Update existing records</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="skipDuplicates"
                  checked={syncOptions.skipDuplicates}
                  onCheckedChange={(checked) => handleOptionChange('skipDuplicates', checked as boolean)}
                />
                <Label htmlFor="skipDuplicates">Skip duplicate records</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress & Results */}
      {syncProgress && (
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              ) : syncResults ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-500" />
              )}
              <span className="font-medium">{syncProgress}</span>
            </div>

            {syncResults && (
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold text-[#001F3F]">Import Results:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {syncResults.importedItems && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="font-semibold text-green-700">{syncResults.importedItems}</div>
                      <div className="text-green-600">Items Imported</div>
                    </div>
                  )}
                  {syncResults.importedCategories && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="font-semibold text-blue-700">{syncResults.importedCategories}</div>
                      <div className="text-blue-600">Categories</div>
                    </div>
                  )}
                  {syncResults.importedCustomers && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="font-semibold text-purple-700">{syncResults.importedCustomers}</div>
                      <div className="text-purple-600">Customers</div>
                    </div>
                  )}
                  {syncResults.importedOrders && (
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="font-semibold text-orange-700">{syncResults.importedOrders}</div>
                      <div className="text-orange-600">Orders</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Import Button */}
      {syncData && (
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#001F3F]">Ready to Import</h3>
                <p className="text-sm text-gray-600">
                  Review your selections above and click Import to sync the data
                </p>
              </div>
              <Button
                onClick={importSelectedData}
                disabled={isLoading}
                size="lg"
                className="bg-[#FF4500] hover:bg-[#E63900]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Import Selected Data
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}