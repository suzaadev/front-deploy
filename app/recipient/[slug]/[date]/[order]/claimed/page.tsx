'use client';

import { useParams, useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function ClaimedPaidPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const date = params.date as string;
  const order = params.order as string;

  return (
    <div className="min-h-screen bg-[var(--suzaa-surface-subtle)] py-8 px-4">
      <div className="mx-auto w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-[var(--suzaa-border)] bg-white/90 shadow-soft backdrop-blur">
          <div
            className="px-6 py-8 text-center"
            style={{ background: 'linear-gradient(135deg, #0a84ff 0%, #00b8a9 100%)' }}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-white">Thank You!</h1>
          </div>

          <div className="space-y-6 bg-white px-6 py-8">
            <div className="text-center">
              <p className="text-base leading-relaxed text-[var(--suzaa-midnight)]">
                Thank you for claiming confirmation of this payment. The recipient will verify and process your payment.
              </p>
            </div>

            <div className="rounded-2xl border border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.08)] px-4 py-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--suzaa-success)]" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-[var(--suzaa-success)]">Payment Claimed</p>
                  <p className="mt-1 text-xs text-[var(--suzaa-muted)]">
                    Your payment status has been updated. The merchant will review and confirm receipt.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--suzaa-border)] bg-[var(--suzaa-surface-muted)] px-4 py-4">
              <p className="text-center text-sm text-[var(--suzaa-muted)]">
                Order ID: <span className="font-mono font-semibold text-[var(--suzaa-midnight)]">{slug}/{date}/{order}</span>
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--suzaa-border)] bg-[var(--suzaa-surface-muted)] px-4 py-3">
              <p className="text-xs text-[var(--suzaa-muted)]">
                <span className="font-semibold">What happens next?</span>
                <ul className="mt-2 space-y-1 text-left">
                  <li>• The merchant will verify your payment</li>
                  <li>• Your order status will be updated accordingly</li>
                  <li>• You may receive a confirmation email once processed</li>
                </ul>
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={() => router.push('/')}
                className="btn-primary w-full justify-center"
              >
                Return to Home
              </button>
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






