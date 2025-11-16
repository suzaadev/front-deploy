'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, type ApiError } from '@/app/lib/api';
import { PAYMENT_PORTAL_BASE_URL } from '@/app/lib/config';
import { useAuth } from '@/app/contexts/AuthContext';

interface Settings {
  businessName: string;
  email: string;
  slug: string;
  phoneNumber: string | null;
  defaultCurrency: string;
  timezone: string;
  allowUnsolicitedPayments: boolean;
  maxBuyerOrdersPerHour: number;
  defaultPaymentExpiryMinutes: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const { user, merchant, loading: authLoading, merchantLoading, signOut, refreshMerchant } = useAuth();
  const canManage = useMemo(
    () => Boolean(!authLoading && !merchantLoading && user && merchant),
    [authLoading, merchantLoading, user, merchant],
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/dashboard');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!canManage) {
      if (!merchantLoading && merchant === null) {
        setLoading(false);
      }
      return;
    }

    if (merchant) {
      setSettings({
        businessName: merchant.businessName,
        email: merchant.email,
        slug: merchant.slug,
        phoneNumber: merchant.phoneNumber || null,
        defaultCurrency: merchant.defaultCurrency,
        timezone: merchant.timezone,
        allowUnsolicitedPayments: merchant.allowUnsolicitedPayments,
        maxBuyerOrdersPerHour: merchant.maxBuyerOrdersPerHour,
        defaultPaymentExpiryMinutes: merchant.defaultPaymentExpiryMinutes ?? 60,
      });
    }
    setLoading(false);
  }, [canManage, merchant, merchantLoading]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!settings) return;
    
    try {
      setSaving(true);
      // Validate phone number if provided
      if (settings.phoneNumber && settings.phoneNumber.trim() !== '') {
        const phoneRegex = /^\d+$/;
        if (!phoneRegex.test(settings.phoneNumber.trim())) {
          setError('Phone number must contain only numbers');
          return;
        }
        if (settings.phoneNumber.trim().length < 7 || settings.phoneNumber.trim().length > 20) {
          setError('Phone number must be between 7 and 20 digits');
          return;
        }
      }

      const response = await api.patch('/merchants/me', {
        phoneNumber: settings.phoneNumber?.trim() || null,
        defaultCurrency: settings.defaultCurrency,
        timezone: settings.timezone,
        allowUnsolicitedPayments: settings.allowUnsolicitedPayments,
        maxBuyerOrdersPerHour: settings.maxBuyerOrdersPerHour,
        defaultPaymentExpiryMinutes: settings.defaultPaymentExpiryMinutes,
      });
      
      // Update settings with the response data (especially slug which may have changed)
      if (response.data?.data) {
        setSettings({
          ...settings,
          slug: response.data.data.slug,
          phoneNumber: response.data.data.phoneNumber,
        });
      }
      
      // Refresh merchant data to ensure everything is in sync
      await refreshMerchant();
      
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError?.payload?.error || apiError?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmation !== 'delete') {
      setDeleteError('Please type "delete" to confirm');
      return;
    }

    try {
      setDeleting(true);
      setDeleteError('');
      // Use request method to ensure body is sent correctly with DELETE
      await api.request({
        method: 'DELETE',
        url: '/merchants/me',
        data: { confirmation: 'delete' }
      });
      await signOut();
      router.push('/dashboard');
    } catch (error) {
      const apiError = error as ApiError;
      setDeleteError(apiError?.payload?.error || apiError?.message || 'Failed to delete account');
      setDeleting(false);
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
                <a href={`${PAYMENT_PORTAL_BASE_URL}/recipient/${settings.slug}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">View Portal</a>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Public portal: {PAYMENT_PORTAL_BASE_URL}/recipient/{settings.slug}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="text"
                value={settings.phoneNumber || ''}
                onChange={(e) => {
                  // Only allow numbers
                  const value = e.target.value.replace(/\D/g, '');
                  setSettings({ ...settings, phoneNumber: value || null });
                }}
                placeholder="12023831234"
                className="input"
                inputMode="numeric"
                maxLength={20}
              />
              <p className="text-xs text-gray-500 mt-1">
                Include country code (WhatsApp style). Example: 12023831234 for US number
              </p>
              <p className="text-xs text-blue-600 mt-2 font-medium">
                💡 When you add a phone number, it becomes your public slug. Removing it reverts to your original 6-digit code.
              </p>
            </div>
          </div>

          <div className="mb-6 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Settings</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
              <select value={settings.defaultCurrency} onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })} className="input">
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Currency for payment requests</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <select value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} className="input">
                <option value="UTC">UTC - Coordinated Universal Time</option>
                <option value="America/New_York">EST - Eastern Time</option>
                <option value="America/Chicago">CST - Central Time</option>
                <option value="America/Denver">MST - Mountain Time</option>
                <option value="America/Los_Angeles">PST - Pacific Time</option>
                <option value="Europe/London">GMT - London</option>
                <option value="Europe/Paris">CET - Paris</option>
                <option value="Europe/Berlin">CET - Berlin</option>
                <option value="Asia/Tokyo">JST - Tokyo</option>
                <option value="Asia/Dubai">GST - Dubai</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Used for displaying dates and times</p>
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
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Default payment expiry</label>
              <select
                value={settings.defaultPaymentExpiryMinutes}
                onChange={(e) => setSettings({ ...settings, defaultPaymentExpiryMinutes: parseInt(e.target.value, 10) })}
                className="input"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={120}>120 minutes</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Determines the pre-filled expiry when you create new payment links.
              </p>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Settings'}</button>
        </form>
      </div>

      <div className="bg-white rounded-lg border border-red-200 p-6 max-w-2xl mt-8">
        <h2 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-600 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
        >
          Delete Account
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-red-900 mb-2">Delete Account</h3>
            <p className="text-sm text-gray-600 mb-4">
              This action is <strong>final and cannot be undone</strong>. All your data, payment requests, wallets, and settings will be permanently deleted.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <strong>"delete"</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="input w-full"
                placeholder="delete"
                autoFocus
              />
            </div>
            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{deleteError}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmation !== 'delete'}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                  setDeleteError('');
                }}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
