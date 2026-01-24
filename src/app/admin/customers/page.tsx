'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Search, DollarSign, TrendingUp, Download } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { exportCustomersToCSV } from '@/lib/utils/csv-export';

interface Customer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  totalSpent: number;
  orderCount: number;
  avgOrderValue: number;
  lastOrderDate: string | null;
  rewardPoints: number;
  tier: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetch(`/api/admin/customers?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setCustomers(data.customers);
      } else {
        toast.error(data.error || 'Failed to fetch customers');
      }
    } catch (error) {
      console.error('Fetch customers error:', error);
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgLifetimeValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  const handleExportCustomers = useCallback(() => {
    const exportData = customers.map(customer => ({
      id: customer.id,
      name: customer.name || '',
      email: customer.email,
      role: 'CUSTOMER',
      orderCount: customer.orderCount,
      totalSpent: customer.totalSpent,
      avgOrderValue: customer.avgOrderValue,
      rewardPoints: customer.rewardPoints,
      tier: customer.tier,
      lastOrderDate: customer.lastOrderDate ? new Date(customer.lastOrderDate) : null,
      createdAt: new Date(customer.createdAt),
    }));
    exportCustomersToCSV(exportData);
    toast.success('Customers exported to CSV');
  }, [customers]);

  function getTierColor(tier: string) {
    const colors: Record<string, string> = {
      Bronze: 'bg-amber-100 text-amber-700',
      Silver: 'bg-gray-100 text-gray-700',
      Gold: 'bg-yellow-100 text-yellow-700',
      Platinum: 'bg-purple-100 text-purple-700',
    };
    return colors[tier] || 'bg-gray-100 text-gray-700';
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">Manage your customer database</p>
        </div>
        <Button onClick={handleExportCustomers} variant="outline" className="w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{totalCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-sm font-medium">Avg Lifetime Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">${avgLifetimeValue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers ({customers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Loading customers...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No customers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Orders</th>
                    <th className="pb-3 font-semibold">Total Spent</th>
                    <th className="pb-3 font-semibold">Avg Order</th>
                    <th className="pb-3 font-semibold">Tier</th>
                    <th className="pb-3 font-semibold">Last Order</th>
                    <th className="pb-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800 dark:border-slate-700">
                      <td className="py-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{customer.name || 'Anonymous'}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{customer.email}</div>
                        </div>
                      </td>
                      <td className="py-4 font-medium text-gray-900 dark:text-white">{customer.orderCount}</td>
                      <td className="py-4 font-medium text-gray-900 dark:text-white">${customer.totalSpent.toFixed(2)}</td>
                      <td className="py-4 text-gray-900 dark:text-white">${customer.avgOrderValue.toFixed(2)}</td>
                      <td className="py-4">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getTierColor(customer.tier)}`}>
                          {customer.tier}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                        {customer.lastOrderDate
                          ? new Date(customer.lastOrderDate).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td className="py-4">
                        <Link href={`/admin/customers/${customer.id}`}>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
