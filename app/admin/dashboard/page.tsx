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
      const adminToken = localStorage.getItem("adminToken");
      const response = await adminApi.get('/admin/stats', {
        
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Total Merchants</p>
          <p className="text-3xl font-bold text-gray-900">{stats?.totalMerchants || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Active Merchants</p>
          <p className="text-3xl font-bold text-green-600">{stats?.activeMerchants || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Suspended</p>
          <p className="text-3xl font-bold text-red-600">{stats?.suspendedMerchants || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Total Payments</p>
          <p className="text-3xl font-bold text-blue-600">{stats?.totalPayments || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/admin/merchants" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <p className="font-semibold text-gray-900">Manage Merchants</p>
            <p className="text-sm text-gray-600 mt-1">View and manage all merchants</p>
          </a>
          <a href="/admin/settings" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <p className="font-semibold text-gray-900">System Settings</p>
            <p className="text-sm text-gray-600 mt-1">Configure platform settings</p>
          </a>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <p className="font-semibold text-gray-900">View Logs</p>
            <p className="text-sm text-gray-600 mt-1">System activity logs</p>
          </button>
        </div>
      </div>
    </div>
  );
}
