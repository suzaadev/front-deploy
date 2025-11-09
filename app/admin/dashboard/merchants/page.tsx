'use client';

import { useEffect, useState } from 'react';
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

  const filteredMerchants = merchants.filter(m => {
    if (filter === 'active') return !m.suspendedAt;
    if (filter === 'suspended') return m.suspendedAt;
    return true;
  });

  const activeCount = merchants.filter(m => !m.suspendedAt).length;
  const suspendedCount = merchants.filter(m => m.suspendedAt).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Merchant Management</h1>
        <button onClick={fetchMerchants} className="btn-secondary">
          🔄 Refresh
        </button>
      </div>

      {(updateMessage || updateError) && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            updateError ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'
          }`}
        >
          {updateError || updateMessage}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'px-4 py-2 rounded-lg bg-purple-600 text-white' : 'px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200'}
        >
          All ({merchants.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={filter === 'active' ? 'px-4 py-2 rounded-lg bg-purple-600 text-white' : 'px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200'}
        >
          Active ({activeCount})
        </button>
        <button
          onClick={() => setFilter('suspended')}
          className={filter === 'suspended' ? 'px-4 py-2 rounded-lg bg-purple-600 text-white' : 'px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200'}
        >
          Suspended ({suspendedCount})
        </button>
      </div>

      {filteredMerchants.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No merchants found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly Link Limit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wallet Limit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMerchants.map((merchant) => (
                <tr key={merchant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {merchant.businessName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {merchant.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {merchant.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {merchant.suspendedAt ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Suspended
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <select
                      className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                      value={editedMerchants[merchant.id]?.tier ?? merchant.tier}
                      onChange={(event) => handleTierChange(merchant.id, event.target.value as MerchantTier)}
                    >
                      {tierOptions.map((option) => (
                        <option key={option} value={option}>
                          {option.replace('TIER_', 'Tier ')}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      className="w-24 rounded-md border border-gray-300 px-3 py-1 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                      value={
                        editedMerchants[merchant.id]?.paymentLinkMonthlyLimit ??
                        merchant.paymentLinkMonthlyLimit.toString()
                      }
                      onChange={(event) => handleLimitChange(merchant.id, event.target.value)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      className="w-24 rounded-md border border-gray-300 px-3 py-1 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                      value={
                        editedMerchants[merchant.id]?.walletLimit ??
                        merchant.walletLimit?.toString() ??
                        '0'
                      }
                      onChange={(event) => handleWalletLimitChange(merchant.id, event.target.value)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(merchant.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleUpdate(merchant.id)}
                        disabled={savingId === merchant.id}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingId === merchant.id ? 'Saving...' : 'Save'}
                      </button>
                      {merchant.suspendedAt ? (
                        <button
                          onClick={() => handleUnsuspend(merchant.id)}
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Unsuspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSuspend(merchant.id)}
                          className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                        >
                          Suspend
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(merchant.id)}
                        className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
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
