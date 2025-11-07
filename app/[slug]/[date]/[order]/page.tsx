'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import { Copy } from 'lucide-react';

interface PaymentData {
  linkId: string;
  orderNumber: string;
  amountUsd: number;
  currency: string;
  description: string;
  status: string;
  expiresAt: string;
  merchant: { name: string; slug: string; };
  wallets: Array<{
    id: string;
    blockchain: string;
    address: string;
    symbol: string;
    cryptoAmount: number;
    coinPrice: number;
  }>;
}

export default function PaymentPage() {
  const params = useParams();
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
      setPayment(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load payment');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert('Copied!');
  }

  function getSolanaUri(addr: string, amt: number, memo: string) {
    return `solana:${addr}?amount=${amt}&memo=${memo}`;
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

  const wallet = payment.wallets[0];
  const isExpired = payment.status === 'EXPIRED';
  const solanaUri = wallet?.blockchain === 'SOLANA' 
    ? getSolanaUri(wallet.address, wallet.cryptoAmount, payment.orderNumber) 
    : wallet?.address || '';

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs opacity-90">Payment Request</p>
              <h1 className="text-lg font-bold">from {payment.merchant.name}</h1>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-90">Amount</p>
              <p className="text-xl font-bold">{payment.currency} {payment.amountUsd}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-b-xl shadow p-4">
          {isExpired ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm font-medium">This payment has expired</p>
            </div>
          ) : !wallet ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-800 text-sm font-medium">No wallets configured</p>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-2">Payment Instructions</h2>
                <a 
                  href={solanaUri} 
                  className="block w-full bg-purple-600 text-white py-3 rounded-lg text-center font-medium mb-3 hover:bg-purple-700"
                >
                  Pay with Wallet
                </a>
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3">
                  <p className="text-xs text-green-800">
                    <strong>Recommended:</strong> Scan QR code below. Auto-fills address, amount, and memo.
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-900 font-medium mb-1">How to pay</p>
                <ol className="text-xs text-blue-800 space-y-0.5 list-decimal list-inside">
                  <li>Scan QR or copy wallet address</li>
                  <li>Send exact {wallet.symbol} amount</li>
                  <li>Payment auto-detected</li>
                </ol>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Amount to Send</h3>
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {wallet.cryptoAmount.toFixed(6)} {wallet.symbol}
                    </p>
                    <p className="text-xs text-gray-500">Approx {payment.currency} {payment.amountUsd}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(wallet.cryptoAmount.toFixed(6))} 
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Scan QR Code</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center mb-3">
                  <p className="text-xs text-green-800 font-medium">Best for Mobile</p>
                  <p className="text-xs text-green-700">QR auto-fills payment details</p>
                </div>
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4 flex justify-center mb-2">
                  <QRCodeCanvas value={solanaUri} size={240} level="H" />
                </div>
                <p className="text-center text-xs text-gray-600 mb-2">
                  Scan with Phantom, Solflare, Backpack
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-center">
                  <p className="text-blue-800">
                    {wallet.cryptoAmount.toFixed(4)} {wallet.symbol} • Order: {payment.orderNumber}
                  </p>
                </div>
              </div>
              
              {wallet.blockchain === 'SOLANA' && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Solana Memo (Optional)</h3>
                  <p className="text-xs text-gray-600 mb-2">Helps match payment to order</p>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={payment.orderNumber} 
                      readOnly 
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-center" 
                    />
                    <button 
                      onClick={() => copyToClipboard(payment.orderNumber)} 
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Wallet Address</h3>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={wallet.address} 
                    readOnly 
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs" 
                  />
                  <button 
                    onClick={() => copyToClipboard(wallet.address)} 
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800 font-medium mb-1">Important</p>
                <ul className="text-xs text-yellow-800 space-y-0.5 list-disc list-inside">
                  <li>Send only {wallet.symbol} on {wallet.blockchain}</li>
                  <li>Double-check address</li>
                  <li>Transactions are irreversible</li>
                </ul>
              </div>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">Expires: {new Date(payment.expiresAt).toLocaleString()}</p>
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
