'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/api';

interface Settings {
  businessName: string;
  email: string;
  slug: string;
  allowUnsolicitedPayments: boolean;
  maxBuyerOrdersPerHour: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/dashboard');
      return;
    }
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      const response = await api.get('/merchants/me');
      setSettings(response.data.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!settings) return;
    
    try {
      setSaving(true);
      await api.patch('/merchants/me', {
        allowUnsolicitedPayments: settings.allowUnsolicitedPayments,
        maxBuyerOrdersPerHour: settings.maxBuyerOrdersPerHour,
      });
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;
  }

  if (!settings) return null;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"><p className="text-green-800">{success}</p></div>}
      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"><p className="text-red-800">{error}</p></div>}

      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
        <form onSubmit={handleSave}>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
              <input type="text" value={settings.businessName} readOnly className="input bg-gray-50 cursor-not-allowed" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" value={settings.email} readOnly className="input bg-gray-50 cursor-not-allowed" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Merchant Slug</label>
              <div className="flex items-center gap-2">
                <input type="text" value={settings.slug} readOnly className="input bg-gray-50 cursor-not-allowed flex-1" />
                <a href={`http://116.203.195.248:3001/${settings.slug}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">View Portal</a>
              </div>
              <p className="text-xs text-gray-500 mt-1">Public portal: http://116.203.195.248:3001/{settings.slug}</p>
            </div>
          </div>

          <div className="mb-6 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Settings</h2>
            <div className="mb-4">
              <label className="flex items-center">
                <input type="checkbox" checked={settings.allowUnsolicitedPayments} onChange={(e) => setSettings({ ...settings, allowUnsolicitedPayments: e.target.checked })} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="ml-2 text-sm font-medium text-gray-700">Allow public payment creation</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">Anyone can create payment requests through your public portal</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Max payments per buyer per hour</label>
              <input type="number" min="1" max="100" value={settings.maxBuyerOrdersPerHour} onChange={(e) => setSettings({ ...settings, maxBuyerOrdersPerHour: parseInt(e.target.value) || 1 })} className="input" />
              <p className="text-xs text-gray-500 mt-1">Rate limit for public payment creation (1-100 per hour)</p>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Settings'}</button>
        </form>
      </div>
    </div>
  );
}
