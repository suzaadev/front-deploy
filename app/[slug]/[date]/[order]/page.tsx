'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

interface PaymentData {
  linkId: string;
  orderNumber: string;
  amountUsd: number;
  currency: string;
  description: string;
  status: string;
  expiresAt: string;
  merchant: { name: string; slug: string; };
  availableOptions: Array<{ network: string; token: string; }>;
}

export default function ChainSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const date = params.date as string;
  const order = params.order as string;
  const linkId = `${slug}/${date}/${order}`;
  
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchPayment(); }, [linkId]);

  async function fetchPayment() {
    try {
      setLoading(true);
      const response = await fetch(`http://116.203.195.248:3000/public/payment/${linkId}`);
      if (!response.ok) throw new Error('Payment not found');
      const data = await response.json();
      const paymentData = data.data;
      setPayment(paymentData);
      
      // Auto-redirect if only one network+token combination available
      if (paymentData.availableOptions && paymentData.availableOptions.length === 1) {
        const option = paymentData.availableOptions[0];
        router.push(`/${slug}/${date}/${order}/${option.network.toLowerCase()}/${option.token.toLowerCase()}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load payment');
    } finally {
      setLoading(false);
    }
  }

  function getNetworkDisplayName(network: string): string {
    const names: Record<string, string> = {
      'SOLANA': 'Solana',
      'ETHEREUM': 'Ethereum',
      'BITCOIN': 'Bitcoin',
      'POLYGON': 'Polygon',
    };
    return names[network] || network;
  }

  function getNetworkColor(network: string): string {
    const colors: Record<string, string> = {
      'SOLANA': 'from-purple-500 to-purple-600',
      'ETHEREUM': 'from-blue-500 to-blue-600',
      'BITCOIN': 'from-orange-500 to-orange-600',
      'POLYGON': 'from-indigo-500 to-indigo-600',
    };
    return colors[network] || 'from-gray-500 to-gray-600';
  }

  function handleOptionSelect(network: string, token: string) {
    router.push(`/${slug}/${date}/${order}/${network.toLowerCase()}/${token.toLowerCase()}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const isExpired = payment.status === 'EXPIRED';

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-xl p-6 text-white">
          <div className="text-center">
            <p className="text-sm opacity-90 mb-1">Payment Request</p>
            <h1 className="text-2xl font-bold mb-2">{payment.merchant.name}</h1>
            <div className="bg-white/20 rounded-lg p-3 inline-block">
              <p className="text-3xl font-bold">{payment.currency} {payment.amountUsd}</p>
              <p className="text-xs opacity-90 mt-1">Order #{payment.orderNumber}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-b-xl shadow p-6">
          {isExpired ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-800 font-medium">This payment has expired</p>
            </div>
          ) : payment.availableOptions && payment.availableOptions.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-yellow-800 font-medium">No payment methods available</p>
              <p className="text-yellow-700 text-sm mt-2">Please contact the merchant</p>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2 text-center">
                Select Payment Method
              </h2>
              <p className="text-sm text-gray-600 mb-6 text-center">
                Choose which cryptocurrency you'd like to use for payment
              </p>
              
              <div className="space-y-3">
                {payment.availableOptions.map((option) => (
                  <button
                    key={`${option.network}-${option.token}`}
                    onClick={() => handleOptionSelect(option.network, option.token)}
                    className={`w-full bg-gradient-to-r ${getNetworkColor(option.network)} text-white rounded-xl p-4 hover:shadow-lg transition-all duration-200 flex items-center justify-between group`}
                  >
                    <div className="text-left">
                      <p className="font-bold text-lg">{getNetworkDisplayName(option.network)} {option.token}</p>
                      <p className="text-sm opacity-90">Pay with {option.token} on {getNetworkDisplayName(option.network)}</p>
                    </div>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
              
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-900 font-medium mb-2">What happens next?</p>
                <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Select your preferred cryptocurrency</li>
                  <li>You'll see payment details and QR code</li>
                  <li>Send the exact amount shown</li>
                  <li>Payment is auto-detected</li>
                </ol>
              </div>
            </div>
          )}
          
          {payment.description && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 font-medium mb-1">Payment Details:</p>
              <p className="text-sm text-gray-700">{payment.description}</p>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Expires: {new Date(payment.expiresAt).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Secured by Suzaa</p>
          </div>
        </div>
      </div>
      
      <p className="text-center mt-4 text-xs text-gray-600">
        Powered by <strong>Suzaa</strong>
      </p>
    </div>
  );
}
