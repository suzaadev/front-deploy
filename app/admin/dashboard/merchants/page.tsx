'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/app/lib/adminApi';

interface Merchant {
  id: string;
  email: string;
  businessName: string;
  slug: string;
  suspendedAt: string | null;
  emailVerified: boolean;
  createdAt: string;
  paymentLinkMonthlyLimit: number;
  tier: MerchantTier;
  walletLimit: number;
}

type MerchantTier = 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4' | 'TIER_5';

interface EditableMerchant {
  paymentLinkMonthlyLimit: string;
  tier: MerchantTier;
  walletLimit: string;
}

const tierOptions: MerchantTier[] = ['TIER_1', 'TIER_2', 'TIER_3', 'TIER_4', 'TIER_5'];

export default function AdminMerchantsPage() {
  const router = useRouter();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [editedMerchants, setEditedMerchants] = useState<Record<string, EditableMerchant>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    fetchMerchants();
  }, []);

  async function fetchMerchants() {
    try {
      setLoading(true);
      const response = await adminApi.get('/admin/merchants');
      const data: Merchant[] = response.data.data || [];
      setMerchants(data);
      const initialState: Record<string, EditableMerchant> = {};
      data.forEach((merchant) => {
        initialState[merchant.id] = {
          paymentLinkMonthlyLimit: merchant.paymentLinkMonthlyLimit.toString(),
          tier: merchant.tier ?? 'TIER_1',
          walletLimit: merchant.walletLimit?.toString() ?? '0',
        };
      });
      setEditedMerchants(initialState);
    } catch (error) {
      console.error('Failed to fetch merchants:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleLimitChange(id: string, value: string) {
    if (!/^\d*$/.test(value)) {
      return;
    }

    setEditedMerchants((prev) => ({
      ...prev,
      [id]: {
        paymentLinkMonthlyLimit: value,
        tier: prev[id]?.tier ?? merchants.find((merchant) => merchant.id === id)?.tier ?? 'TIER_1',
        walletLimit:
          prev[id]?.walletLimit ??
          merchants.find((merchant) => merchant.id === id)?.walletLimit?.toString() ??
          '0',
      },
    }));
  }

  function handleTierChange(id: string, value: MerchantTier) {
    setEditedMerchants((prev) => ({
      ...prev,
      [id]: {
        paymentLinkMonthlyLimit:
          prev[id]?.paymentLinkMonthlyLimit ??
          merchants.find((merchant) => merchant.id === id)?.paymentLinkMonthlyLimit.toString() ??
          '0',
        tier: value,
        walletLimit:
          prev[id]?.walletLimit ??
          merchants.find((merchant) => merchant.id === id)?.walletLimit?.toString() ??
          '0',
      },
    }));
  }

  function handleWalletLimitChange(id: string, value: string) {
    if (!/^\d*$/.test(value)) {
      return;
    }

    setEditedMerchants((prev) => ({
      ...prev,
      [id]: {
        paymentLinkMonthlyLimit:
          prev[id]?.paymentLinkMonthlyLimit ??
          merchants.find((merchant) => merchant.id === id)?.paymentLinkMonthlyLimit.toString() ??
          '0',
        tier: prev[id]?.tier ?? merchants.find((merchant) => merchant.id === id)?.tier ?? 'TIER_1',
        walletLimit: value,
      },
    }));
  }

  async function handleUpdate(id: string) {
    const edits = editedMerchants[id];
    if (!edits) return;

    const trimmedLimit = edits.paymentLinkMonthlyLimit.trim();
    if (trimmedLimit === '') {
      setUpdateError('Monthly limit is required');
      setUpdateMessage('');
      return;
    }

    const numericLimit = Number(trimmedLimit);
    if (!Number.isInteger(numericLimit) || numericLimit < 0) {
      setUpdateError('Monthly limit must be a non-negative integer');
      setUpdateMessage('');
      return;
    }

    const trimmedWalletLimit = (edits.walletLimit ?? '').trim();
    if (trimmedWalletLimit === '') {
      setUpdateError('Wallet limit is required');
      setUpdateMessage('');
      return;
    }

    const numericWalletLimit = Number(trimmedWalletLimit);
    if (!Number.isInteger(numericWalletLimit) || numericWalletLimit < 0) {
      setUpdateError('Wallet limit must be a non-negative integer');
      setUpdateMessage('');
      return;
    }

    setSavingId(id);
    setUpdateError('');
    setUpdateMessage('');

    try {
      await adminApi.patch(`/admin/merchants/${id}`, {
        paymentLinkMonthlyLimit: numericLimit,
        tier: edits.tier,
        walletLimit: numericWalletLimit,
      });
      setUpdateMessage('Merchant settings updated successfully');
      await fetchMerchants();
    } catch (error: any) {
      setUpdateError(error.response?.data?.error || 'Failed to update merchant');
    } finally {
      setSavingId(null);
    }
  }

  async function handleSuspend(id: string) {
    if (!confirm('Are you sure you want to suspend this merchant?')) return;
    try {
      await adminApi.post(`/admin/merchants/${id}/suspend`);
      fetchMerchants();
    } catch (error) {
      console.error('Failed to suspend merchant:', error);
    }
  }

  async function handleUnsuspend(id: string) {
    try {
      await adminApi.post(`/admin/merchants/${id}/unsuspend`);
      fetchMerchants();
    } catch (error) {
      console.error('Failed to unsuspend merchant:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to DELETE this merchant? This cannot be undone!')) return;
    try {
      await adminApi.delete(`/admin/merchants/${id}`);
      fetchMerchants();
    } catch (error) {
      console.error('Failed to delete merchant:', error);
    }
  }

  const filteredMerchants = merchants.filter((m) => {
    if (filter === 'active') return !m.suspendedAt;
    if (filter === 'suspended') return m.suspendedAt;
    return true;
  });

  const activeCount = merchants.filter((m) => !m.suspendedAt).length;
  const suspendedCount = merchants.filter((m) => m.suspendedAt).length;

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--suzaa-blue)]/30 border-t-[var(--suzaa-blue)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--suzaa-navy)]">Merchant Management</h2>
          <p className="mt-2 text-sm text-[var(--suzaa-muted)]">
            Adjust tiers, link quotas, and wallet limits across the network.
          </p>
        </div>
        <button onClick={fetchMerchants} className="btn-secondary">
          ↻ Refresh
        </button>
      </div>

      {(updateMessage || updateError) && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            updateError ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'
          }`}
        >
          {updateError || updateMessage}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {[
          { label: `All (${merchants.length})`, value: 'all' },
          { label: `Active (${activeCount})`, value: 'active' },
          { label: `Suspended (${suspendedCount})`, value: 'suspended' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value as typeof filter)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              filter === option.value
                ? 'bg-[var(--suzaa-blue)] text-white shadow-soft'
                : 'border border-[var(--suzaa-border)] bg-white text-[var(--suzaa-muted)] hover:border-[var(--suzaa-blue)]/50 hover:text-[var(--suzaa-blue)]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {filteredMerchants.length === 0 ? (
        <div className="rounded-2xl border border-[var(--suzaa-border)] bg-white/90 py-12 text-center text-sm font-medium text-[var(--suzaa-muted)] shadow-soft">
          No merchants match the current filter.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--suzaa-border)] bg-white shadow-soft">
          <table className="w-full table-auto">
            <thead className="bg-[var(--suzaa-surface-muted)]/60">
              <tr>
                <th className="table-head px-5 py-4 text-left">Business</th>
                <th className="table-head px-5 py-4 text-left">Slug</th>
                <th className="table-head px-5 py-4 text-left">Status</th>
                <th className="table-head px-5 py-4 text-left">Tier</th>
                <th className="table-head px-5 py-4 text-left">Monthly Link Limit</th>
                <th className="table-head px-5 py-4 text-left">Wallet Limit</th>
                <th className="table-head px-5 py-4 text-left">Created</th>
                <th className="table-head px-5 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--suzaa-border)]/70">
              {filteredMerchants.map((merchant) => (
                <tr
                  key={merchant.id}
                  onClick={() => router.push(`/admin/dashboard/merchants/${merchant.id}`)}
                  className="cursor-pointer transition-colors duration-200 hover:bg-[var(--suzaa-surface-muted)]/70"
                >
                  <td className="px-5 py-4 text-sm font-semibold text-[var(--suzaa-midnight)]">
                    {merchant.businessName}
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--suzaa-muted)]">
                    <span className="rounded-lg bg-[var(--suzaa-surface-muted)] px-3 py-1 font-mono text-xs font-semibold text-[var(--suzaa-midnight)]">
                      {merchant.slug}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`badge ${
                        merchant.suspendedAt ? 'badge-danger' : 'badge-success'
                      }`}
                    >
                      {merchant.suspendedAt ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--suzaa-midnight)]">
                    <select
                      className="rounded-lg border border-[var(--suzaa-border)] bg-white px-3 py-2 text-xs font-medium text-[var(--suzaa-midnight)] focus:border-[var(--suzaa-blue)] focus:outline-none focus:ring-4 focus:ring-[var(--suzaa-blue)]/15"
                      value={editedMerchants[merchant.id]?.tier ?? merchant.tier}
                      onChange={(event) => handleTierChange(merchant.id, event.target.value as MerchantTier)}
                      onClick={(event) => event.stopPropagation()}
                    >
                      {tierOptions.map((option) => (
                        <option key={option} value={option}>
                          {option.replace('TIER_', 'Tier ')}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--suzaa-midnight)]">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      className="w-24 rounded-lg border border-[var(--suzaa-border)] bg-white px-3 py-2 text-xs font-medium text-[var(--suzaa-midnight)] focus:border-[var(--suzaa-blue)] focus:outline-none focus:ring-4 focus:ring-[var(--suzaa-blue)]/15"
                      value={
                        editedMerchants[merchant.id]?.paymentLinkMonthlyLimit ??
                        merchant.paymentLinkMonthlyLimit.toString()
                      }
                      onChange={(event) => handleLimitChange(merchant.id, event.target.value)}
                      onClick={(event) => event.stopPropagation()}
                    />
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--suzaa-midnight)]">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      className="w-24 rounded-lg border border-[var(--suzaa-border)] bg-white px-3 py-2 text-xs font-medium text-[var(--suzaa-midnight)] focus:border-[var(--suzaa-blue)] focus:outline-none focus:ring-4 focus:ring-[var(--suzaa-blue)]/15"
                      value={
                        editedMerchants[merchant.id]?.walletLimit ??
                        merchant.walletLimit?.toString() ??
                        '0'
                      }
                      onChange={(event) => handleWalletLimitChange(merchant.id, event.target.value)}
                      onClick={(event) => event.stopPropagation()}
                    />
                  </td>
                  <td className="px-5 py-4 text-xs text-[var(--suzaa-muted)]">
                    {new Date(merchant.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={() => handleUpdate(merchant.id)}
                        disabled={savingId === merchant.id}
                        className="btn-primary px-4 py-2 text-xs disabled:opacity-60"
                      >
                        {savingId === merchant.id ? 'Saving…' : 'Save'}
                      </button>
                      {merchant.suspendedAt ? (
                        <button
                          onClick={() => handleUnsuspend(merchant.id)}
                          className="btn-secondary px-4 py-2 text-xs"
                        >
                          Unsuspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSuspend(merchant.id)}
                          className="rounded-xl border border-[rgba(239,68,68,0.28)] bg-[rgba(239,68,68,0.08)] px-4 py-2 text-xs font-semibold text-[var(--suzaa-danger)] transition hover:bg-[rgba(239,68,68,0.15)]"
                        >
                          Suspend
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(merchant.id)}
                        className="rounded-xl border border-[var(--suzaa-border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--suzaa-muted)] hover:border-[var(--suzaa-blue)]/40 hover:text-[var(--suzaa-blue)]"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
