'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin');
      }
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  }

  const navigation = [
    { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Merchants', href: '/admin/dashboard/merchants', icon: Users },
    { name: 'Settings', href: '/admin/dashboard/settings', icon: Settings },
  ];

  const activeNav =
    navigation.find((item) => pathname?.startsWith(item.href)) ?? navigation[0];

  const descriptions: Record<string, string> = {
    Overview: 'System-wide pulse of payment volumes, risk alerts, and activity.',
    Merchants: 'Approve, suspend, and govern merchant accounts.',
    Settings: 'Configure super-admin controls and operational policies.',
  };

  return (
    <div className="flex min-h-screen bg-[var(--suzaa-surface-subtle)]">
      <aside className="nav-rail px-5 pb-8 pt-10">
        <div className="mb-12 flex items-center gap-3 px-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--suzaa-navy)] text-lg font-semibold text-white shadow-soft">
            Σ
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--suzaa-navy)]">SUZAA</p>
            <p className="text-[0.65rem] uppercase tracking-[0.28em] text-[var(--suzaa-muted)]">
              Super Admin
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className={isActive ? 'nav-link-active' : 'nav-link'}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </a>
            );
          })}
        </nav>

        <div className="mt-8 rounded-2xl border border-[var(--suzaa-border)] bg-white p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--suzaa-muted)]">
            Session
          </p>
          <p className="mt-2 text-sm text-[var(--suzaa-muted)]">
            Sign out securely when leaving the control centre.
          </p>
          <button
            onClick={handleLogout}
            className="btn-ghost mt-4 w-full justify-center border border-[var(--suzaa-border)] bg-[var(--suzaa-surface-muted)]"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="relative flex-1 overflow-hidden">
        <div className="gradient-shell pointer-events-none absolute inset-x-0 top-0 h-56 opacity-95" />
        <div className="relative z-10 flex h-full flex-col">
          <header className="px-10 pt-16 text-white">
            <div className="flex flex-wrap items-baseline gap-2 text-sm leading-tight text-white/70 md:text-base">
              <span className="font-semibold text-white">Super Admin</span>
              <span className="opacity-50">|</span>
              <span className="font-semibold text-white">{activeNav.name}</span>
              <span className="opacity-50">|</span>
              <span className="max-w-xl text-white/70">
                {descriptions[activeNav.name] ??
                  'Operate securely across the SUZAA network with full administrative control.'}
              </span>
            </div>
          </header>

          <main className="relative -mt-10 flex-1 overflow-y-auto px-6 pb-16">
            <div className="mx-auto w-full max-w-6xl space-y-10 rounded-3xl bg-white/85 p-8 shadow-[0_50px_120px_-60px_rgba(11,17,31,0.42)] backdrop-blur">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
