'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function MerchantPortalPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [activeTab, setActiveTab] = useState<'lookup' | 'create'>('lookup');
  const [lookupNumber, setLookupNumber] = useState('');
  const [createAmount, setCreateAmount] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!lookupNumber.trim()) return;
    
    // For now, just navigate to a likely URL pattern
    // The order number needs to be padded to 4 digits
    const paddedOrder = lookupNumber.padStart(4, '0');
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    router.push(`/${slug}/${today}/${paddedOrder}`);
  }

  async function handleCreatePayment(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    const amount = parseFloat(createAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('http://116.203.195.248:3000/public/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantSlug: slug,
          amount: amount,
          description: createDescription || undefined,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create payment');
      }
      
      const data = await response.json();
      router.push(`/${data.data.linkId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-6 text-center text-white">
          <h1 className="text-2xl font-bold mb-1">{slug}</h1>
          <p className="text-sm opacity-90">Payment Portal</p>
        </div>

        <div className="bg-white border-b border-gray-200 flex">
          <button
            onClick={() => setActiveTab('lookup')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'lookup'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Lookup Payment
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'create'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Create Payment
          </button>
        </div>

        <div className="bg-white rounded-b-2xl shadow-lg p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {activeTab === 'lookup' ? (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Lookup Your Payment</h2>
              <p className="text-sm text-gray-600 mb-6">
                Enter your order number to view and complete your payment
              </p>

              <form onSubmit={handleLookup}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Number
                  </label>
                  <input
                    type="text"
                    value={lookupNumber}
                    onChange={(e) => setLookupNumber(e.target.value)}
                    placeholder="e.g., 1, 0001, 0042"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Enter the order number from your invoice
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  Find My Payment
                </button>
              </form>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-900 font-medium mb-2">ℹ️ How it works</p>
                <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Enter your order number above</li>
                  <li>View your payment details and amount</li>
                  <li>Complete payment using cryptocurrency</li>
                </ol>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Create Payment</h2>
              <p className="text-sm text-gray-600 mb-6">
                Request a payment from {slug}
              </p>

              <form onSubmit={handleCreatePayment}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (USD) *
                  </label>
                  <input
                    type="text"
                    value={createAmount}
                    onChange={(e) => setCreateAmount(e.target.value)}
                    placeholder="100.00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                    placeholder="e.g., Invoice payment for services"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Payment Request'}
                </button>
              </form>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-900 font-medium mb-2">ℹ️ How it works</p>
                <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Enter the payment amount</li>
                  <li>Add an optional description</li>
                  <li>Get a payment link with QR code</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        <p className="text-center mt-6 text-xs text-gray-600">
          Powered by <strong>Suzaa</strong>
        </p>
      </div>
    </div>
  );
}
