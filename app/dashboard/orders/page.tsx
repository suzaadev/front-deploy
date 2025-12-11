'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, type ApiError } from '@/app/lib/api';
import { PAYMENT_PORTAL_BASE_URL } from '@/app/lib/config';
import { useAuth } from '@/app/contexts/AuthContext';

interface PaymentRequest {
  id: string;
  linkId: string;
  orderNumber: number;
  amountFiat: number;
  currencyFiat: string;
  description: string | null;
  status: string;
  createdBy: string;
  settlementStatus: string;
  createdAt: string;
  expiresAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const { user, merchant, loading: authLoading, merchantLoading } = useAuth();
  const canFetch = useMemo(
    () => Boolean(!authLoading && !merchantLoading && user && merchant),
    [authLoading, merchantLoading, user, merchant],
  );

  useEffect(() => {
    if (!canFetch) {
      if (!authLoading && !merchantLoading && !user) {
        router.push('/dashboard');
      }
      return;
    }
    fetchOrders();
  }, [canFetch, authLoading, merchantLoading, user, router]);

  async function fetchOrders() {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data: PaymentRequest[] }>('/payments/requests');
      const list = (response.data && 'data' in response.data && response.data.data) || [];
      setOrders(list);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError?.status === 401) {
        router.push('/dashboard');
      } else {
        console.error('Failed to fetch orders', error);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateSettlementStatus(id: string, status: string) {
    try {
      setUpdatingStatus(id);
      await api.patch(`/payments/requests/${id}/settlement`, { settlementStatus: status });
      await fetchOrders();
    } catch (error) {
      const apiError = error as ApiError;
      alert(
        apiError?.payload?.error ||
          apiError?.message ||
          'Failed to update status',
      );
    } finally {
      setUpdatingStatus(null);
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return order.status === 'ACTIVE';
    if (filter === 'expired') return order.status === 'EXPIRED';
    return true;
  });

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
          <h2 className="text-2xl font-semibold text-[var(--suzaa-navy)]">Payment Requests</h2>
          <p className="mt-2 text-sm text-[var(--suzaa-muted)]">
            Manage your active and settled payment links in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchOrders}
            className="btn-ghost border border-[var(--suzaa-border)] bg-white px-4 py-2 text-sm font-semibold"
          >
            ↻ Refresh
          </button>
          <button
            onClick={() => router.push('/dashboard/orders/create')}
            className="btn-primary"
          >
            + Create Request
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { label: 'All', value: 'all' },
          { label: 'Active', value: 'active' },
          { label: 'Expired', value: 'expired' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
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

      <div className="overflow-hidden rounded-2xl border border-[var(--suzaa-border)] bg-white shadow-soft">
        <table className="w-full table-auto">
          <thead className="bg-[var(--suzaa-surface-muted)]/60">
            <tr>
              <th className="table-head px-5 py-4 text-left">Order ID</th>
              <th className="table-head px-5 py-4 text-left">Amount</th>
              <th className="table-head px-5 py-4 text-left">Description</th>
              <th className="table-head px-5 py-4 text-left">Created By</th>
              <th className="table-head px-5 py-4 text-left">Status</th>
              <th className="table-head px-5 py-4 text-left">Settlement</th>
              <th className="table-head px-5 py-4 text-left">Created</th>
              <th className="table-head px-5 py-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--suzaa-border)]/70">
            {filteredOrders.map((order) => (
              <tr
                key={order.id}
                onClick={() => router.push(`/dashboard/orders/view/${order.id}`)}
                className="cursor-pointer transition-colors duration-200 hover:bg-[var(--suzaa-surface-muted)]/70"
              >
                <td className="px-5 py-4">
                  <span className="rounded-lg bg-[var(--suzaa-surface-muted)] px-3 py-1 font-mono text-sm font-semibold text-[var(--suzaa-midnight)]">
                    {order.linkId}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-[var(--suzaa-midnight)]">
                  ${order.amountFiat} {order.currencyFiat}
                </td>
                <td className="px-5 py-4 text-sm text-[var(--suzaa-muted)]">
                  {order.description || '—'}
                </td>
                <td className="px-5 py-4">
                  <span className="badge">{order.createdBy}</span>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={
                      order.status === 'ACTIVE'
                        ? 'badge-success'
                        : 'badge text-[var(--suzaa-muted)]'
                    }
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <select
                    value={order.settlementStatus}
                    onChange={(e) => updateSettlementStatus(order.id, e.target.value)}
                    disabled={updatingStatus === order.id}
                    onClick={(event) => event.stopPropagation()}
                    className="rounded-lg border border-[var(--suzaa-border)] bg-white px-3 py-2 text-xs font-medium text-[var(--suzaa-midnight)] focus:border-[var(--suzaa-blue)] focus:outline-none focus:ring-4 focus:ring-[var(--suzaa-blue)]/15"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="SETTLED">Settled</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="REISSUED">Re-issued</option>
                    <option value="CANCELED">Canceled</option>
                    <option value="CLAIMED_PAID">Claimed Paid</option>
                  </select>
                </td>
                <td className="px-5 py-4 text-xs text-[var(--suzaa-muted)]">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-4">
                  <a
                    href={`${PAYMENT_PORTAL_BASE_URL}/recipient/${order.linkId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-[var(--suzaa-blue)] hover:text-[var(--suzaa-teal)]"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="border-t border-[var(--suzaa-border)]/70 bg-[var(--suzaa-surface-muted)]/60 py-12 text-center text-sm font-medium text-[var(--suzaa-muted)]">
            No payment requests match this filter yet.
          </div>
        )}
      </div>
    </div>
  );
}
