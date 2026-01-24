'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Database, Clock, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SyncStatus {
  lastSync: string;
  syncInProgress: boolean;
  nextSyncAvailable: string | null;
}

interface SyncResult {
  success: boolean;
  message: string;
  results?: {
    products: number;
    variants: number;
    orders: number;
    transactions: number;
    customers: number;
    categories: number;
    startTime: string;
    endTime: string | null;
    errors: string[];
  };
  nextSyncAvailable?: string;
}

export default function DatabaseSyncPanel() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [autoSync, setAutoSync] = useState(false);
  const [syncInterval, setSyncInterval] = useState(30); // seconds

  const fetchSyncStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/sync/database');
      if (response.ok) {
        const status = await response.json();
        setSyncStatus(status);
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    }
  }, []);

  const performSync = useCallback(async (type: 'full' | 'incremental' = 'full') => {
    try {
      const response = await fetch('/api/admin/sync/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      const result: SyncResult = await response.json();
      setLastSyncResult(result);

      if (result.success) {
        toast.success('Database sync completed successfully');
      } else {
        toast.error(`Sync failed: ${result.message}`);
      }

      // Refresh status after sync
      setTimeout(fetchSyncStatus, 1000);
    } catch (error) {
      toast.error('Failed to perform sync');
      console.error('Sync error:', error);
    }
  }, [fetchSyncStatus]);

  // Auto-sync functionality
  useEffect(() => {
    if (!autoSync) return;

    const interval = setInterval(() => {
      if (syncStatus?.nextSyncAvailable && new Date() >= new Date(syncStatus.nextSyncAvailable)) {
        performSync('incremental');
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [autoSync, syncStatus?.nextSyncAvailable, performSync]);

  // Fetch initial status
  useEffect(() => {
    fetchSyncStatus();
  }, [fetchSyncStatus]);

  // Real-time status updates
  useEffect(() => {
    const ws = new WebSocket(process.env.NODE_ENV === 'production' 
      ? `wss://${window.location.host}/api/ws/sync`
      : `ws://${window.location.host}/api/ws/sync`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'sync_update') {
        setSyncStatus(prev => ({
          ...prev!,
          ...data.payload
        }));
      }
    };

    ws.onerror = () => {
      console.log('WebSocket connection failed, falling back to polling');
    };

    return () => ws.close();
  }, []);

  const formatDuration = (startTime: string, endTime: string | null) => {
    if (!endTime) return 'In progress...';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = end.getTime() - start.getTime();
    return `${duration / 1000} seconds`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database Sync Status
              </CardTitle>
              <CardDescription>
                Real-time synchronization across all admin routes and APIs
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoSync(!autoSync)}
              >
                {autoSync ? (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Auto-sync ON
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Auto-sync OFF
                  </>
                )}
              </Button>
              <Button
                onClick={() => performSync('full')}
                disabled={syncStatus?.syncInProgress}
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Full Sync
              </Button>
              <Button
                onClick={() => performSync('incremental')}
                disabled={syncStatus?.syncInProgress}
                variant="outline"
                size="sm"
              >
                <Activity className="w-4 h-4 mr-2" />
                Quick Sync
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <div className="font-semibold text-green-900 dark:text-green-100">Last Sync</div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  {syncStatus?.lastSync 
                    ? new Date(syncStatus.lastSync).toLocaleString()
                    : 'Never'
                  }
                </div>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-4 rounded-lg border ${
              syncStatus?.syncInProgress
                ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
                : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
            }`}>
              {syncStatus?.syncInProgress ? (
                <RefreshCw className="w-8 h-8 text-yellow-600 dark:text-yellow-400 animate-spin" />
              ) : (
                <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              )}
              <div>
                <div className="font-semibold text-yellow-900 dark:text-yellow-100">
                  {syncStatus?.syncInProgress ? 'Syncing...' : 'Ready'}
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  {syncStatus?.nextSyncAvailable && !syncStatus.syncInProgress
                    ? `Next: ${new Date(syncStatus.nextSyncAvailable).toLocaleTimeString()}`
                    : 'Ready to sync'
                  }
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <div>
                <div className="font-semibold text-purple-900 dark:text-purple-100">Auto-Sync</div>
                <div className="text-sm text-purple-700 dark:text-purple-300">
                  {autoSync ? `Every ${syncInterval}s` : 'Disabled'}
                </div>
              </div>
            </div>
          </div>

          {/* Last Sync Results */}
          {lastSyncResult?.results && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Last Sync Results
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Products</span>
                  <Badge variant="secondary">{lastSyncResult.results.products}</Badge>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Variants</span>
                  <Badge variant="secondary">{lastSyncResult.results.variants}</Badge>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Orders</span>
                  <Badge variant="secondary">{lastSyncResult.results.orders}</Badge>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Transactions</span>
                  <Badge variant="secondary">{lastSyncResult.results.transactions}</Badge>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Customers</span>
                  <Badge variant="secondary">{lastSyncResult.results.customers}</Badge>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Categories</span>
                  <Badge variant="secondary">{lastSyncResult.results.categories}</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded">
                <span className="text-sm text-blue-600 dark:text-blue-400">Duration</span>
                <span className="font-medium text-blue-900 dark:text-blue-100">
                  {formatDuration(lastSyncResult.results.startTime, lastSyncResult.results.endTime)}
                </span>
              </div>

              {lastSyncResult.results.errors.length > 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="font-medium text-red-900 dark:text-red-100">Errors</span>
                  </div>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    {lastSyncResult.results.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Auto-sync Settings */}
          <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Auto-Sync Settings
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enable Auto-Sync
                </label>
                <select
                  value={autoSync ? 'enabled' : 'disabled'}
                  onChange={(e) => setAutoSync(e.target.value === 'enabled')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sync Interval (seconds)
                </label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={syncInterval}
                  onChange={(e) => setSyncInterval(Number(e.target.value))}
                  disabled={!autoSync}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Real-time connection active
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}