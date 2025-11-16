'use client';
import { PAYMENT_PORTAL_BASE_URL } from '@/app/lib/config';

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
    const url = `${PAYMENT_PORTAL_BASE_URL}/recipient/${payment.linkId}`;
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
      <div className="flex h-40 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--suzaa-blue)]/30 border-t-[var(--suzaa-blue)]" />
      </div>
    );
  }

  if (!payment) return null;

  const paymentUrl = `${PAYMENT_PORTAL_BASE_URL}/recipient/${payment.linkId}`;
  const isExpired = new Date() > new Date(payment.expiresAt);
  const timeRemaining = isExpired ? 'Expired' : getTimeRemaining(payment.expiresAt);

  return (
    <div className="space-y-8">
      <button
        onClick={() => router.push('/dashboard/orders')}
        className="btn-ghost text-sm font-semibold text-[var(--suzaa-blue)] hover:text-[var(--suzaa-teal)]"
      >
        ← Back to Payment Requests
      </button>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--suzaa-navy)]">
            Payment Request Details
          </h1>
          <p className="mt-1 text-sm text-[var(--suzaa-muted)]">Order ID: {payment.linkId}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={copyPaymentLink} className="btn-secondary">
            {copied ? '✓ Link Copied' : 'Copy Payment Link'}
          </button>
          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            View Payment Page
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="surface-card">
            <h2 className="text-lg font-semibold text-[var(--suzaa-navy)]">Payment Information</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl bg-[var(--suzaa-surface-muted)]/70 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.26em] text-[var(--suzaa-muted)]">
                  Amount
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--suzaa-midnight)]">
                  ${payment.amountFiat} {payment.currencyFiat}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-[var(--suzaa-muted)]">
                  Status
                </p>
                <span
                  className={`badge mt-2 ${
                    payment.status === 'ACTIVE' ? 'badge-success' : ''
                  }`}
                >
                  {payment.status}
                </span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-[var(--suzaa-muted)]">
                  Order Number
                </p>
                <p className="mt-2 font-mono text-sm text-[var(--suzaa-midnight)]">
                  #{payment.orderNumber}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-[var(--suzaa-muted)]">
                  Created By
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--suzaa-midnight)] capitalize">
                  {payment.createdBy}
                </p>
              </div>
            </div>
            {payment.description && (
              <div className="mt-6 rounded-2xl border border-[var(--suzaa-border)] bg-[var(--suzaa-surface-muted)]/70 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--suzaa-muted)]">
                  Description
                </p>
                <p className="mt-2 text-sm text-[var(--suzaa-midnight)]">{payment.description}</p>
              </div>
            )}
            {payment.buyerNote && (
              <div className="mt-4 rounded-2xl border border-[var(--suzaa-border)] bg-white px-4 py-4 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--suzaa-muted)]">
                  Buyer Note
                </p>
                <p className="mt-2 text-sm text-[var(--suzaa-midnight)]">{payment.buyerNote}</p>
              </div>
            )}
          </div>

          <div className="surface-card">
            <h2 className="text-lg font-semibold text-[var(--suzaa-navy)]">Timeline</h2>
            <div className="mt-6 space-y-6">
              {[
                {
                  title: 'Payment Request Created',
                  value: new Date(payment.createdAt).toLocaleString(),
                  accent: 'bg-[var(--suzaa-blue)]',
                  meta: payment.createdByIp ? `IP: ${payment.createdByIp}` : undefined,
                },
                {
                  title: isExpired ? 'Expired' : 'Expires',
                  value: new Date(payment.expiresAt).toLocaleString(),
                  accent: isExpired ? 'bg-[var(--suzaa-danger)]' : 'bg-[var(--suzaa-success)]',
                  meta: timeRemaining,
                },
                {
                  title: 'Last Updated',
                  value: new Date(payment.updatedAt).toLocaleString(),
                  accent: 'bg-[var(--suzaa-muted)]',
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <span className={`mt-2 h-2 w-2 rounded-full ${item.accent}`} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[var(--suzaa-midnight)]">
                      {item.title}
                    </p>
                    <p className="text-sm text-[var(--suzaa-muted)]">{item.value}</p>
                    {item.meta && (
                      <p className="text-xs text-[var(--suzaa-muted)]/80">{item.meta}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card">
            <h2 className="text-lg font-semibold text-[var(--suzaa-navy)]">Payment Link</h2>
            <div className="mt-5 rounded-2xl border border-[var(--suzaa-border)] bg-[var(--suzaa-surface-muted)] px-4 py-5 font-mono text-sm text-[var(--suzaa-midnight)] break-all">
              {paymentUrl}
            </div>
            <p className="mt-2 text-xs text-[var(--suzaa-muted)]">
              Share this secure link with your customer to complete payment.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card">
            <h2 className="text-lg font-semibold text-[var(--suzaa-navy)]">Settlement Status</h2>
            <div className="mt-5 space-y-3">
              <p className="text-xs uppercase tracking-[0.26em] text-[var(--suzaa-muted)]">
                Current Status
              </p>
              <span
                className={`badge ${
                  payment.settlementStatus === 'SETTLED'
                    ? 'badge-success'
                    : payment.settlementStatus === 'PAID'
                    ? 'badge'
                    : payment.settlementStatus === 'REJECTED'
                    ? 'badge-danger'
                    : payment.settlementStatus === 'REISSUED'
                    ? 'badge-warning'
                    : 'badge'
                }`}
              >
                {payment.settlementStatus}
              </span>
            </div>
          </div>

          <div className="surface-card">
            <h2 className="text-lg font-semibold text-[var(--suzaa-navy)]">Quick Stats</h2>
            <div className="mt-5 space-y-4 rounded-2xl border border-[var(--suzaa-border)] bg-[var(--suzaa-surface-muted)]/80 px-4 py-5">
              <QuickStat label="Expiry Time" value={`${payment.expiryMinutes} min`} />
              <QuickStat label="Order Date" value={payment.orderDate} />
              <QuickStat label="Payment ID" value={`${payment.id.slice(0, 12)}…`} mono />
            </div>
          </div>

          <div className="surface-card">
            <h2 className="text-lg font-semibold text-[var(--suzaa-navy)]">Actions</h2>
            <div className="mt-5 space-y-3">
              <button
                onClick={() => window.open(paymentUrl, '_blank')}
                className="btn-primary w-full justify-center"
              >
                Open Payment Page
              </button>
              <button onClick={copyPaymentLink} className="btn-secondary w-full justify-center">
                Copy Payment Link
              </button>
              <button onClick={fetchPaymentDetails} className="btn-ghost w-full justify-center">
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

function QuickStat({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase tracking-[0.26em] text-[var(--suzaa-muted)]">
        {label}
      </span>
      <span
        className={`text-sm font-semibold text-[var(--suzaa-midnight)] ${
          mono ? 'font-mono' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}
