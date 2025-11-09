'use client';

import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, CreditCard, Wallet, Plug, Settings, LogOut } from 'lucide-react';

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
    { name: 'Overview', href: '/dashboard/overview', icon: LayoutDashboard },
    { name: 'Payment Requests', href: '/dashboard/orders', icon: CreditCard },
    { name: 'Wallets', href: '/dashboard/wallets', icon: Wallet },
    { name: 'Plugins', href: '/dashboard/plugins', icon: Plug },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const activeNav =
    navigation.find((item) => pathname?.startsWith(item.href)) ?? navigation[0];

  const descriptions: Record<string, string> = {
    Overview: 'Monitor settlement health, payment velocity, and account activity.',
    'Payment Requests': 'Create, track, and reconcile payment links in real time.',
    Wallets: 'Manage settlement wallets and destinations for your payouts.',
    Plugins: 'Activate blockchain plugins and expand your settlement rails.',
    Settings: 'Configure merchant preferences, notifications, and members.',
  };

  if (pathname === '/dashboard') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[var(--suzaa-surface-subtle)]">
      <aside className="nav-rail px-5 pb-8 pt-10">
        <div className="mb-12 flex items-center gap-3 px-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--suzaa-blue)] text-lg font-semibold text-white shadow-soft">
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
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={isActive ? 'nav-link-active' : 'nav-link'}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-8 rounded-2xl border border-[var(--suzaa-border)] bg-white p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--suzaa-muted)]">
            Session
          </p>
          <p className="mt-2 text-sm text-[var(--suzaa-muted)]">
            Sign out securely to protect your merchant workspace.
          </p>
          <button
            onClick={handleLogout}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-[rgba(11,17,31,0.04)] px-4 py-2 text-sm font-semibold text-[var(--suzaa-muted-dark)] transition-all duration-200 hover:border-[var(--suzaa-border)] hover:bg-[rgba(11,17,31,0.08)]"
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
              <span className="font-semibold text-white">Merchant Dashboard</span>
              <span className="opacity-50">|</span>
              <span className="font-semibold text-white">{activeNav.name}</span>
              <span className="opacity-50">|</span>
              <span className="max-w-xl text-white/70">
                {descriptions[activeNav.name] ??
                  'Operate with confidence. Manage payments, wallets, and plugins from a single secure workspace.'}
              </span>
            </div>
          </header>

          <main className="relative -mt-10 flex-1 overflow-y-auto px-6 pb-16">
            <div className="mx-auto w-full max-w-6xl space-y-10 rounded-3xl bg-white/85 p-8 shadow-[0_50px_120px_-60px_rgba(11,17,31,0.38)] backdrop-blur">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
