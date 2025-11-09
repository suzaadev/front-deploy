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
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="btn-ghost text-sm font-semibold text-[var(--suzaa-blue)] hover:text-[var(--suzaa-teal)]"
      >
        ← Back to Requests
      </button>

      <div className="max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--suzaa-navy)]">
            Create Payment Request
          </h1>
          <p className="mt-2 text-sm text-[var(--suzaa-muted)]">
            Issue a secure, time-bound link to collect payment from your customer.
          </p>
        </div>

        <div className="surface-card">
          {error && (
            <div className="mb-6 rounded-xl border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-sm text-[var(--suzaa-danger)]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[var(--suzaa-midnight)]">
                Amount (USD) *
              </label>
              <p className="mt-1 text-xs text-[var(--suzaa-muted)]">
                Specify the total amount due from the customer.
              </p>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100.00"
                className="input mt-3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--suzaa-midnight)]">
                Description (Optional)
              </label>
              <p className="mt-1 text-xs text-[var(--suzaa-muted)]">
                Provide context for your customer (e.g., invoice number or services).
              </p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Invoice #1234 - Web development services"
                className="input mt-3 min-h-[120px]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--suzaa-midnight)]">
                Expiry Time (minutes)
              </label>
              <p className="mt-1 text-xs text-[var(--suzaa-muted)]">
                Default expiry is 60 minutes. Links automatically close afterwards.
              </p>
              <input
                type="number"
                value={expiryMinutes}
                onChange={(e) => setExpiryMinutes(e.target.value)}
                placeholder="60"
                className="input mt-3"
                required
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Creating...' : 'Create Payment Link'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
