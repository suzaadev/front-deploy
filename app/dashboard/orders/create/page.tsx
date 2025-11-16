'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, type ApiError } from '@/app/lib/api';
import { PAYMENT_PORTAL_BASE_URL } from '@/app/lib/config';
import { useAuth } from '@/app/contexts/AuthContext';

export default function CreatePaymentPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expiryMinutes, setExpiryMinutes] = useState('60');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [defaultExpiry, setDefaultExpiry] = useState(60);
  const { user, merchant, loading: authLoading, merchantLoading } = useAuth();
  const canCreate = useMemo(
    () => Boolean(!authLoading && !merchantLoading && user && merchant),
    [authLoading, merchantLoading, user, merchant],
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/dashboard');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!merchantLoading && merchant) {
      const value = merchant.defaultPaymentExpiryMinutes;
      const allowed = [15, 30, 60, 120];
      const resolved = allowed.includes(value) ? value : 60;
      setDefaultExpiry(resolved);
      setExpiryMinutes(String(resolved));
    }
  }, [merchantLoading, merchant]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!canCreate) {
      setError('Authentication required before creating payment requests');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const parsedExpiry = parseInt(expiryMinutes);
    const allowedExpiries = [15, 30, 60, 120];
    if (isNaN(parsedExpiry) || !allowedExpiries.includes(parsedExpiry)) {
      setError('Expiry must be 15, 30, 60, or 120 minutes');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post<{ success: boolean; data?: any }>(
        '/payments/requests',
        {
        amount: parsedAmount,
        description: description || undefined,
        expiryMinutes: parsedExpiry,
        },
      );

      const data = response.data?.data ?? response.data;
      const linkId = data.linkId;
      
      if (!linkId) {
        throw new Error('No linkId in response');
      }

      const paymentUrl = `${PAYMENT_PORTAL_BASE_URL}/recipient/${linkId}`;
      
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
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Create payment error:', error);
      setError(
        apiError?.payload?.error ||
          apiError?.message ||
          'Failed to create payment',
      );
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
                Default expiry is {defaultExpiry} minute{defaultExpiry === 1 ? '' : 's'}. Links automatically close afterwards.
              </p>
              <select
                value={expiryMinutes}
                onChange={(e) => setExpiryMinutes(e.target.value)}
                className="input mt-3"
                required
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
                <option value="120">120 minutes</option>
              </select>
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
