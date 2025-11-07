'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/app/lib/api';

interface PaymentRequest {
  id: string;
  linkId: string;
  orderNumber: number;
  orderDate: string;
  amountFiat: number;
  currencyFiat: string;
  description: string | null;
  status: string;
  originalStatus: string;
  createdBy: string;
  createdByIp: string | null;
  buyerNote: string | null;
  settlementStatus: string;
  expiryMinutes: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function PaymentRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [payment, setPayment] = useState<PaymentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchPaymentDetails();
    }
  }, [params.id]);

  async function fetchPaymentDetails() {
    try {
      setLoading(true);
      const response = await api.get('/payments/requests');
      const allPayments = response.data.data || [];
      const found = allPayments.find((p: any) => p.id === params.id);
      
      if (found) {
        setPayment(found);
      } else {
        alert('Payment request not found');
        router.push('/dashboard/orders');
      }
    } catch (error) {
      alert('Failed to load payment details');
      router.push('/dashboard/orders');
    } finally {
      setLoading(false);
    }
  }

  function copyPaymentLink() {
    if (!payment) return;
    const url = 'http://116.203.195.248:3001/' + payment.linkId;
    try {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Copy failed. URL: ' + url);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!payment) return null;

  const paymentUrl = 'http://116.203.195.248:3001/' + payment.linkId;
  const isExpired = new Date() > new Date(payment.expiresAt);
  const timeRemaining = isExpired ? 'Expired' : getTimeRemaining(payment.expiresAt);

  return (
    <div className="p-8">
      <div className="mb-6">
        <button onClick={() => router.push('/dashboard/orders')} className="text-blue-600 hover:underline mb-4">
          ← Back to Payment Requests
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Request Details</h1>
            <p className="text-gray-600">Order ID: {payment.linkId}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={copyPaymentLink} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              {copied ? '✓ Copied!' : '📋 Copy Link'}
            </button>
            <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              View Payment Page
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-2xl font-bold text-gray-900">${payment.amountFiat} {payment.currencyFiat}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={'inline-block px-3 py-1 rounded-full text-sm font-medium ' + (
                  payment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                )}>
                  {payment.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="font-mono text-gray-900">#{payment.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created By</p>
                <p className="text-gray-900 capitalize">{payment.createdBy}</p>
              </div>
            </div>
            {payment.description && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-gray-900 mt-1">{payment.description}</p>
              </div>
            )}
            {payment.buyerNote && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Buyer Note</p>
                <p className="text-gray-900 mt-1">{payment.buyerNote}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Payment Request Created</p>
                  <p className="text-sm text-gray-600">{new Date(payment.createdAt).toLocaleString()}</p>
                  {payment.createdByIp && <p className="text-xs text-gray-500">IP: {payment.createdByIp}</p>}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className={'w-2 h-2 rounded-full mt-2 ' + (isExpired ? 'bg-red-600' : 'bg-green-600')} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{isExpired ? 'Expired' : 'Expires'}</p>
                  <p className="text-sm text-gray-600">{new Date(payment.expiresAt).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{timeRemaining}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Last Updated</p>
                  <p className="text-sm text-gray-600">{new Date(payment.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Link</h2>
            <div className="bg-gray-50 p-3 rounded border border-gray-200 font-mono text-sm break-all">
              {paymentUrl}
            </div>
            <p className="text-xs text-gray-500 mt-2">Share this link with your customer to receive payment</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Settlement Status</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-2">Current Status</p>
                <span className={'inline-block px-3 py-1 rounded-full text-sm font-medium ' + (
                  payment.settlementStatus === 'SETTLED' ? 'bg-green-100 text-green-800' :
                  payment.settlementStatus === 'PAID' ? 'bg-blue-100 text-blue-800' :
                  payment.settlementStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  payment.settlementStatus === 'REISSUED' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                )}>
                  {payment.settlementStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Expiry Time</span>
                <span className="text-sm font-medium text-gray-900">{payment.expiryMinutes} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Order Date</span>
                <span className="text-sm font-medium text-gray-900">{payment.orderDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payment ID</span>
                <span className="text-sm font-mono text-gray-900">{payment.id.slice(0, 8)}...</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-2">
              <button onClick={() => window.open(paymentUrl, '_blank')} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                Open Payment Page
              </button>
              <button onClick={copyPaymentLink} className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                Copy Payment Link
              </button>
              <button onClick={fetchPaymentDetails} className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                Refresh Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTimeRemaining(expiresAt: string): string {
  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;

  if (diff < 0) return 'Expired';

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return days + 'd ' + (hours % 24) + 'h remaining';
  if (hours > 0) return hours + 'h ' + (minutes % 60) + 'm remaining';
  return minutes + 'm remaining';
}
