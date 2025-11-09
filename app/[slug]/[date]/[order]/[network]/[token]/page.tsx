'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import { Copy } from 'lucide-react';

interface Wallet {
  id: string;
  network: string;
  tokenSymbol: string;
  tokenName: string | null;
  tokenType: string;
  tokenDecimals: number;
  contractAddress: string | null;
  walletAddress: string;
  cryptoAmount: number;
  coinPrice: number;
}

interface PaymentData {
  linkId: string;
  orderNumber: string;
  amountUsd: number;
  currency: string;
  description: string;
  status: string;
  expiresAt: string;
  merchant: { name: string; slug: string };
  wallets: Wallet[];
}

function formatNetwork(network: string): string {
  const names: Record<string, string> = {
    SOLANA: 'Solana',
    ETHEREUM: 'Ethereum',
    BITCOIN: 'Bitcoin',
    POLYGON: 'Polygon',
  };
  return names[network] || network;
}

export default function PublicPaymentPage() {
  const params = useParams();
  const slug = params.slug as string;
  const date = params.date as string;
  const order = params.order as string;
  const network = (params.network as string).toUpperCase();
  const token = (params.token as string).toUpperCase();
  const linkId = `${slug}/${date}/${order}`;

  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    fetchPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkId]);

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

  function copy(value: string, key: string) {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  }

  function buildPaymentUri(wallet: Wallet, amount: number, memo: string) {
    if (wallet.network === 'SOLANA') {
      return `solana:${wallet.walletAddress}?amount=${amount}&memo=${memo}`;
    }
    if (wallet.network === 'ETHEREUM') {
      return `ethereum:${wallet.walletAddress}?value=${amount}`;
    }
    return wallet.walletAddress;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--suzaa-surface-subtle)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--suzaa-blue)]/20 border-t-[var(--suzaa-blue)]" />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--suzaa-surface-subtle)] px-4">
        <div className="space-y-3 rounded-2xl border border-[var(--suzaa-border)] bg-white/95 px-6 py-6 text-center shadow-soft">
          <h1 className="text-base font-semibold text-[var(--suzaa-navy)]">Payment unavailable</h1>
          <p className="text-sm text-[var(--suzaa-muted)]">{error}</p>
        </div>
      </div>
    );
  }

  const wallet = payment.wallets.find(
    (w) => w.network === network && w.tokenSymbol === token
  );
  const isExpired = payment.status === 'EXPIRED';

  if (!wallet) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--suzaa-surface-subtle)] px-4">
        <div className="space-y-3 rounded-2xl border border-[var(--suzaa-border)] bg-white/95 px-6 py-6 text-center shadow-soft">
          <h1 className="text-base font-semibold text-[var(--suzaa-navy)]">Method unavailable</h1>
          <p className="text-sm text-[var(--suzaa-muted)]">
            No wallet is configured for {formatNetwork(network)} {token}. Please select another option.
          </p>
        </div>
      </div>
    );
  }

  const paymentUri = buildPaymentUri(wallet, wallet.cryptoAmount, payment.orderNumber);

  return (
    <div className="min-h-screen bg-[var(--suzaa-surface-subtle)] py-8 px-4">
      <div className="mx-auto w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-[var(--suzaa-border)] bg-white/90 shadow-soft backdrop-blur">
          <div
            className="px-6 py-8"
            style={{ background: 'linear-gradient(135deg, #0a84ff 0%, #00b8a9 100%)' }}
          >
            <p className="text-[0.65rem] uppercase tracking-[0.32em] text-white/70">Payment request</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">from {payment.merchant.name}</h1>
            <p className="mt-2 text-xs text-white/75">
              Order #{payment.orderNumber} • {formatNetwork(wallet.network)} {wallet.tokenSymbol}
            </p>
            <div className="mt-4 rounded-2xl bg-white/15 px-4 py-3 text-xs text-white/85">
              Amount due · {payment.currency} {payment.amountUsd.toFixed(2)}
            </div>
          </div>

          <div className="space-y-5 bg-white px-6 py-6">
            {isExpired ? (
              <div className="rounded-2xl border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-center text-xs text-[var(--suzaa-danger)]">
                This payment link has expired. Contact the merchant for a new request.
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-[var(--suzaa-border)] bg-[var(--suzaa-surface-muted)] px-4 py-3">
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--suzaa-muted)]">
                    Recommended
                  </p>
                  <a
                    href={paymentUri}
                    className="btn-primary mt-3 w-full justify-center text-sm"
                  >
                    Open in compatible wallet
                  </a>
                  <p className="mt-3 text-xs text-[var(--suzaa-muted)]">
                    Scanning the QR or using the button above auto-fills the address, amount, and memo fields in most
                    wallets.
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--suzaa-border)] bg-[var(--suzaa-surface-muted)] px-4 py-3">
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--suzaa-muted)]">
                    Amount to send
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xl font-semibold text-[var(--suzaa-midnight)]">
                        {wallet.cryptoAmount.toFixed(wallet.tokenDecimals)} {wallet.tokenSymbol}
                      </p>
                      <p className="text-xs text-[var(--suzaa-muted)]">
                        Approx {payment.currency} {payment.amountUsd.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => copy(wallet.cryptoAmount.toFixed(wallet.tokenDecimals), 'amount')}
                      className="btn-secondary px-3 py-2 text-[0.65rem]"
                    >
                      {copied === 'amount' ? 'Copied' : 'Copy amount'}
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--suzaa-border)] bg-white px-4 py-4 shadow-soft">
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--suzaa-muted)]">
                    Scan QR code
                  </p>
                  <div className="mt-4 flex justify-center rounded-2xl border border-[var(--suzaa-border)] bg-[var(--suzaa-surface-muted)] px-4 py-4">
                    <QRCodeCanvas value={paymentUri} size={200} level="H" />
                  </div>
                  <p className="mt-3 text-center text-xs text-[var(--suzaa-muted)]">
                    {wallet.network === 'SOLANA' && 'Scan with Phantom, Solflare, or Backpack'}
                    {wallet.network === 'ETHEREUM' && 'Scan with MetaMask, Rainbow, Trust Wallet'}
                    {wallet.network === 'BITCOIN' && 'Scan with any compatible Bitcoin wallet'}
                  </p>
                  <div className="mt-3 rounded-xl border border-[var(--suzaa-border)] bg-[var(--suzaa-surface-muted)] px-3 py-2 text-center text-xs text-[var(--suzaa-muted)]">
                    {wallet.cryptoAmount.toFixed(4)} {wallet.tokenSymbol} • Order {payment.orderNumber}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--suzaa-border)] bg-[var(--suzaa-surface-muted)] px-4 py-3">
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--suzaa-muted)]">
                    Wallet address
                  </p>
                  <div className="mt-3 flex items-start gap-2">
                    <div className="flex-1 rounded-xl border border-[var(--suzaa-border)] bg-white px-3 py-2 font-mono text-xs leading-snug text-[var(--suzaa-midnight)] break-all">
                      {wallet.walletAddress}
                    </div>
                    <button
                      onClick={() => copy(wallet.walletAddress, 'wallet')}
                      className="btn-secondary px-3 py-2 text-[0.65rem]"
                    >
                      {copied === 'wallet' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {wallet.contractAddress && (
                  <div className="rounded-2xl border border-[var(--suzaa-border)] bg-[var(--suzaa-surface-muted)] px-4 py-3">
                    <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--suzaa-muted)]">
                      Token contract address
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="input flex-1 font-mono text-xs leading-tight">
                        {wallet.contractAddress}
                      </div>
                      <button
                        onClick={() => copy(wallet.contractAddress!, 'contract')}
                        className="btn-secondary px-3 py-2 text-[0.65rem]"
                      >
                        {copied === 'contract' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-[var(--suzaa-warning)]">
                      Use this contract address when sending {wallet.tokenSymbol} tokens.
                    </p>
                  </div>
                )}

                {wallet.network === 'SOLANA' && (
                  <div className="rounded-2xl border border-[var(--suzaa-border)] bg-[var(--suzaa-surface-muted)] px-4 py-3">
                    <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--suzaa-muted)]">
                      Optional memo
                    </p>
                    <p className="mt-2 text-xs text-[var(--suzaa-muted)]">
                      Helps match your transaction to this order.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="text"
                        value={payment.orderNumber}
                        readOnly
                        className="input flex-1 text-center font-mono text-xs"
                      />
                      <button
                        onClick={() => copy(payment.orderNumber, 'memo')}
                        className="btn-secondary px-3 py-2 text-[0.65rem]"
                      >
                        {copied === 'memo' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {payment.description && (
              <div className="rounded-2xl border border-[var(--suzaa-border)] bg-[var(--suzaa-surface-muted)] px-4 py-3">
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--suzaa-muted)]">
                  Description
                </p>
                <p className="mt-2 text-xs text-[var(--suzaa-midnight)]">{payment.description}</p>
              </div>
            )}

            <div className="text-center text-[0.65rem] uppercase tracking-[0.24em] text-[var(--suzaa-muted)]">
              Expires {new Date(payment.expiresAt).toLocaleString()}
            </div>
          </div>
        </div>

        <p className="text-center text-[0.65rem] uppercase tracking-[0.24em] text-[var(--suzaa-muted)]">
          Powered by <span className="font-semibold text-[var(--suzaa-navy)]">SUZAA</span>
        </p>
      </div>
    </div>
  );
}
