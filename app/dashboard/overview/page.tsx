'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/api';
import { DollarSign, Clock, CheckCircle, CreditCard, ExternalLink, Phone, Key } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { PAYMENT_PORTAL_BASE_URL } from '@/app/lib/config';

export default function OverviewPage() {
  const router = useRouter();
  const { merchant } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    settled: 0,
    totalAmount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if slug is a 6-digit number (original slug) or a phone number
  // Phone numbers are 7-20 digits, original slugs are exactly 6 digits
  const isOriginalSlug = merchant?.slug && /^\d{6}$/.test(merchant.slug);
  const isPhoneNumberSlug = merchant?.slug && /^\d{7,20}$/.test(merchant.slug);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const response = await api.get('/payments/requests');
      const orders = response.data.data || [];
      
      const pending = orders.filter((o: any) => o.status === 'PENDING').length;
      const settled = orders.filter((o: any) => o.status === 'SETTLED').length;
      const totalAmount = orders.reduce((sum: number, o: any) => sum + parseFloat(o.amountFiat), 0);
      
      setStats({ total: orders.length, pending, settled, totalAmount });
      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const content = (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--suzaa-navy)]">Payment Intelligence</h2>
          <p className="mt-2 text-sm text-[var(--suzaa-muted)]">
            Snapshot of your recent activity across all settlement channels.
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/orders/create')}
          className="btn-primary inline-flex items-center justify-center gap-2"
        >
          + Create payment
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Total Requests',
            value: stats.total,
            icon: CreditCard,
            tone: 'bg-[rgba(10,132,255,0.12)] text-[var(--suzaa-blue)]',
          },
          {
            label: 'Pending',
            value: stats.pending,
            icon: Clock,
            tone: 'bg-[rgba(245,158,11,0.15)] text-[var(--suzaa-warning)]',
          },
          {
            label: 'Settled',
            value: stats.settled,
            icon: CheckCircle,
            tone: 'bg-[rgba(16,185,129,0.12)] text-[var(--suzaa-success)]',
          },
          {
            label: 'Total Volume',
            value: `$${stats.totalAmount.toFixed(2)}`,
            icon: DollarSign,
            tone: 'bg-[rgba(11,17,31,0.08)] text-[var(--suzaa-midnight)]',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="surface-card">
              <div className={`mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl ${item.tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--suzaa-muted)]">
                {item.label}
              </p>
              <p className="mt-3 text-3xl font-semibold text-[var(--suzaa-navy)]">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      {merchant && (
        <div className="surface-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Phone className="h-4 w-4 text-[var(--suzaa-muted)]" />
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--suzaa-muted)]">
                  Public Portal
                </p>
              </div>
              {isPhoneNumberSlug ? (
                <>
                  <p className="text-lg font-semibold text-[var(--suzaa-navy)]">
                    {merchant.slug}
                  </p>
                  <p className="mt-1 text-sm text-[var(--suzaa-muted)]">
                    Your payment portal is linked to your phone number
                  </p>
                </>
              ) : isOriginalSlug ? (
                <>
                  <p className="text-lg font-semibold text-[var(--suzaa-navy)]">
                    {merchant.slug}
                  </p>
                  <p className="mt-1 text-sm text-[var(--suzaa-muted)]">
                    Add your phone number in Settings to use it as your public portal link
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-[var(--suzaa-navy)]">
                    {merchant.slug}
                  </p>
                  <p className="mt-1 text-sm text-[var(--suzaa-muted)]">
                    Your payment portal identifier
                  </p>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`${PAYMENT_PORTAL_BASE_URL}/recipient/${merchant.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center justify-center gap-2 text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                View Portal
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="surface-card p-0">
        <div className="border-b border-[var(--suzaa-border)] px-6 py-5">
          <h3 className="text-lg font-semibold text-[var(--suzaa-navy)]">Recent Requests</h3>
          <p className="text-sm text-[var(--suzaa-muted)]">
            Track the latest customer payment intents and settlement status.
          </p>
        </div>
        <div className="p-6">
          {recentOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--suzaa-border)] bg-[var(--suzaa-surface-subtle)] py-12 text-center">
              <p className="text-sm font-medium text-[var(--suzaa-muted)]">
                No payment requests yet. Create your first link to start tracking activity.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--suzaa-border)]/60">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-mono text-sm font-semibold text-[var(--suzaa-midnight)]">
                      {order.linkId}
                    </p>
                    <p className="mt-1 text-sm text-[var(--suzaa-muted)]">
                      {order.description || 'No description provided'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 sm:text-right">
                    <div>
                      <p className="text-sm font-semibold text-[var(--suzaa-midnight)]">
                        ${order.amountFiat} {order.currencyFiat}
                      </p>
                      <p className="text-xs text-[var(--suzaa-muted)]">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`badge ${
                        order.status === 'PENDING'
                          ? 'badge-warning'
                          : order.status === 'SETTLED'
                          ? 'badge-success'
                          : 'text-[var(--suzaa-muted)]'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* API Key Info Row */}
      {merchant?.apiKeyFingerprint && merchant?.apiKeyCreatedAt && (
        <div className="surface-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-[var(--suzaa-muted)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--suzaa-muted)]">
                API Key
              </p>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
              <div>
                <p className="text-xs text-[var(--suzaa-muted)]">Fingerprint</p>
                <p className="text-sm font-mono font-semibold text-[var(--suzaa-navy)]">
                  {merchant.apiKeyFingerprint}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--suzaa-muted)]">Created</p>
                <p className="text-sm font-semibold text-[var(--suzaa-navy)]">
                  {new Date(merchant.apiKeyCreatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--suzaa-blue)]/30 border-t-[var(--suzaa-blue)]" />
      </div>
    );
  }

  return content;
}
