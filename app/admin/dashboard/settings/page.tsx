'use client';

import { useEffect, useState } from 'react';

export default function AdminSettingsPage() {
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminInfo();
  }, []);

  async function fetchAdminInfo() {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setAdmin(payload);
      }
    } catch (error) {
      console.error('Failed to fetch admin info:', error);
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
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Settings</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900">{admin?.email || 'N/A'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <span className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full">
              Super Admin
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin ID</label>
            <p className="text-gray-500 text-sm font-mono">{admin?.adminId || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform Status
            </label>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Operational</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              System Version
            </label>
            <p className="text-gray-700">SUZAA v1.0.0</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Security</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Two-Factor Authentication
            </label>
            <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
              Enabled (PIN-based)
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Login
            </label>
            <p className="text-gray-700">{new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
