'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/api';

type Mode = 'login' | 'register' | 'verify-login' | 'verify-register';

export default function MerchantAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await api.post('/auth/register', { email, businessName });
      setMessage('Check your email for the verification PIN!');
      setMode('verify-register');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await api.post('/auth/login', { email });
      setMessage('Check your email for the login PIN!');
      setMode('verify-login');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/verify', { email, pin });
      const token = response.data.data.token;
      localStorage.setItem('token', token);
      router.push('/dashboard/overview');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--suzaa-surface-subtle)] px-4 py-12">
      <div className="absolute inset-0 bg-gradient-midnight opacity-90" />
      <div className="absolute top-24 h-80 w-80 rounded-full bg-[var(--suzaa-blue)]/30 blur-3xl" />
      <div className="absolute bottom-10 right-16 h-72 w-72 rounded-full bg-[var(--suzaa-teal)]/25 blur-3xl" />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-white/90 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.45)] backdrop-blur-lg">
        <div className="grid gap-10 px-10 py-12 md:grid-cols-[1.25fr_1fr] md:px-16">
          <div className="hidden flex-col justify-between border-r border-white/30 pr-8 text-white md:flex">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-white/60">SUZAA Merchant</p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight">
                Passwordless payments for modern merchants.
              </h1>
              <p className="mt-4 text-sm text-white/70">
                Verify with your email PIN to access live settlement data, wallets, and plugins.
              </p>
            </div>
            <div className="space-y-4 text-sm text-white/70">
              <p className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white/80" />
                256-bit secure authentication · Global session monitoring.
              </p>
              <p className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white/80" />
                Always-on rate limiting and anomaly detection.
              </p>
            </div>
          </div>

          <div className="mx-auto w-full max-w-sm">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--suzaa-blue)] text-sm font-semibold text-white shadow-soft">
                  Σ
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--suzaa-navy)]">SUZAA</p>
                  <p className="text-xs uppercase tracking-[0.32em] text-[var(--suzaa-muted)]">
                    Merchant Access
                  </p>
                </div>
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-[var(--suzaa-navy)]">
                {mode.includes('verify') ? 'Verify PIN' : mode === 'login' ? 'Merchant Login' : 'Create Account'}
              </h2>
              <p className="mt-2 text-sm text-[var(--suzaa-muted)]">
                {mode.includes('verify')
                  ? 'Enter the 6-digit PIN sent to your email to continue.'
                  : 'Authenticate with a one-time PIN delivered securely to your inbox.'}
              </p>
            </div>

            {error && (
              <div className="mt-6 rounded-xl border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-sm text-[var(--suzaa-danger)]">
                {error}
              </div>
            )}

            {message && (
              <div className="mt-6 rounded-xl border border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.08)] px-4 py-3 text-sm text-[var(--suzaa-success)]">
                {message}
              </div>
            )}

            <div className="mt-6 space-y-6">
              {mode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--suzaa-midnight)]">
                      Work Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input"
                      placeholder="merchant@company.com"
                      required
                    />
                    <p className="text-xs text-[var(--suzaa-muted)]">
                      We’ll send a one-time login PIN to this email.
                    </p>
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? 'Sending PIN...' : 'Send Login PIN'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="btn-ghost w-full justify-center text-[var(--suzaa-blue)] hover:text-[var(--suzaa-teal)]"
                  >
                    Need an account? Create one
                  </button>
                </form>
              )}

              {mode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--suzaa-midnight)]">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="input"
                      placeholder="ACME Payments Ltd."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--suzaa-midnight)]">
                      Work Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input"
                      placeholder="ops@acme.com"
                      required
                    />
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="btn-ghost w-full justify-center text-[var(--suzaa-blue)] hover:text-[var(--suzaa-teal)]"
                  >
                    Already have access? Log in
                  </button>
                </form>
              )}

              {(mode === 'verify-register' || mode === 'verify-login') && (
                <form onSubmit={handleVerify} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--suzaa-midnight)]">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--suzaa-midnight)]">
                      Verification PIN
                    </label>
                    <input
                      type="text"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="input tracking-[0.4em] text-center font-mono text-lg"
                      placeholder="••••••"
                      maxLength={6}
                      required
                    />
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setPin('');
                    }}
                    className="btn-ghost w-full justify-center text-[var(--suzaa-blue)] hover:text-[var(--suzaa-teal)]"
                  >
                    Back to Login
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-white/20 bg-white/90 px-10 py-4 text-center text-xs text-[var(--suzaa-muted)]">
          Need elevated access?{' '}
          <a href="/admin" className="font-semibold text-[var(--suzaa-blue)] hover:text-[var(--suzaa-teal)]">
            Switch to Super Admin →
          </a>
        </div>
      </div>
    </div>
  );
}
