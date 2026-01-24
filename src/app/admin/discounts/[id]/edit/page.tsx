'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  Ticket,
  Percent,
  DollarSign,
  Truck,
  Gift,
  Sparkles,
  Save,
  Calendar,
  Users,
  Info,
  Hash,
  FileText,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DiscountResponse {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING' | 'BUY_X_GET_Y';
  value: number;
  description: string | null;
  internalNote: string | null;
  usageLimit: number | null;
  usageLimitPerCustomer: number | null;
  usageCount: number;
  minPurchaseAmount: number | null;
  applicableProducts: string[];
  applicableCategories: string[];
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const discountTypes = [
  { value: 'PERCENTAGE', label: 'Percentage Off', icon: Percent, color: 'violet', gradient: 'from-violet-500 to-purple-600' },
  { value: 'FIXED_AMOUNT', label: 'Fixed Amount', icon: DollarSign, color: 'emerald', gradient: 'from-emerald-500 to-green-600' },
  { value: 'FREE_SHIPPING', label: 'Free Shipping', icon: Truck, color: 'blue', gradient: 'from-blue-500 to-cyan-600' },
  { value: 'BUY_X_GET_Y', label: 'Buy X Get Y', icon: Gift, color: 'pink', gradient: 'from-pink-500 to-rose-600' },
];

function formatDateTimeLocal(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function EditDiscountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING' | 'BUY_X_GET_Y',
    value: 0,
    description: '',
    internalNote: '',
    usageLimit: '',
    usageLimitPerCustomer: '',
    minPurchaseAmount: '',
    startsAt: '',
    expiresAt: '',
    isActive: true,
  });

  const currentType = discountTypes.find(t => t.value === formData.type) || discountTypes[0];

  useEffect(() => {
    async function fetchDiscount() {
      try {
        const response = await fetch(`/api/admin/discounts/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            toast.error('Discount code not found');
            router.push('/admin/discounts');
            return;
          }
          throw new Error('Failed to fetch discount');
        }

        const discount: DiscountResponse = await response.json();

        setFormData({
          code: discount.code,
          type: discount.type,
          value: discount.value,
          description: discount.description || '',
          internalNote: discount.internalNote || '',
          usageLimit: discount.usageLimit?.toString() || '',
          usageLimitPerCustomer: discount.usageLimitPerCustomer?.toString() || '',
          minPurchaseAmount: discount.minPurchaseAmount?.toString() || '',
          startsAt: formatDateTimeLocal(discount.startsAt),
          expiresAt: formatDateTimeLocal(discount.expiresAt),
          isActive: discount.isActive,
        });
      } catch (error) {
        console.error('Error fetching discount:', error);
        toast.error('Failed to load discount code');
      } finally {
        setLoading(false);
      }
    }

    fetchDiscount();
  }, [id, router]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      if (!formData.code.trim()) {
        toast.error('Discount code is required');
        setSaving(false);
        return;
      }

      if (formData.type !== 'FREE_SHIPPING' && formData.value <= 0) {
        toast.error('Discount value must be greater than 0');
        setSaving(false);
        return;
      }

      if (formData.type === 'PERCENTAGE' && formData.value > 100) {
        toast.error('Percentage discount cannot exceed 100%');
        setSaving(false);
        return;
      }

      const discountData = {
        code: formData.code.toUpperCase().trim(),
        type: formData.type,
        value: Number(formData.value),
        description: formData.description.trim() || null,
        internalNote: formData.internalNote.trim() || null,
        isActive: formData.isActive,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        usageLimitPerCustomer: formData.usageLimitPerCustomer ? Number(formData.usageLimitPerCustomer) : null,
        minPurchaseAmount: formData.minPurchaseAmount ? Number(formData.minPurchaseAmount) : null,
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : null,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      };

      const response = await fetch(`/api/admin/discounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discountData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update discount');
      }

      toast.success('Discount code updated successfully!');
      router.push('/admin/discounts');
    } catch (error) {
      console.error('Error updating discount:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update discount code');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600" />
            <Ticket className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <span className="text-gray-600 font-medium">Loading discount...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 p-6 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative">
          <button
            onClick={() => router.push('/admin/discounts')}
            className="flex items-center gap-2 text-purple-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Discounts
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Ticket className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                Edit Discount
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </h1>
              <p className="text-purple-100 mt-1">Update your promotional discount code</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Discount Code Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div className={`h-2 bg-gradient-to-r ${currentType.gradient}`} />
          <div className="p-6 space-y-6">
            {/* Code Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
                <Hash className="w-4 h-4 text-purple-500" />
                Discount Code
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-lg font-mono font-bold uppercase tracking-wider border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all"
                  placeholder="SUMMER2025"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs font-medium">
                  AUTO-CAPS
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Customers will enter this code at checkout</p>
            </div>

            {/* Discount Type Selector */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
                <Ticket className="w-4 h-4 text-purple-500" />
                Discount Type
                <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {discountTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.type === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: type.value as typeof formData.type }))}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? `border-${type.color}-500 bg-gradient-to-br ${type.gradient} text-white shadow-lg scale-105`
                          : 'border-slate-600 hover:border-slate-500 hover:shadow-md bg-slate-800 hover:bg-slate-700'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-white' : `text-${type.color}-400`}`} />
                      <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {type.label}
                      </span>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow">
                          <div className={`w-2 h-2 rounded-full bg-${type.color}-500`} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Value Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
                {formData.type === 'PERCENTAGE' ? (
                  <Percent className="w-4 h-4 text-violet-500" />
                ) : (
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                )}
                Discount Value
                {formData.type !== 'FREE_SHIPPING' && <span className="text-red-500">*</span>}
              </label>
              <div className="relative max-w-xs">
                {formData.type === 'FIXED_AMOUNT' && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">$</span>
                )}
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-2xl font-bold border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all ${
                    formData.type === 'FIXED_AMOUNT' ? 'pl-10' : ''
                  }`}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  disabled={formData.type === 'FREE_SHIPPING'}
                  required={formData.type !== 'FREE_SHIPPING'}
                />
                {formData.type === 'PERCENTAGE' && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">%</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-gray-100 dark:border-slate-700 shadow-sm p-6 space-y-6 hover:shadow-md transition-shadow">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <FileText className="w-5 h-5 text-blue-500" />
            Details
          </h3>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              <Info className="w-4 h-4 text-blue-400" />
              Public Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none"
              placeholder="Summer sale - Get 20% off all ocean-themed bracelets!"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Shown to customers when the code is applied</p>
          </div>

          {/* Internal Note */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              <Lock className="w-4 h-4 text-gray-400" />
              Internal Note
            </label>
            <textarea
              name="internalNote"
              value={formData.internalNote}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:ring-4 focus:ring-gray-100 focus:border-gray-400 transition-all resize-none bg-gray-50"
              placeholder="For email campaign #42 - targeting repeat customers"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Only visible to admins</p>
          </div>
        </div>

        {/* Usage Limits Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-gray-100 dark:border-slate-700 shadow-sm p-6 space-y-6 hover:shadow-md transition-shadow">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <Users className="w-5 h-5 text-green-500" />
            Usage Limits
          </h3>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 block">Total Uses</label>
              <input
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all"
                placeholder="Unlimited"
                min="1"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 block">Per Customer</label>
              <input
                type="number"
                name="usageLimitPerCustomer"
                value={formData.usageLimitPerCustomer}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all"
                placeholder="Unlimited"
                min="1"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 block">Min. Purchase</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  name="minPurchaseAmount"
                  value={formData.minPurchaseAmount}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pl-8 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all"
                  placeholder="None"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-gray-100 dark:border-slate-700 shadow-sm p-6 space-y-6 hover:shadow-md transition-shadow">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <Calendar className="w-5 h-5 text-orange-500" />
            Schedule
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 block">Start Date & Time</label>
              <input
                type="datetime-local"
                name="startsAt"
                value={formData.startsAt}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 block">End Date & Time</label>
              <input
                type="datetime-local"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-gray-100 dark:border-slate-700 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Active Toggle */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-200 dark:bg-slate-600 peer-focus:ring-4 peer-focus:ring-green-100 dark:peer-focus:ring-green-900 rounded-full peer peer-checked:after:translate-x-6 peer-checked:bg-gradient-to-r peer-checked:from-green-400 peer-checked:to-emerald-500 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:shadow-md after:transition-all transition-all" />
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formData.isActive ? 'Active' : 'Inactive'}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formData.isActive ? 'Customers can use this code' : 'Code is paused'}
                </p>
              </div>
            </label>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => router.push('/admin/discounts')}
                className="flex-1 sm:flex-none px-6 py-3 border-2 border-slate-600 rounded-xl bg-slate-800 font-semibold text-slate-300 hover:bg-slate-700 hover:border-slate-500 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-200"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
