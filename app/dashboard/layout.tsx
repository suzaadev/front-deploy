'use client';

import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, CreditCard, Wallet, Puzzle, Settings, LogOut } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    localStorage.removeItem('token');
    router.push('/dashboard');
  }

  const navigation = [
    { name: 'Overview', href: '/dashboard/overview', icon: LayoutDashboard, description: 'Snapshot of your recent activity across all settlement channels.' },
    { name: 'Payment Requests', href: '/dashboard/orders', icon: CreditCard, description: 'Generate, track, and reconcile customer payment links with live settlement status.' },
    { name: 'Wallets', href: '/dashboard/wallets', icon: Wallet, description: 'Manage your cryptocurrency receiving addresses and monitor balances.' },
    { name: 'Extensions', href: '/dashboard/extensions', icon: Puzzle, description: 'Discover integrations and modules that expand settlement, automation, and analytics.' },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, description: 'Configure your merchant profile, security, and payment preferences.' },
  ];

  const activeNav = navigation.find((item) => pathname?.startsWith(item.href)) ?? navigation[0];

  if (pathname === '/dashboard') {
    return <>{children}</>;
  }

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
              Merchant
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

      <div className="flex-1 overflow-hidden">
        <header className="sticky top-0 z-10 border-b border-[var(--suzaa-border)] bg-white/95 px-10 py-8 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.32em] text-[var(--suzaa-muted)]">Merchant Dashboard</p>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[var(--suzaa-navy)]">{activeNav.name}</h1>
              <p className="mt-2 max-w-2xl text-sm text-[var(--suzaa-muted)]">{activeNav.description}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 pb-12 pt-10">
          <div className="mx-auto w-full max-w-6xl space-y-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
