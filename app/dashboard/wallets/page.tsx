'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/api';
import { Plus, X, Trash2 } from 'lucide-react';

interface Wallet {
  id: string;
  network: string;
  tokenSymbol: string;
  tokenName?: string;
  tokenType: string;
  tokenDecimals: number;
  contractAddress?: string;
  walletAddress: string;
  label?: string;
  enabled: boolean;
  createdAt: string;
}

export default function WalletsPage() {
  const router = useRouter();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    network: 'SOLANA',
    tokenSymbol: 'SOL',
    tokenName: '',
    tokenType: 'NATIVE',
    tokenDecimals: 9,
    contractAddress: '',
    walletAddress: '',
    label: '',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/dashboard');
      return;
    }
    
    fetchWallets();
  }, []);

  async function fetchWallets() {
    try {
      setLoading(true);
      const response = await api.get('/wallets');
      setWallets(response.data.data || []);
    } catch (error: any) {
      console.error('Fetch wallets error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAddWallet(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    if (!formData.walletAddress.trim()) {
      setError('Wallet address is required');
      return;
    }

    if (!formData.tokenSymbol.trim()) {
      setError('Token symbol is required');
      return;
    }
    
    try {
      setSaving(true);
      await api.post('/wallets', {
        network: formData.network,
        tokenSymbol: formData.tokenSymbol.trim().toUpperCase(),
        tokenName: formData.tokenName.trim() || undefined,
        tokenType: formData.tokenType,
        tokenDecimals: parseInt(formData.tokenDecimals.toString()),
        contractAddress: formData.contractAddress.trim() || undefined,
        walletAddress: formData.walletAddress.trim(),
        label: formData.label.trim() || undefined,
      });
      
      setShowAddModal(false);
      setFormData({ 
        network: 'SOLANA', 
        tokenSymbol: 'SOL', 
        tokenName: '',
        tokenType: 'NATIVE',
        tokenDecimals: 9,
        contractAddress: '',
        walletAddress: '', 
        label: '' 
      });
      fetchWallets();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to add wallet');
    } finally {
      setSaving(false);
    }
  }

  async function toggleWallet(walletId: string, enabled: boolean) {
    try {
      await api.patch(`/wallets/${walletId}`, { enabled });
      fetchWallets();
    } catch (error) {
      alert('Failed to update wallet');
    }
  }

  async function deleteWallet(walletId: string) {
    if (!confirm('Are you sure you want to delete this wallet?')) return;
    
    try {
      await api.delete(`/wallets/${walletId}`);
      fetchWallets();
    } catch (error) {
      alert('Failed to delete wallet');
    }
  }

  function getNetworkColor(network: string) {
    switch (network) {
      case 'SOLANA': return 'bg-purple-100 text-purple-800';
      case 'ETHEREUM': return 'bg-blue-100 text-blue-800';
      case 'BITCOIN': return 'bg-orange-100 text-orange-800';
      case 'POLYGON': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getNetworkIcon(network: string) {
    switch (network) {
      case 'SOLANA': return '◎';
      case 'ETHEREUM': return 'Ξ';
      case 'BITCOIN': return '₿';
      case 'POLYGON': return '⬡';
      default: return '?';
    }
  }

  function handleNetworkChange(network: string) {
    // Auto-set defaults based on network
    let defaults = { tokenSymbol: 'SOL', tokenType: 'NATIVE', tokenDecimals: 9 };
    
    switch (network) {
      case 'SOLANA':
        defaults = { tokenSymbol: 'SOL', tokenType: 'NATIVE', tokenDecimals: 9 };
        break;
      case 'ETHEREUM':
        defaults = { tokenSymbol: 'ETH', tokenType: 'NATIVE', tokenDecimals: 18 };
        break;
      case 'BITCOIN':
        defaults = { tokenSymbol: 'BTC', tokenType: 'NATIVE', tokenDecimals: 8 };
        break;
      case 'POLYGON':
        defaults = { tokenSymbol: 'MATIC', tokenType: 'NATIVE', tokenDecimals: 18 };
        break;
    }
    
    setFormData({ ...formData, network, ...defaults, contractAddress: '' });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallets</h1>
          <p className="text-gray-600">Manage your crypto wallet addresses</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Wallet
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Add wallet addresses for different blockchains and tokens. When enabled, buyers can pay using that blockchain and token.
        </p>
      </div>

      {wallets.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 text-center py-12">
          <p className="text-gray-600 mb-4">No wallets added yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Your First Wallet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.map((wallet) => (
            <div key={wallet.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getNetworkIcon(wallet.network)}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getNetworkColor(wallet.network)}`}>
                        {wallet.network}
                      </span>
                      <span className="inline-block px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-800">
                        {wallet.tokenSymbol}
                      </span>
                    </div>
                    {wallet.label && (
                      <p className="text-xs text-gray-500 mt-1">{wallet.label}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{wallet.tokenType}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteWallet(wallet.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                <p className="text-xs font-mono bg-gray-50 p-2 rounded break-all">
                  {wallet.walletAddress}
                </p>
              </div>

              {wallet.contractAddress && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Contract Address</p>
                  <p className="text-xs font-mono bg-gray-50 p-2 rounded break-all">
                    {wallet.contractAddress}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {wallet.enabled ? '✅ Active' : '⭕ Disabled'}
                </span>
                <button
                  onClick={() => toggleWallet(wallet.id, !wallet.enabled)}
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    wallet.enabled
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {wallet.enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add Wallet</h2>
              <button onClick={() => { setShowAddModal(false); setError(''); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleAddWallet}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Network *</label>
                <select
                  value={formData.network}
                  onChange={(e) => handleNetworkChange(e.target.value)}
                  className="input"
                >
                  <option value="SOLANA">Solana</option>
                  <option value="ETHEREUM">Ethereum</option>
                  <option value="BITCOIN">Bitcoin</option>
                  <option value="POLYGON">Polygon</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Token Symbol *</label>
                <input
                  type="text"
                  value={formData.tokenSymbol}
                  onChange={(e) => setFormData({ ...formData, tokenSymbol: e.target.value.toUpperCase() })}
                  placeholder="e.g., SOL, USDC, ETH"
                  className="input"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter the token ticker (e.g., SOL, USDC, USDT)</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Token Type *</label>
                <select
                  value={formData.tokenType}
                  onChange={(e) => setFormData({ ...formData, tokenType: e.target.value })}
                  className="input"
                >
                  <option value="NATIVE">Native (e.g., SOL, ETH, BTC)</option>
                  <option value="SPL">SPL Token (Solana)</option>
                  <option value="ERC20">ERC-20 (Ethereum)</option>
                  <option value="BEP20">BEP-20 (BSC)</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Token Decimals *</label>
                <input
                  type="number"
                  value={formData.tokenDecimals}
                  onChange={(e) => setFormData({ ...formData, tokenDecimals: parseInt(e.target.value) || 0 })}
                  min="0"
                  max="18"
                  className="input"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">9 for SOL, 6 for USDC, 18 for ETH</p>
              </div>

              {formData.tokenType !== 'NATIVE' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contract/Mint Address</label>
                  <input
                    type="text"
                    value={formData.contractAddress}
                    onChange={(e) => setFormData({ ...formData, contractAddress: e.target.value })}
                    placeholder="Token contract or mint address"
                    className="input font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Required for tokens like USDC, USDT</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address *</label>
                <input
                  type="text"
                  value={formData.walletAddress}
                  onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                  placeholder="Your receiving wallet address"
                  className="input font-mono text-sm"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Token Name (Optional)</label>
                <input
                  type="text"
                  value={formData.tokenName}
                  onChange={(e) => setFormData({ ...formData, tokenName: e.target.value })}
                  placeholder="e.g., USD Coin"
                  className="input"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Label (Optional)</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., Main Wallet"
                  className="input"
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Adding...' : 'Add Wallet'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setError(''); }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
