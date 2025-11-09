'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { adminApi } from '@/app/lib/adminApi';

type MerchantTier = 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4' | 'TIER_5';

interface MerchantDetail {
  id: string;
  email: string;
  businessName: string;
  slug: string;
  suspendedAt: string | null;
  emailVerified: boolean;
  paymentLinkMonthlyLimit: number;
  tier: MerchantTier;
  walletLimit: number;
  createdAt: string;
}

export default function MerchantDetailPage() {
  const { merchantId } = useParams<{ merchantId: string }>();
  const router = useRouter();
  const [merchant, setMerchant] = useState<MerchantDetail | null>(null);
  const [formState, setFormState] = useState({
    businessName: '',
    email: '',
    paymentLinkMonthlyLimit: '',
    walletLimit: '',
    tier: 'TIER_1' as MerchantTier,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!merchantId) return;
    fetchMerchant();
  }, [merchantId]);

  async function fetchMerchant() {
    try {
      setLoading(true);
      const response = await adminApi.get(`/admin/merchants`);
      const merchants: MerchantDetail[] = response.data.data || [];
      const found = merchants.find((m) => m.id === merchantId);
      if (!found) {
        setError('Merchant not found');
        return;
      }
      setMerchant(found);
      setFormState({
        businessName: found.businessName,
        email: found.email,
        paymentLinkMonthlyLimit: found.paymentLinkMonthlyLimit.toString(),
        walletLimit: found.walletLimit.toString(),
        tier: found.tier,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load merchant');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!merchant) return;
    setError('');
    setMessage('');

    const parsedLinkLimit = Number(formState.paymentLinkMonthlyLimit.trim());
    const parsedWalletLimit = Number(formState.walletLimit.trim());

    if (!Number.isInteger(parsedLinkLimit) || parsedLinkLimit < 0) {
      setError('Monthly link limit must be a non-negative integer');
      return;
    }

    if (!Number.isInteger(parsedWalletLimit) || parsedWalletLimit < 0) {
      setError('Wallet limit must be a non-negative integer');
      return;
    }

    try {
      setSaving(true);
      await adminApi.patch(`/admin/merchants/${merchant.id}`, {
        paymentLinkMonthlyLimit: parsedLinkLimit,
        tier: formState.tier,
        walletLimit: parsedWalletLimit,
      });
      setMessage('Merchant updated successfully');
      fetchMerchant();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  async function toggleSuspend() {
    if (!merchant) return;
    const action = merchant.suspendedAt ? 'unsuspend' : 'suspend';
    if (!merchant.suspendedAt && !confirm('Suspend this merchant?')) return;

    try {
      await adminApi.post(`/admin/merchants/${merchant.id}/${action}`);
      setMessage(`Merchant ${merchant.suspendedAt ? 'unsuspended' : 'suspended'} successfully`);
      fetchMerchant();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update merchant status');
    }
  }

  async function handleDelete() {
    if (!merchant) return;
    if (!confirm('Are you sure you want to permanently delete this merchant?')) return;

    try {
      await adminApi.delete(`/admin/merchants/${merchant.id}`);
      router.push('/admin/dashboard/merchants');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete merchant');
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--suzaa-blue)]/30 border-t-[var(--suzaa-blue)]" />
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="rounded-2xl border border-[var(--suzaa-border)] bg-white p-8 text-center text-sm font-medium text-[var(--suzaa-muted)] shadow-soft">
        Unable to load merchant details.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <button
        onClick={() => router.push('/admin/dashboard/merchants')}
        className="btn-ghost text-sm font-semibold text-[var(--suzaa-blue)] hover:text-[var(--suzaa-teal)]"
      >
        ← Back to Merchant Management
      </button>

      <div className="surface-card space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--suzaa-navy)]">{merchant.businessName}</h2>
            <p className="mt-1 text-sm text-[var(--suzaa-muted)]">{merchant.email}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.26em] text-[var(--suzaa-muted)]">
              {merchant.slug}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button onClick={toggleSuspend} className="btn-secondary">
              {merchant.suspendedAt ? 'Unsuspend' : 'Suspend'}
            </button>
            <button
              onClick={handleDelete}
              className="rounded-xl border border-[rgba(239,68,68,0.28)] bg-[rgba(239,68,68,0.08)] px-5 py-3 text-sm font-semibold text-[var(--suzaa-danger)] transition-colors duration-200 hover:bg-[rgba(239,68,68,0.15)]"
            >
              Delete
            </button>
          </div>
        </div>

        {(message || error) && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              error ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'
            }`}
          >
            {error || message}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--suzaa-midnight)]">Business Name</label>
            <input
              className="input"
              value={formState.businessName}
              onChange={(e) => setFormState((prev) => ({ ...prev, businessName: e.target.value }))}
              placeholder="Business name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--suzaa-midnight)]">Email</label>
            <input
              className="input"
              value={formState.email}
              onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Email"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--suzaa-midnight)]">Monthly Link Limit</label>
            <input
              className="input"
              value={formState.paymentLinkMonthlyLimit}
              onChange={(e) => setFormState((prev) => ({ ...prev, paymentLinkMonthlyLimit: e.target.value }))}
              inputMode="numeric"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--suzaa-midnight)]">Wallet Limit</label>
            <input
              className="input"
              value={formState.walletLimit}
              onChange={(e) => setFormState((prev) => ({ ...prev, walletLimit: e.target.value }))}
              inputMode="numeric"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--suzaa-midnight)]">Tier</label>
            <select
              className="rounded-xl border border-[var(--suzaa-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--suzaa-midnight)] focus:border-[var(--suzaa-blue)] focus:outline-none focus:ring-4 focus:ring-[var(--suzaa-blue)]/15"
              value={formState.tier}
              onChange={(e) => setFormState((prev) => ({ ...prev, tier: e.target.value as MerchantTier }))}
            >
              {['TIER_1', 'TIER_2', 'TIER_3', 'TIER_4', 'TIER_5'].map((tier) => (
                <option key={tier} value={tier}>
                  {tier.replace('TIER_', 'Tier ')}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--suzaa-midnight)]">Status</label>
            <div className="rounded-xl border border-[var(--suzaa-border)] bg-[var(--suzaa-surface-muted)] px-3 py-3 text-sm font-semibold text-[var(--suzaa-midnight)]">
              {merchant.suspendedAt ? 'Suspended' : 'Active'}
            </div>
          </div>
        </div>

        <div className="text-xs text-[var(--suzaa-muted)]">
          Created on {new Date(merchant.createdAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}


