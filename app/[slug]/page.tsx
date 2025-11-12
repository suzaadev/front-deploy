'use client';
import { PUBLIC_API_BASE_URL } from '@/app/lib/config';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

export default function MerchantPortalPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const fallbackName = slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
  const [merchantName, setMerchantName] = useState(fallbackName);
  const [activeTab, setActiveTab] = useState<'lookup' | 'create'>('create');
  const [lookupNumber, setLookupNumber] = useState('');
  const [createAmount, setCreateAmount] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchMerchant() {
      try {
        const response = await fetch(`${PUBLIC_API_BASE_URL}/public/wallets/${slug}`);
        if (!response.ok) return;
        const data = await response.json();
        const name = data?.data?.merchant?.name;
        if (name) {
          setMerchantName(name);
        }
      } catch (err) {
        console.warn('Failed to load merchant name', err);
      }
    }

    fetchMerchant();
  }, [slug]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'lookup' || tab === 'create') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!lookupNumber.trim()) return;
    const paddedOrder = lookupNumber.padStart(4, '0');
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    router.push(`/${slug}/${today}/${paddedOrder}`);
  }

  async function handleCreatePayment(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const amount = parseFloat(createAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${PUBLIC_API_BASE_URL}/public/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantSlug: slug,
          amount,
          description: createDescription || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create payment');
      }

      const data = await response.json();
      router.push(`/${data.data.linkId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--suzaa-surface-subtle)] py-8 px-4">
      <div className="mx-auto w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-[var(--suzaa-border)] bg-white/90 shadow-soft backdrop-blur">
          <div
            className="px-6 py-8 text-center"
            style={{ background: 'linear-gradient(135deg, #0a84ff 0%, #00b8a9 100%)' }}
          >
            <p className="text-[0.65rem] uppercase tracking-[0.32em] text-white/70">Customer Portal</p>
            <h1 className="mt-2 text-2xl font-semibold uppercase tracking-[0.18em] text-white">{merchantName}</h1>
            <p className="mt-3 text-xs text-white/75">
              Securely view or create cryptocurrency payment requests.
            </p>
          </div>

          <div className="bg-white px-5 pt-5">
            <div className="flex rounded-2xl border border-[var(--suzaa-border)] bg-[var(--suzaa-surface-muted)] p-1">
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                  activeTab === 'create'
                    ? 'bg-white text-[var(--suzaa-navy)] shadow-soft'
                    : 'text-[var(--suzaa-muted)] hover:text-[var(--suzaa-blue)]'
                }`}
              >
                Create
              </button>
              <button
                onClick={() => setActiveTab('lookup')}
                className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                  activeTab === 'lookup'
                    ? 'bg-white text-[var(--suzaa-navy)] shadow-soft'
                    : 'text-[var(--suzaa-muted)] hover:text-[var(--suzaa-blue)]'
                }`}
              >
                Lookup
              </button>
            </div>
          </div>

          <div className="bg-white px-6 py-6">
            {error && (
              <div className="mb-5 rounded-2xl border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)] px-4 py-2 text-xs text-[var(--suzaa-danger)]">
                {error}
              </div>
            )}

            {activeTab === 'create' ? (
              <form onSubmit={handleCreatePayment} className="space-y-5">
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-[var(--suzaa-navy)]">Request a payment link</h2>
                  <p className="mt-1 text-xs text-[var(--suzaa-muted)]">
                    Generate a secure link in seconds.
                  </p>
                </div>

                <div>
                  <label className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--suzaa-muted)]">
                    Amount (USD)
                  </label>
                  <input
                    type="text"
                    value={createAmount}
                    onChange={(e) => setCreateAmount(e.target.value)}
                    placeholder="100.00"
                    className="input mt-2"
                    required
                  />
                </div>

                <div>
                  <label className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--suzaa-muted)]">
                    Description (optional)
                  </label>
                  <textarea
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                    placeholder="Invoice payment"
                    className="input mt-2 min-h-[90px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center text-sm disabled:opacity-60"
                >
                  {loading ? 'Creating…' : 'Create payment request'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLookup} className="space-y-5">
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-[var(--suzaa-navy)]">Find an existing payment</h2>
                  <p className="mt-1 text-xs text-[var(--suzaa-muted)]">
                    Enter the order number provided on your invoice.
                  </p>
                </div>

                <div>
                  <label className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--suzaa-muted)]">
                    Order number
                  </label>
                  <input
                    type="text"
                    value={lookupNumber}
                    onChange={(e) => setLookupNumber(e.target.value)}
                    placeholder="0042"
                    className="input mt-2 text-center font-mono"
                    required
                  />
                  <p className="mt-2 text-xs text-[var(--suzaa-muted)] text-center">
                    Orders use 4-digit formats such as 0001 or 0023.
                  </p>
                </div>

                <button type="submit" className="btn-primary w-full justify-center">
                  Find my payment
                </button>
              </form>
            )}
          </div>
          <div className="border-t border-[var(--suzaa-border)] bg-white/90 px-6 py-4 text-center text-[0.65rem] uppercase tracking-[0.24em] text-[var(--suzaa-muted)]">
            Powered by <span className="font-semibold text-[var(--suzaa-navy)]">SUZAA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
