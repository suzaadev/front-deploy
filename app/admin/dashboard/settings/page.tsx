'use client';

import { useEffect, useState } from 'react';

interface AdminPayload {
  adminId?: string;
  email?: string;
  [key: string]: unknown;
}

export default function AdminSettingsPage() {
  const [admin, setAdmin] = useState<AdminPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminInfo();
  }, []);

  function fetchAdminInfo() {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
        setAdmin(payload);
      }
    } catch (error) {
      console.error('Failed to decode admin token:', error);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--suzaa-blue)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="surface-card space-y-4">
        <h2 className="text-2xl font-semibold text-[var(--suzaa-navy)]">Admin Settings</h2>
        <p className="text-sm text-[var(--suzaa-muted)]">
          Manage your super admin profile and review security status.
        </p>
      </div>

      <div className="surface-card space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-[var(--suzaa-midnight)]">Account Information</h3>
          <p className="text-sm text-[var(--suzaa-muted)]">
            Details extracted from your secure super admin session.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--suzaa-muted)]">
              Email
            </label>
            <p className="mt-2 text-sm font-medium text-[var(--suzaa-midnight)]">
              {admin?.email ?? 'Unknown'}
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--suzaa-muted)]">
              Role
            </label>
            <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-[var(--suzaa-surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--suzaa-midnight)]">
              Super Admin
            </span>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--suzaa-muted)]">
              Admin ID
            </label>
            <p className="mt-2 font-mono text-xs text-[var(--suzaa-muted)]">
              {admin?.adminId ?? 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--suzaa-muted)]">
              Last Token Refresh
            </label>
            <p className="mt-2 text-sm text-[var(--suzaa-muted)]">{new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="surface-card space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-[var(--suzaa-midnight)]">Platform Status</h3>
          <p className="text-sm text-[var(--suzaa-muted)]">
            Snapshot of operational readiness and current release markers.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--suzaa-muted)]">
              Platform Health
            </label>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-semibold text-emerald-600">Operational</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--suzaa-muted)]">
              System Version
            </label>
            <p className="mt-2 text-sm font-medium text-[var(--suzaa-midnight)]">SUZAA v1.0.0</p>
          </div>
        </div>
      </div>

      <div className="surface-card space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-[var(--suzaa-midnight)]">Security</h3>
          <p className="text-sm text-[var(--suzaa-muted)]">
            Enforcement of privileged access and recent activity.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--suzaa-muted)]">
              Two-Factor Authentication
            </label>
            <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Enabled (PIN-based)
            </span>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--suzaa-muted)]">
              Session Status
            </label>
            <span className="mt-2 inline-flex rounded-full bg-[var(--suzaa-surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--suzaa-midnight)]">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
