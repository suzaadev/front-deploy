'use client';
import { PUBLIC_API_BASE_URL } from '@/app/lib/config';

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
  merchant: { name: string; slug: string };
  availableOptions: Array<{ network: string; token: string }>;
}

export default function ChainSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const date = params.date as string;
  const order = params.order as string;
  const linkId = `${slug}/${date}/${order}`;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<any>(null);

  useEffect(() => {
    fetchPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkId]);

  async function fetchPayment() {
    try {
      setLoading(true);
      const response = await fetch(`${PUBLIC_API_BASE_URL}/public/payment/${linkId}`);
      if (!response.ok) throw new Error('Payment not found');
      const data = await response.json();
      const paymentData = data.data;
      setPayment(paymentData);

      if (paymentData.availableOptions && paymentData.availableOptions.length === 1) {
        const option = paymentData.availableOptions[0];
        router.push(`/recipient/${slug}/${date}/${order}/${option.network.toLowerCase()}/${option.token.toLowerCase()}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load payment');
    } finally {
      setLoading(false);
    }
  }

  function getNetworkDisplayName(network: string): string {
    const names: Record<string, string> = {
      SOLANA: 'Solana',
      ETHEREUM: 'Ethereum',
      BITCOIN: 'Bitcoin',
      POLYGON: 'Polygon',
    };
    return names[network] || network;
  }

  function handleOptionSelect(network: string, token: string) {
    router.push(`/recipient/${slug}/${date}/${order}/${network.toLowerCase()}/${token.toLowerCase()}`);
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

  const isExpired = payment.status === 'EXPIRED';

  return (
    <div className="min-h-screen bg-[var(--suzaa-surface-subtle)] py-8 px-4">
      <div className="mx-auto w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-[var(--suzaa-border)] bg-white/90 shadow-soft backdrop-blur">
          <div
            className="px-6 py-8 text-center"
            style={{ background: 'linear-gradient(135deg, #0a84ff 0%, #00b8a9 100%)' }}
          >
            <h1 className="text-2xl font-semibold text-white">{payment.merchant.name}</h1>
            <p className="mt-2 text-xs text-white/75">
              Order #{payment.orderNumber} · {payment.currency} {payment.amountUsd}
            </p>
          </div>

          <div className="space-y-6 bg-white px-6 py-6">
            {isExpired ? (
              <div className="rounded-2xl border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-center text-xs text-[var(--suzaa-danger)]">
                This payment link has expired.{' '}
                <a
                  href={`/recipient/${slug}?tab=create`}
                  className="font-semibold text-[var(--suzaa-blue)] hover:text-[var(--suzaa-teal)]"
                >
                  Click here to create a new payment request
                </a>{' '}
                or contact the merchant for assistance.
              </div>
            ) : payment.availableOptions && payment.availableOptions.length === 0 ? (
              <div className="rounded-2xl border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.12)] px-4 py-3 text-center text-xs text-[var(--suzaa-warning)]">
                No payment methods are currently available.
              </div>
            ) : (
              <>
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-[var(--suzaa-navy)]">Select payment method</h2>
                  <p className="mt-1 text-xs text-[var(--suzaa-muted)]">
                    Choose the cryptocurrency you'd like to use. We'll guide you through the rest.
                  </p>
                </div>

                <div className="space-y-3">
                  {payment.availableOptions.map((option: any) => (
                    <button
                      key={`${option.network}-${option.token}`}
                      onClick={() => handleOptionSelect(option.network, option.token)}
                      className="flex w-full items-center justify-between rounded-2xl border border-[var(--suzaa-border)] bg-white px-4 py-3 text-left shadow-soft transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-card"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[var(--suzaa-navy)]">
                          {getNetworkDisplayName(option.network)} • {option.token}
                        </p>
                        <p className="mt-1 text-xs text-[var(--suzaa-muted)]">
                          Pay with {option.token} on {getNetworkDisplayName(option.network)}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-[var(--suzaa-muted)]" />
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl border border-[var(--suzaa-border)] bg-[var(--suzaa-surface-muted)] px-4 py-3 text-xs text-[var(--suzaa-muted)]">
                  <p className="font-semibold uppercase tracking-[0.24em]">What happens next</p>
                  <ul className="mt-2 space-y-2">
                    <li>Choose your preferred network and token.</li>
                    <li>Review the QR code and transfer instructions.</li>
                    <li>Send the exact amount displayed.</li>
                    <li>Payment is automatically detected and confirmed.</li>
                  </ul>
                </div>
              </>
            )}

            {payment.description && (
              <div className="rounded-2xl border border-[var(--suzaa-border)] bg-[var(--suzaa-surface-muted)] px-4 py-3 text-xs text-[var(--suzaa-muted)]">
                <p className="font-semibold uppercase tracking-[0.24em]">Description</p>
                <p className="mt-2 text-[var(--suzaa-midnight)]">{payment.description}</p>
              </div>
            )}

            <div className="text-center text-[0.65rem] uppercase tracking-[0.24em] text-[var(--suzaa-muted)]">
              Expires {new Date(payment.expiresAt).toLocaleString()}
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


