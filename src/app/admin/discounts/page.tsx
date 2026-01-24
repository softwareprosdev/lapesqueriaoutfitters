'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  Edit,
  Plus,
  Copy,
  Clock,
  Check,
  X,
  Ticket,
  Percent,
  DollarSign,
  Truck,
  Gift,
  Sparkles,
  TrendingUp,
  Users,
  Calendar,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Discount {
  id: string;
  code: string;
  type: string;
  value: number;
  description?: string;
  usageLimit?: number;
  usageCount: number;
  totalUsages: number;
  remainingUses?: number | null;
  startsAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
}

const typeConfig = {
  PERCENTAGE: {
    icon: Percent,
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    text: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-200 dark:border-violet-800',
  },
  FIXED_AMOUNT: {
    icon: DollarSign,
    gradient: 'from-emerald-500 to-green-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  FREE_SHIPPING: {
    icon: Truck,
    gradient: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  BUY_X_GET_Y: {
    icon: Gift,
    gradient: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-50 dark:bg-pink-950/30',
    text: 'text-pink-700 dark:text-pink-300',
    border: 'border-pink-200 dark:border-pink-800',
  },
};

export default function DiscountsPage() {
  const router = useRouter();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  const fetchDiscounts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/discounts?status=${filter}`);

      if (!response.ok) {
        throw new Error('Failed to fetch discounts');
      }

      const data = await response.json();
      setDiscounts(data);
    } catch (error) {
      console.error('Error fetching discounts:', error);
      toast.error('Failed to load discount codes');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  async function deleteDiscount(id: string) {
    if (!confirm('Are you sure you want to delete this discount code?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/discounts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete discount');
      }

      toast.success('Discount code deleted');
      fetchDiscounts();
    } catch (error) {
      console.error('Error deleting discount:', error);
      toast.error('Failed to delete discount code');
    }
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/admin/discounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update discount');
      }

      toast.success(`Discount ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchDiscounts();
    } catch (error) {
      console.error('Error updating discount:', error);
      toast.error('Failed to update discount code');
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  }

  function getDiscountLabel(type: string, value: number) {
    switch (type) {
      case 'PERCENTAGE':
        return `${value}% OFF`;
      case 'FIXED_AMOUNT':
        return `$${value} OFF`;
      case 'FREE_SHIPPING':
        return 'FREE SHIPPING';
      case 'BUY_X_GET_Y':
        return `BUY ${value} GET 1`;
      default:
        return type;
    }
  }

  function isExpired(discount: Discount) {
    if (!discount.expiresAt) return false;
    return new Date(discount.expiresAt) < new Date();
  }

  // Stats
  const activeCount = discounts.filter(d => d.isActive && !isExpired(d)).length;
  const totalUsage = discounts.reduce((sum, d) => sum + d.totalUsages, 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header with Gradient Background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 p-6 sm:p-8 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Ticket className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Discount Codes</h1>
              <p className="text-purple-100 mt-1">Create and manage promotional offers</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/admin/discounts/new')}
            className="group flex items-center gap-2 bg-white text-purple-600 px-5 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            New Discount
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Codes</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{discounts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Uses</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{totalUsage}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg/Code</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {discounts.length > 0 ? Math.round(totalUsage / discounts.length) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: 'active', label: 'Active', icon: Check, color: 'emerald' },
          { value: 'expired', label: 'Expired', icon: Clock, color: 'red' },
          { value: 'all', label: 'All Codes', icon: Ticket, color: 'purple' },
        ].map((f) => {
          const Icon = f.icon;
          const isActive = filter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                isActive
                  ? `bg-gradient-to-r from-${f.color}-500 to-${f.color}-600 text-white shadow-lg shadow-${f.color}-500/25 scale-105`
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 hover:shadow-md'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Discounts Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-48 animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      ) : discounts.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-600">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-full mb-4">
            <Ticket className="w-8 h-8 text-purple-500 dark:text-purple-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No discount codes found</p>
          <button
            onClick={() => router.push('/admin/discounts/new')}
            className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold hover:underline"
          >
            <Plus className="w-4 h-4" />
            Create your first discount code
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {discounts.map((discount, index) => {
            const config = typeConfig[discount.type as keyof typeof typeConfig] || typeConfig.PERCENTAGE;
            const TypeIcon = config.icon;
            const expired = isExpired(discount);

            return (
              <div
                key={discount.id}
                className={`group relative bg-white dark:bg-slate-900 rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  expired ? 'border-gray-200 dark:border-slate-700 opacity-75' : config.border
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Top Gradient Bar */}
                <div className={`h-2 bg-gradient-to-r ${config.gradient}`} />

                {/* Content */}
                <div className="p-5">
                  {/* Code & Actions Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient}`}>
                        <TypeIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="text-lg font-bold text-gray-900 dark:text-white tracking-wide">
                            {discount.code}
                          </code>
                          <button
                            onClick={() => copyCode(discount.code)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Copy code"
                          >
                            <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                          </button>
                        </div>
                        <span className={`text-sm font-semibold ${config.text}`}>
                          {getDiscountLabel(discount.type, discount.value)}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {discount.isActive && !expired ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold animate-pulse">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        Live
                      </span>
                    ) : expired ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-full text-xs font-semibold">
                        <Clock className="w-3 h-3" />
                        Expired
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-semibold">
                        <X className="w-3 h-3" />
                        Paused
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {discount.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{discount.description}</p>
                  )}

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{discount.totalUsages} uses</span>
                      {discount.usageLimit && (
                        <span className="text-gray-400 dark:text-gray-500">/ {discount.usageLimit}</span>
                      )}
                    </div>
                    {discount.expiresAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{format(new Date(discount.expiresAt), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                  </div>

                  {/* Usage Progress Bar */}
                  {discount.usageLimit && (
                    <div className="mb-4">
                      <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full bg-gradient-to-r ${config.gradient} transition-all duration-500`}
                          style={{ width: `${Math.min((discount.totalUsages / discount.usageLimit) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-slate-700">
                    <button
                      onClick={() => toggleActive(discount.id, discount.isActive)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                        discount.isActive
                          ? 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                          : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/70'
                      }`}
                    >
                      {discount.isActive ? (
                        <>
                          <X className="w-4 h-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Activate
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => router.push(`/admin/discounts/${discount.id}/edit`)}
                      className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                      title="Edit discount"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteDiscount(discount.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                      title="Delete discount"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
