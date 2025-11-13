'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/app/lib/adminApi';

interface Stats {
  totalMerchants: number;
  activeMerchants: number;
  suspendedMerchants: number;
  totalPayments: number;
  totalVolume: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      const response = await adminApi.get('/admin/stats');
      setStats(response.data?.data ?? null);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-semibold text-[var(--suzaa-navy)]">Dashboard Overview</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="surface-card">
          <p className="text-sm text-[var(--suzaa-muted)] uppercase tracking-wide">Total Merchants</p>
          <p className="mt-2 text-3xl font-bold text-[var(--suzaa-midnight)]">
            {stats?.totalMerchants ?? 0}
          </p>
        </div>

        <div className="surface-card">
          <p className="text-sm text-[var(--suzaa-muted)] uppercase tracking-wide">Active Merchants</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {stats?.activeMerchants ?? 0}
          </p>
        </div>

        <div className="surface-card">
          <p className="text-sm text-[var(--suzaa-muted)] uppercase tracking-wide">Suspended</p>
          <p className="mt-2 text-3xl font-bold text-rose-600">
            {stats?.suspendedMerchants ?? 0}
          </p>
        </div>

        <div className="surface-card">
          <p className="text-sm text-[var(--suzaa-muted)] uppercase tracking-wide">Total Payments</p>
          <p className="mt-2 text-3xl font-bold text-[var(--suzaa-blue)]">
            {stats?.totalPayments ?? 0}
          </p>
        </div>
      </div>

      <div className="surface-card space-y-4">
        <h3 className="text-xl font-semibold text-[var(--suzaa-midnight)]">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <a
            href="/admin/dashboard/merchants"
            className="rounded-2xl border border-[var(--suzaa-border)] bg-white p-4 transition hover:border-[var(--suzaa-blue)]/40 hover:shadow-soft"
          >
            <p className="text-sm font-semibold text-[var(--suzaa-midnight)]">Manage Merchants</p>
            <p className="mt-1 text-xs text-[var(--suzaa-muted)]">
              View, suspend, and adjust merchant quotas.
            </p>
          </a>
          <a
            href="/admin/dashboard/settings"
            className="rounded-2xl border border-[var(--suzaa-border)] bg-white p-4 transition hover:border-[var(--suzaa-blue)]/40 hover:shadow-soft"
          >
            <p className="text-sm font-semibold text-[var(--suzaa-midnight)]">System Settings</p>
            <p className="mt-1 text-xs text-[var(--suzaa-muted)]">
              Configure platform level controls and policies.
            </p>
          </a>
          <div className="rounded-2xl border border-[var(--suzaa-border)] bg-white p-4 opacity-75">
            <p className="text-sm font-semibold text-[var(--suzaa-midnight)]">View Logs</p>
            <p className="mt-1 text-xs text-[var(--suzaa-muted)]">
              Coming soon – monitor operational activity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
