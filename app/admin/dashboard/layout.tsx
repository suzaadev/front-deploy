'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

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

  const getLinkClass = (isActive: boolean) => {
    return isActive 
      ? 'flex items-center gap-3 px-4 py-3 rounded-lg mb-2 bg-blue-50 text-blue-600'
      : 'flex items-center gap-3 px-4 py-3 rounded-lg mb-2 text-gray-700 hover:bg-gray-50';
  };

  const isDashboard = pathname === '/admin/dashboard';
  const isMerchants = pathname?.startsWith('/admin/dashboard/merchants');
  const isSettings = pathname?.startsWith('/admin/dashboard/settings');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">SUZAA</h1>
          <p className="text-xs text-gray-500 mt-1">Super Admin</p>
        </div>

        <nav className="flex-1 p-4">
          <a href="/admin/dashboard" className={getLinkClass(isDashboard)}>
            <span>📊</span>
            <span className="font-medium">Dashboard</span>
          </a>

          <a href="/admin/dashboard/merchants" className={getLinkClass(isMerchants)}>
            <span>👥</span>
            <span className="font-medium">Merchants</span>
          </a>

          <a href="/admin/dashboard/settings" className={getLinkClass(isSettings)}>
            <span>⚙️</span>
            <span className="font-medium">Settings</span>
          </a>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
