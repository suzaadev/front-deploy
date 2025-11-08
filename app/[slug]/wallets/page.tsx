'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Copy, CheckCircle } from 'lucide-react';

interface Wallet {
  network: string;
  tokenSymbol: string;
  tokenName: string | null;
  tokenType: string;
  walletAddress: string;
  contractAddress: string | null;
  createdAt: string;
}

interface WalletsData {
  merchant: {
    name: string;
    slug: string;
  };
  wallets: Wallet[];
}

export default function PublicWalletsPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [data, setData] = useState<WalletsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedAddress, setCopiedAddress] = useState('');

  useEffect(() => { fetchWallets(); }, [slug]);

  async function fetchWallets() {
    try {
      setLoading(true);
      const response = await fetch(`http://116.203.195.248:3000/public/wallets/${slug}`);
      if (!response.ok) throw new Error('Merchant not found');
      const result = await response.json();
      setData(result.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load wallets');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string, type: string) {
    navigator.clipboard.writeText(text);
    setCopiedAddress(`${type}-${text}`);
    setTimeout(() => setCopiedAddress(''), 2000);
  }

  function getNetworkColor(network: string): string {
    const colors: Record<string, string> = {
      'SOLANA': 'bg-purple-100 text-purple-800 border-purple-200',
      'ETHEREUM': 'bg-blue-100 text-blue-800 border-blue-200',
      'BITCOIN': 'bg-orange-100 text-orange-800 border-orange-200',
      'POLYGON': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };
    return colors[network] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  function getNetworkIcon(network: string): string {
    const icons: Record<string, string> = {
      'SOLANA': '◎',
      'ETHEREUM': 'Ξ',
      'BITCOIN': '₿',
      'POLYGON': '⬡',
    };
    return icons[network] || '?';
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white mb-8 shadow-lg">
          <h1 className="text-3xl font-bold mb-2">{data.merchant.name}</h1>
          <p className="text-lg opacity-90">Payment Wallets</p>
          <p className="text-sm opacity-75 mt-2">Verified wallet addresses for secure payments</p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            🔒 <strong>Security:</strong> Always verify wallet addresses match the ones listed here before sending payments. 
            This public page helps you confirm you're sending to the correct addresses.
          </p>
        </div>

        {/* Wallets List */}
        {data.wallets.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 text-center py-12">
            <p className="text-gray-600">No active wallets available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.wallets.map((wallet, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                {/* Network & Token Header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{getNetworkIcon(wallet.network)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${getNetworkColor(wallet.network)}`}>
                        {wallet.network}
                      </span>
                      <span className="px-3 py-1 rounded-lg text-sm font-bold bg-gray-900 text-white">
                        {wallet.tokenSymbol}
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                        {wallet.tokenType}
                      </span>
                    </div>
                    {wallet.tokenName && (
                      <p className="text-sm text-gray-600">{wallet.tokenName}</p>
                    )}
                  </div>
                </div>

                {/* Wallet Address */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Wallet Address
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-50 border border-gray-300 rounded-lg p-3 font-mono text-sm break-all">
                      {wallet.walletAddress}
                    </div>
                    <button
                      onClick={() => copyToClipboard(wallet.walletAddress, 'wallet')}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      {copiedAddress === `wallet-${wallet.walletAddress}` ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span className="hidden sm:inline">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Contract Address (if exists) */}
                {wallet.contractAddress && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      Token Contract Address
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-amber-50 border border-amber-300 rounded-lg p-3 font-mono text-sm break-all">
                        {wallet.contractAddress}
                      </div>
                      <button
                        onClick={() => copyToClipboard(wallet.contractAddress!, 'contract')}
                        className="px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
                      >
                        {copiedAddress === `contract-${wallet.contractAddress}` ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span className="hidden sm:inline">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-amber-700 mt-2">
                      ⚠️ Important: Use this contract address when sending {wallet.tokenSymbol} tokens
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Added: {data.wallets.length} wallet{data.wallets.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-gray-400 mt-2">Powered by <strong>Suzaa</strong></p>
        </div>
      </div>
    </div>
  );
}
