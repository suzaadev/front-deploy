'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/api';

export default function CreatePaymentPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expiryMinutes, setExpiryMinutes] = useState('60');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const parsedExpiry = parseInt(expiryMinutes);
    if (isNaN(parsedExpiry) || parsedExpiry < 1) {
      setError('Please enter valid expiry minutes');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/payments/requests', {
        amount: parsedAmount,
        description: description || undefined,
        expiryMinutes: parsedExpiry,
      });

      const data = response.data.data || response.data;
      const linkId = data.linkId;
      
      if (!linkId) {
        throw new Error('No linkId in response');
      }

      const paymentUrl = 'http://116.203.195.248:3001/' + linkId;
      
      // Try to copy to clipboard (only works on HTTPS)
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(paymentUrl);
          alert('Payment created successfully!\n\nURL: ' + paymentUrl + '\n\nLink copied to clipboard!');
        } else {
          alert('Payment created successfully!\n\nURL: ' + paymentUrl + '\n\n(Copy the URL manually)');
        }
      } catch (clipErr) {
        alert('Payment created successfully!\n\nURL: ' + paymentUrl + '\n\n(Copy the URL manually)');
      }
      
      router.push('/dashboard/orders');
    } catch (error: any) {
      console.error('Create payment error:', error);
      setError(error.response?.data?.error || error.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-blue-600 hover:underline mb-4">← Back to Orders</button>
        <h1 className="text-2xl font-bold text-gray-900">Create Payment Request</h1>
        <p className="text-gray-600">Generate a new payment link for your customer</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (USD) *
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100.00"
              className="input"
              required
            />
            <p className="text-xs text-gray-500 mt-1">The amount your customer needs to pay</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Invoice #1234 - Web development services"
              className="input"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">Help your customer identify this payment</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Time (minutes)
            </label>
            <input
              type="number"
              value={expiryMinutes}
              onChange={(e) => setExpiryMinutes(e.target.value)}
              placeholder="60"
              className="input"
              required
            />
            <p className="text-xs text-gray-500 mt-1">How long before this payment link expires (default: 60 minutes)</p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creating...' : 'Create Payment Link'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
