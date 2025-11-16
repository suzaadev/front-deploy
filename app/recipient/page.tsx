'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function RecipientLookupPage() {
  const router = useRouter();
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const trimmedSlug = slug.trim();

    if (!trimmedSlug) {
      setError('Please enter a recipient code or phone number.');
      return;
    }

    // Validate: must be 6-20 digits (6-digit code or 7-20 digit phone number)
    const digitRegex = /^\d{6,20}$/;
    if (!digitRegex.test(trimmedSlug)) {
      setError('Recipient code or phone number must be between 6 and 20 digits.');
      return;
    }

    // Navigate to the recipient storefront
    router.push(`/recipient/${trimmedSlug}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--suzaa-surface-subtle)] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-[var(--suzaa-border)] bg-white/90 shadow-soft backdrop-blur">
          <div
            className="px-6 py-8 text-center"
            style={{ background: 'linear-gradient(135deg, #0a84ff 0%, #00b8a9 100%)' }}
          >
            <h1 className="text-2xl font-semibold uppercase tracking-[0.18em] text-white">
              Find a recipient
            </h1>
            <p className="mt-3 text-xs text-white/75">
              Enter the recipient code or phone number to view their payment portal
            </p>
          </div>

          <div className="bg-white px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="slug-input"
                  className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--suzaa-muted)] block mb-2"
                >
                  Recipient Code or Phone Number
                </label>
                <input
                  id="slug-input"
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    // Only allow digits, max 20 characters
                    const value = e.target.value.replace(/\D/g, '').slice(0, 20);
                    setSlug(value);
                    setError('');
                  }}
                  placeholder="123456 or 12023831234"
                  className="input w-full"
                  inputMode="numeric"
                  maxLength={20}
                  autoFocus
                />
                {error && (
                  <p className="mt-2 text-xs text-[var(--suzaa-danger)]">{error}</p>
                )}
              </div>

              <button
                type="submit"
                className="btn-primary w-full justify-center text-sm"
              >
                Go
              </button>
            </form>
          </div>

          <div className="border-t border-[var(--suzaa-border)] bg-white/90 px-6 py-4 text-center text-[0.65rem] uppercase tracking-[0.24em] text-[var(--suzaa-muted)]">
            Powered by <span className="font-semibold text-[var(--suzaa-navy)]">SUZAA</span>
          </div>
        </div>
      </div>
    </div>
  );
}


