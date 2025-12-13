'use client';
import { PUBLIC_API_BASE_URL } from '@/app/lib/config';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import { Copy, RefreshCw } from 'lucide-react';

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
  settlementStatus?: string;
  redirectUrl?: string | null;
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

function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Expired';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
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
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [secondsSinceRefresh, setSecondsSinceRefresh] = useState<number>(0);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const quoteRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPayment = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const response = await fetch(`${PUBLIC_API_BASE_URL}/public/payment/${linkId}`);
      if (!response.ok) throw new Error('Payment not found');
      const data = await response.json();
      setPayment(data.data);
      setLastRefreshedAt(new Date());
      
      // Update countdown based on expiresAt
      if (data.data?.expiresAt) {
        const expiresAt = new Date(data.data.expiresAt).getTime();
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
        setTimeRemaining(remaining);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load payment');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [linkId]);

  // Initial fetch
  useEffect(() => {
    fetchPayment(false);
  }, [fetchPayment]);

  // Set up countdown timer
  useEffect(() => {
    if (!payment?.expiresAt) return;

    const updateCountdown = () => {
      const expiresAt = new Date(payment.expiresAt).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeRemaining(remaining);

      // If expired, refresh payment status
      if (remaining === 0 && payment.status !== 'EXPIRED') {
        fetchPayment(false);
      }
    };

    updateCountdown();
    countdownIntervalRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [payment?.expiresAt, payment?.status, fetchPayment]);

  // Set up quote refresh every 60 seconds
  useEffect(() => {
    if (!payment || payment.status === 'EXPIRED') return;

    quoteRefreshIntervalRef.current = setInterval(() => {
      fetchPayment(true); // Silent refresh
    }, 60000); // 60 seconds

    return () => {
      if (quoteRefreshIntervalRef.current) {
        clearInterval(quoteRefreshIntervalRef.current);
      }
    };
  }, [payment, fetchPayment]);

  // Update seconds since refresh every second
  useEffect(() => {
    const updateRefreshTimer = () => {
      const elapsed = Math.floor((Date.now() - lastRefreshedAt.getTime()) / 1000);
      setSecondsSinceRefresh(elapsed);
    };

    updateRefreshTimer();
    refreshTimerIntervalRef.current = setInterval(updateRefreshTimer, 1000);

    return () => {
      if (refreshTimerIntervalRef.current) {
        clearInterval(refreshTimerIntervalRef.current);
      }
    };
  }, [lastRefreshedAt]);

  // Cleanup all intervals on unmount
  useEffect(() => {
    return () => {
      if (quoteRefreshIntervalRef.current) {
        clearInterval(quoteRefreshIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (refreshTimerIntervalRef.current) {
        clearInterval(refreshTimerIntervalRef.current);
      }
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  function copy(value: string, key: string) {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  }

  async function updatePaymentStatus(status: 'CANCELED' | 'CLAIMED_PAID') {
    if (isUpdatingStatus || isExpired) return;

    try {
      setIsUpdatingStatus(true);
      setStatusMessage(null);

      const response = await fetch(`${PUBLIC_API_BASE_URL}/public/payment/${linkId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      const data = await response.json();
      
      // Store redirectUrl before refreshing (in case payment state hasn't updated yet)
      const currentRedirectUrl = payment?.redirectUrl;
      
      setStatusMessage({
        type: 'success',
        text: data.message || `Status updated to ${status === 'CANCELED' ? 'Canceled' : 'Claimed Paid'}`,
      });

      // Refresh payment data to get updated status
      await fetchPayment(true);

      // Check if redirectUrl exists and handle redirect
      if (currentRedirectUrl) {
        // Check localStorage to prevent redirect loops
        const redirectKey = `redirect_${linkId}_${status}`;
        if (localStorage.getItem(redirectKey)) {
          // Already redirected, don't redirect again
          return;
        }

        // Set flag in localStorage
        localStorage.setItem(redirectKey, 'true');

        // Set redirecting state
        setRedirecting(true);

        // Wait 2.5 seconds, then redirect
          redirectTimeoutRef.current = setTimeout(() => {
            try {
              const redirectUrl = new URL(currentRedirectUrl);
              redirectUrl.searchParams.set('paymentId', linkId);
              redirectUrl.searchParams.set('status', status.toLowerCase());
              
              window.location.href = redirectUrl.toString();
          } catch (err) {
            // Invalid URL or redirect failed
            setRedirecting(false);
            localStorage.removeItem(redirectKey);
            setStatusMessage({
              type: 'error',
              text: 'Failed to redirect to store, but if you marked as paid, the merchant will review and confirm as usual.',
            });
          }
        }, 2500);
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to update status. Please try again.',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
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
  const isExpired = payment.status === 'EXPIRED' || timeRemaining <= 0;

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
  const secondsUntilNextRefresh = Math.max(0, 60 - secondsSinceRefresh);

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
            
            {/* Countdown Timer */}
            {!isExpired && (
              <div className="mt-4 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.24em] text-white/70">Link expires in</p>
                    <p className="mt-1 text-lg font-bold text-white">
                      {formatTimeRemaining(timeRemaining)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[0.65rem] uppercase tracking-[0.24em] text-white/70">Quote refreshes in</p>
                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-white">
                      {isRefreshing ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          Refreshing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3" />
                          {secondsUntilNextRefresh}s
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
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
                  <div className="flex items-center justify-between">
                    <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--suzaa-muted)]">
                      Amount to send
                    </p>
                    {!isRefreshing && secondsUntilNextRefresh <= 10 && (
                      <p className="text-[0.65rem] text-[var(--suzaa-blue)]">
                        Updating in {secondsUntilNextRefresh}s...
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xl font-semibold text-[var(--suzaa-midnight)]">
                        {wallet.cryptoAmount.toFixed(wallet.tokenDecimals)} {wallet.tokenSymbol}
                      </p>
                      <p className="text-xs text-[var(--suzaa-muted)]">
                        ≈ {payment.currency} {payment.amountUsd.toFixed(2)} • Rate updated {secondsSinceRefresh < 60 ? `${secondsSinceRefresh}s ago` : `${Math.floor(secondsSinceRefresh / 60)}m ago`}
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
                    <QRCodeCanvas 
                      key={`${wallet.cryptoAmount}-${wallet.tokenSymbol}`}
                      value={paymentUri} 
                      size={200} 
                      level="H" 
                    />
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

            {!isExpired && (
              <>
                <div className="rounded-2xl border border-[var(--suzaa-border)] bg-[var(--suzaa-surface-muted)] px-4 py-3 text-center">
                  <p className="text-[0.65rem] uppercase tracking-[0.24em] text-[var(--suzaa-muted)]">
                    Quote auto-refreshes every 60 seconds
                  </p>
                  <p className="mt-1 text-xs text-[var(--suzaa-muted)]">
                    Prices update automatically to reflect current market rates
                  </p>
                </div>

                {/* Status update buttons */}
                <div className="rounded-2xl border border-[var(--suzaa-border)] bg-white px-4 py-4 shadow-soft">
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--suzaa-muted)] text-center mb-4">
                    Payment Status
                  </p>
                  
                  {payment.settlementStatus === 'CANCELED' && (
                    <div className="mb-4 rounded-xl border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-xs text-[var(--suzaa-danger)]">
                      This payment has been canceled.
                    </div>
                  )}

                  {payment.settlementStatus === 'CLAIMED_PAID' && (
                    <div className="mb-4 rounded-xl border border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.08)] px-4 py-3 text-xs text-[var(--suzaa-success)]">
                      You've marked this payment as paid. The merchant will review and confirm.
                    </div>
                  )}

                  {statusMessage && (
                    <div
                      className={`mb-4 rounded-xl px-4 py-3 text-xs ${
                        statusMessage.type === 'success'
                          ? 'border border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.08)] text-[var(--suzaa-success)]'
                          : 'border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)] text-[var(--suzaa-danger)]'
                      }`}
                    >
                      {statusMessage.text}
                    </div>
                  )}

                  {redirecting && (
                    <div className="mb-4 rounded-xl border border-[rgba(59,130,246,0.25)] bg-[rgba(59,130,246,0.08)] px-4 py-3 text-xs text-[var(--suzaa-blue)]">
                      Redirecting you back to the store...
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => updatePaymentStatus('CANCELED')}
                      disabled={isUpdatingStatus || redirecting || payment.status === 'EXPIRED' || payment.settlementStatus === 'CANCELED'}
                      className="btn-secondary flex-1 justify-center border-[var(--suzaa-border)] text-[var(--suzaa-midnight)] hover:bg-[var(--suzaa-surface-muted)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdatingStatus ? 'Updating...' : payment.settlementStatus === 'CANCELED' ? 'Canceled' : 'Cancel'}
                    </button>
                    <button
                      onClick={() => updatePaymentStatus('CLAIMED_PAID')}
                      disabled={isUpdatingStatus || redirecting || payment.status === 'EXPIRED' || payment.settlementStatus === 'CLAIMED_PAID'}
                      className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdatingStatus ? 'Updating...' : payment.settlementStatus === 'CLAIMED_PAID' ? 'Marked as Paid' : 'I Paid'}
                    </button>
                  </div>
                  <p className="mt-3 text-center text-xs text-[var(--suzaa-muted)]">
                    Let the merchant know if you've completed payment or need to cancel
                  </p>
                </div>
              </>
            )}
          </div>
          <div className="border-t border-[var(--suzaa-border)] bg-white/90 px-6 py-4 text-center text-[0.65rem] uppercase tracking-[0.24em] text-[var(--suzaa-muted)]">
            Powered by <span className="font-semibold text-[var(--suzaa-navy)]">SUZAA</span>
          </div>
        </div>
      </div>
    </div>
  );
}


