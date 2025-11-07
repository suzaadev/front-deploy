'use client';

import { useEffect, useState } from 'react';
import { api } from '@/app/lib/api';

interface Merchant {
  id: string;
  email: string;
  businessName: string;
  slug: string;
  status: string;
  createdAt: string;
  emailVerified: boolean;
}

export default function AdminMerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMerchants();
  }, []);

  async function fetchMerchants() {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await api.get('/admin/merchants', {
        headers: { Authorization: 'Bearer ' + token }
      });
      setMerchants(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch merchants:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSuspend(id: string) {
    if (!confirm('Are you sure you want to suspend this merchant?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await api.post('/admin/merchants/' + id + '/suspend', {}, {
        headers: { Authorization: 'Bearer ' + token }
      });
      alert('Merchant suspended');
      fetchMerchants();
    } catch (error: any) {
      alert('Failed: ' + (error.response?.data?.error || 'Unknown error'));
    }
  }

  async function handleUnsuspend(id: string) {
    try {
      const token = localStorage.getItem('adminToken');
      await api.post('/admin/merchants/' + id + '/unsuspend', {}, {
        headers: { Authorization: 'Bearer ' + token }
      });
      alert('Merchant unsuspended');
      fetchMerchants();
    } catch (error: any) {
      alert('Failed: ' + (error.response?.data?.error || 'Unknown error'));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('⚠️ DANGER: Delete this merchant permanently? This cannot be undone!')) return;
    if (!confirm('Are you ABSOLUTELY sure? All their data will be deleted!')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await api.delete('/admin/merchants/' + id, {
        headers: { Authorization: 'Bearer ' + token }
      });
      alert('Merchant deleted');
      fetchMerchants();
    } catch (error: any) {
      alert('Failed: ' + (error.response?.data?.error || 'Unknown error'));
    }
  }

  const filteredMerchants = merchants.filter(m => {
    if (filter === 'active') return m.status === 'active';
    if (filter === 'suspended') return m.status === 'suspended';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Merchant Management</h1>
        <button onClick={fetchMerchants} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          ↻ Refresh
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        <button onClick={() => setFilter('all')} className={'px-4 py-2 rounded-lg ' + (filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700')}>
          All ({merchants.length})
        </button>
        <button onClick={() => setFilter('active')} className={'px-4 py-2 rounded-lg ' + (filter === 'active' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700')}>
          Active ({merchants.filter(m => m.status === 'active').length})
        </button>
        <button onClick={() => setFilter('suspended')} className={'px-4 py-2 rounded-lg ' + (filter === 'suspended' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700')}>
          Suspended ({merchants.filter(m => m.status === 'suspended').length})
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left p-4 font-medium text-gray-700">Business Name</th>
              <th className="text-left p-4 font-medium text-gray-700">Email</th>
              <th className="text-left p-4 font-medium text-gray-700">Slug</th>
              <th className="text-left p-4 font-medium text-gray-700">Status</th>
              <th className="text-left p-4 font-medium text-gray-700">Created</th>
              <th className="text-left p-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredMerchants.map(merchant => (
              <tr key={merchant.id} className="hover:bg-gray-50">
                <td className="p-4 font-semibold">{merchant.businessName}</td>
                <td className="p-4">{merchant.email}</td>
                <td className="p-4"><span className="font-mono text-sm">{merchant.slug}</span></td>
                <td className="p-4">
                  <span className={'px-3 py-1 rounded-full text-xs font-medium ' + (
                    merchant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  )}>
                    {merchant.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-600">{new Date(merchant.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {merchant.status === 'active' ? (
                      <button onClick={() => handleSuspend(merchant.id)} className="text-xs px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200">
                        Suspend
                      </button>
                    ) : (
                      <button onClick={() => handleUnsuspend(merchant.id)} className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200">
                        Unsuspend
                      </button>
                    )}
                    <button onClick={() => handleDelete(merchant.id)} className="text-xs px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredMerchants.length === 0 && (
          <div className="text-center py-12 text-gray-500">No merchants found</div>
        )}
      </div>
    </div>
  );
}
