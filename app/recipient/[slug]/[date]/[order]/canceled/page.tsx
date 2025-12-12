'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export default function CanceledPage() {
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
            style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <XCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-white">Payment Canceled</h1>
          </div>

          <div className="space-y-6 bg-white px-6 py-8">
            <div className="text-center">
              <p className="text-base text-[var(--suzaa-midnight)]">
                This payment has been canceled by the user.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--suzaa-border)] bg-[var(--suzaa-surface-muted)] px-4 py-4">
              <p className="text-center text-sm text-[var(--suzaa-muted)]">
                Order ID: <span className="font-mono font-semibold text-[var(--suzaa-midnight)]">{slug}/{date}/{order}</span>
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






