'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react';
import { adminSupabase } from '@/app/lib/adminSupabase';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await adminSupabase.auth.getUser();
    if (!user) {
      router.push('/admin');
    } else {
      setUser(user);
    }
  }

  async function handleLogout() {
    await adminSupabase.auth.signOut();
    router.push('/admin');
  }

  const navigation = [
    { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Merchants', href: '/admin/dashboard/merchants', icon: Users },
    { name: 'Settings', href: '/admin/dashboard/settings', icon: Settings },
  ];

  const activeNav = navigation.find((item) => pathname?.startsWith(item.href)) ?? navigation[0];

  const descriptions: Record<string, string> = {
    Overview: 'System-wide pulse of payment volumes, risk alerts, and activity.',
    Merchants: 'Approve, suspend, and govern merchant accounts.',
    Settings: 'Configure super-admin controls and operational policies.',
  };

  return (
    <div className="flex min-h-screen bg-[var(--suzaa-surface-subtle)]">
      <aside className="nav-rail px-5 pb-8 pt-10">
        <div className="mb-12 flex items-center gap-3 px-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--suzaa-navy)] text-lg font-semibold text-white shadow-soft">Σ</div>
          <div><p className="text-sm font-semibold text-[var(--suzaa-navy)]">SUZAA</p><p className="text-[0.65rem] uppercase tracking-[0.28em] text-[var(--suzaa-muted)]">Super Admin</p></div>
        </div>
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (<a key={item.name} href={item.href} className={isActive ? 'nav-link-active' : 'nav-link'}><Icon className="h-5 w-5" />{item.name}</a>);
          })}
        </nav>
        <div className="mt-8 rounded-2xl border border-[var(--suzaa-border)] bg-white p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--suzaa-muted)]">Session</p>
          <p className="mt-2 text-sm text-[var(--suzaa-muted)]">Sign out securely when leaving the admin panel.</p>
          <button onClick={handleLogout} className="btn-ghost mt-4 w-full justify-center border border-[var(--suzaa-border)] bg-[var(--suzaa-surface-muted)]"><LogOut className="h-4 w-4" />Logout</button>
        </div>
      </aside>
      <div className="flex-1 overflow-hidden">
        <header className="sticky top-0 z-10 border-b border-[var(--suzaa-border)] bg-white/95 px-10 py-8 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.32em] text-[var(--suzaa-muted)]">Super Admin Dashboard</p>
          <div className="mt-3"><h1 className="text-3xl font-semibold text-[var(--suzaa-navy)]">{activeNav.name}</h1><p className="mt-2 max-w-2xl text-sm text-[var(--suzaa-muted)]">{descriptions[activeNav.name]}</p></div>
        </header>
        <main className="flex-1 overflow-y-auto px-6 pb-12 pt-10"><div className="mx-auto w-full max-w-6xl space-y-10">{children}</div></main>
      </div>
    </div>
  );
}
