'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/api';

interface PaymentRequest {
  id: string;
  linkId: string;
  orderNumber: number;
  amountFiat: number;
  currencyFiat: string;
  description: string | null;
  status: string;
  createdBy: string;
  settlementStatus: string;
  createdAt: string;
  expiresAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/dashboard');
      return;
    }
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const response = await api.get('/payments/requests');
      setOrders(response.data.data || []);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateSettlementStatus(id: string, status: string) {
    try {
      setUpdatingStatus(id);
      await api.patch(`/payments/requests/${id}/settlement`, { settlementStatus: status });
      await fetchOrders();
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return order.status === 'ACTIVE';
    if (filter === 'expired') return order.status === 'EXPIRED';
    return true;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Requests</h1>
          <p className="text-gray-600">Manage and track all your payment requests</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchOrders} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">↻ Refresh</button>
          <button onClick={() => router.push('/dashboard/orders/create')} className="btn-primary">+ Create New Request</button>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>All</button>
        <button onClick={() => setFilter('active')} className={`px-4 py-2 rounded-lg ${filter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Active</button>
        <button onClick={() => setFilter('expired')} className={`px-4 py-2 rounded-lg ${filter === 'expired' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Expired</button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left p-4 font-medium text-gray-700">Order ID</th>
              <th className="text-left p-4 font-medium text-gray-700">Amount</th>
              <th className="text-left p-4 font-medium text-gray-700">Description</th>
              <th className="text-left p-4 font-medium text-gray-700">Created By</th>
              <th className="text-left p-4 font-medium text-gray-700">Status</th>
              <th className="text-left p-4 font-medium text-gray-700">Settlement</th>
              <th className="text-left p-4 font-medium text-gray-700">Created</th>
              <th className="text-left p-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.map(order => (
              <tr key={order.id} onClick={() => router.push(`/dashboard/orders/view/${order.id}`)} className="hover:bg-gray-50 cursor-pointer">
                <td className="p-4"><span className="font-mono text-sm">{order.linkId}</span></td>
                <td className="p-4 font-semibold">${order.amountFiat} {order.currencyFiat}</td>
                <td className="p-4 text-gray-600">{order.description || '-'}</td>
                <td className="p-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{order.createdBy}</span></td>
                <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{order.status}</span></td>
                <td className="p-4">
                  <select value={order.settlementStatus} onChange={(e) => updateSettlementStatus(order.id, e.target.value)} disabled={updatingStatus === order.id} className="text-xs border border-gray-300 rounded px-2 py-1">
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="SETTLED">Settled</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="REISSUED">Re-issued</option>
                  </select>
                </td>
                <td className="p-4 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="p-4"><a href={`http://116.203.195.248:3001/${order.linkId}`} target="_blank" className="text-blue-600 hover:underline">View</a></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && <div className="text-center py-12 text-gray-500">No payment requests found</div>}
      </div>
    </div>
  );
}
