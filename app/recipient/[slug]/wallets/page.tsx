'use client';
import { PUBLIC_API_BASE_URL } from '@/app/lib/config';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Copy } from 'lucide-react';

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

function networkIcon(network: string): string {
  const icons: Record<string, string> = {
    SOLANA: '◎',
    ETHEREUM: 'Ξ',
    BITCOIN: '₿',
    POLYGON: '⬡',
  };
  return icons[network] || '•';
}

export default function PublicWalletsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [data, setData] = useState<WalletsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    fetchWallets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function fetchWallets() {
    try {
      setLoading(true);
      const response = await fetch(`${PUBLIC_API_BASE_URL}/public/wallets/${slug}`);
      if (!response.ok) throw new Error('Merchant not found');
      const result = await response.json();
      setData(result.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load wallets');
    } finally {
      setLoading(false);
    }
  }

  function copy(value: string, key: string) {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--suzaa-surface-subtle)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--suzaa-blue)]/20 border-t-[var(--suzaa-blue)]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--suzaa-surface-subtle)] px-4">
        <div className="space-y-3 rounded-2xl border border-[var(--suzaa-border)] bg-white/95 px-6 py-6 text-center shadow-soft">
          <h1 className="text-base font-semibold text-[var(--suzaa-navy)]">Wallets unavailable</h1>
          <p className="text-sm text-[var(--suzaa-muted)]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--suzaa-surface-subtle)] py-8 px-4">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
        <div className="overflow-hidden rounded-3xl border border-[var(--suzaa-border)] bg-white/90 shadow-soft backdrop-blur">
          <div
            className="px-6 py-8"
            style={{ background: 'linear-gradient(135deg, #0a84ff 0%, #00b8a9 100%)' }}
          >
            <h1 className="text-2xl font-semibold text-white">{data.merchant.name}</h1>
            <p className="mt-2 text-xs text-white/75">Verified wallet destinations for secure payments</p>
          </div>

          <div className="space-y-4 bg-white px-6 py-6">
            <div className="rounded-2xl border border-[var(--suzaa-border)] bg-[var(--suzaa-surface-muted)] px-4 py-3 text-xs text-[var(--suzaa-muted)]">
              🔒 Always verify addresses with this list before sending funds.
            </div>

            {data.wallets.length === 0 ? (
              <div className="rounded-2xl border border-[var(--suzaa-border)] bg-white px-4 py-5 text-center text-sm text-[var(--suzaa-muted)]">
                No wallet addresses are currently published.
              </div>
            ) : (
              <div className="space-y-3">
                {data.wallets.map((wallet, index) => (
                  <div key={index} className="rounded-2xl border border-[var(--suzaa-border)] bg-white px-4 py-4 shadow-soft">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl text-[var(--suzaa-navy)]">{networkIcon(wallet.network)}</span>
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="rounded bg-[var(--suzaa-surface-muted)] px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-[var(--suzaa-muted)]">
                          {wallet.network}
                        </span>
                        <span className="rounded bg-[var(--suzaa-navy)] px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-white">
                          {wallet.tokenSymbol}
                        </span>
                        <span className="rounded bg-[var(--suzaa-surface-muted)] px-2 py-1 text-[0.55rem] uppercase tracking-[0.24em] text-[var(--suzaa-muted)]">
                          {wallet.tokenType}
                        </span>
                      </div>
                    </div>
                    {wallet.tokenName && (
                      <p className="mt-2 text-xs text-[var(--suzaa-muted)]">{wallet.tokenName}</p>
                    )}

                    <div className="mt-3">
                      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--suzaa-muted)]">
                        Wallet Address
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="input flex-1 font-mono text-xs leading-tight">{wallet.walletAddress}</div>
                        <button
                          onClick={() => copy(wallet.walletAddress, `wallet-${index}`)}
                          className="btn-secondary px-3 py-2 text-[0.65rem]"
                        >
                          {copied === `wallet-${index}` ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    {wallet.contractAddress && (
                      <div className="mt-3">
                        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--suzaa-muted)]">
                          Contract Address
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="input flex-1 font-mono text-xs leading-tight">{wallet.contractAddress}</div>
                          <button
                            onClick={() => copy(wallet.contractAddress!, `contract-${index}`)}
                            className="btn-secondary px-3 py-2 text-[0.65rem]"
                          >
                            {copied === `contract-${index}` ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="text-center text-[0.65rem] uppercase tracking-[0.24em] text-[var(--suzaa-muted)]">
              Added: {data.wallets.length} wallet{data.wallets.length === 1 ? '' : 's'}
            </div>
          </div>
          <div className="border-t border-[var(--suzaa-border)] bg-white/90 px-6 py-4 text-center text-[0.65rem] uppercase tracking-[0.24em] text-[var(--suzaa-muted)]">
            Powered by <span className="font-semibold text-[var(--suzaa-navy)]">SUZAA</span>
          </div>
        </div>
      </div>
    </div>
  );
}


