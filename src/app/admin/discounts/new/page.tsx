'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import type { DiscountData } from '@/types';

export default function NewDiscountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    setLoading(true);

    try {
      // Validate
      if (!formData.code.trim()) {
        toast.error('Discount code is required');
        setLoading(false);
        return;
      }

      if (formData.value <= 0) {
        toast.error('Discount value must be greater than 0');
        setLoading(false);
        return;
      }

      if (formData.type === 'PERCENTAGE' && formData.value > 100) {
        toast.error('Percentage discount cannot exceed 100%');
        setLoading(false);
        return;
      }

      // Prepare data
      const discountData: Partial<DiscountData> = {
        code: formData.code.toUpperCase().trim(),
        type: formData.type,
        value: Number(formData.value),
        description: formData.description.trim() || undefined,
        internalNote: formData.internalNote.trim() || undefined,
        isActive: formData.isActive,
      };

      if (formData.usageLimit) {
        discountData.usageLimit = Number(formData.usageLimit);
      }

      if (formData.usageLimitPerCustomer) {
        discountData.usageLimitPerCustomer = Number(formData.usageLimitPerCustomer);
      }

      if (formData.minPurchaseAmount) {
        discountData.minPurchaseAmount = Number(formData.minPurchaseAmount);
      }

      if (formData.startsAt) {
        discountData.startsAt = new Date(formData.startsAt).toISOString();
      }

      if (formData.expiresAt) {
        discountData.expiresAt = new Date(formData.expiresAt).toISOString();
      }

      const response = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discountData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create discount');
      }

      toast.success('Discount code created successfully');
      router.push('/admin/discounts');
    } catch (error) {
      console.error('Error creating discount:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create discount code');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/admin/discounts')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Discounts
        </button>
        <h1 className="text-3xl font-bold tracking-tight">Create Discount Code</h1>
        <p className="text-gray-600 mt-1">Set up a new promotional discount</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {/* Code */}
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-900 mb-2">
            Discount Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
            placeholder="SUMMER2025"
            required
          />
          <p className="text-sm text-gray-500 mt-1">Customers will enter this code at checkout</p>
        </div>

        {/* Type & Value */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-900 mb-2">
              Discount Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            >
              <option value="PERCENTAGE">Percentage Off</option>
              <option value="FIXED_AMOUNT">Fixed Amount Off</option>
              <option value="FREE_SHIPPING">Free Shipping</option>
              <option value="BUY_X_GET_Y">Buy X Get Y</option>
            </select>
          </div>

          <div>
            <label htmlFor="value" className="block text-sm font-medium text-gray-900 mb-2">
              Value <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              {formData.type === 'PERCENTAGE' && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              )}
              {formData.type === 'FIXED_AMOUNT' && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              )}
              <input
                type="number"
                id="value"
                name="value"
                value={formData.value}
                onChange={handleChange}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  formData.type === 'FIXED_AMOUNT' ? 'pl-8' : ''
                }`}
                placeholder={formData.type === 'FREE_SHIPPING' ? 'N/A' : '0'}
                min="0"
                step="0.01"
                disabled={formData.type === 'FREE_SHIPPING'}
                required={formData.type !== 'FREE_SHIPPING'}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
            Description (Public)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Summer sale - 20% off all ocean-themed bracelets"
          />
          <p className="text-sm text-gray-500 mt-1">Shown to customers when code is applied</p>
        </div>

        {/* Internal Note */}
        <div>
          <label htmlFor="internalNote" className="block text-sm font-medium text-gray-900 mb-2">
            Internal Note (Private)
          </label>
          <textarea
            id="internalNote"
            name="internalNote"
            value={formData.internalNote}
            onChange={handleChange}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="For email campaign #42"
          />
          <p className="text-sm text-gray-500 mt-1">Only visible to admins</p>
        </div>

        {/* Usage Limits */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="usageLimit" className="block text-sm font-medium text-gray-900 mb-2">
              Total Usage Limit
            </label>
            <input
              type="number"
              id="usageLimit"
              name="usageLimit"
              value={formData.usageLimit}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Unlimited"
              min="1"
            />
            <p className="text-sm text-gray-500 mt-1">Leave blank for unlimited</p>
          </div>

          <div>
            <label htmlFor="usageLimitPerCustomer" className="block text-sm font-medium text-gray-900 mb-2">
              Per Customer Limit
            </label>
            <input
              type="number"
              id="usageLimitPerCustomer"
              name="usageLimitPerCustomer"
              value={formData.usageLimitPerCustomer}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Unlimited"
              min="1"
            />
            <p className="text-sm text-gray-500 mt-1">Max uses per customer</p>
          </div>
        </div>

        {/* Min Purchase */}
        <div>
          <label htmlFor="minPurchaseAmount" className="block text-sm font-medium text-gray-900 mb-2">
            Minimum Purchase Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              id="minPurchaseAmount"
              name="minPurchaseAmount"
              value={formData.minPurchaseAmount}
              onChange={handleChange}
              className="w-full px-4 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="No minimum"
              min="0"
              step="0.01"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">Minimum cart value required</p>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startsAt" className="block text-sm font-medium text-gray-900 mb-2">
              Start Date
            </label>
            <input
              type="datetime-local"
              id="startsAt"
              name="startsAt"
              value={formData.startsAt}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-900 mb-2">
              Expiry Date
            </label>
            <input
              type="datetime-local"
              id="expiresAt"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-900">
            Activate discount immediately
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating...' : 'Create Discount Code'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/discounts')}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
