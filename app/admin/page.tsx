'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/api';

type Mode = 'register' | 'login' | 'verify-register' | 'verify-login';

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
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
      await api.post('/admin/register', { email });
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
      await api.post('/admin/login', { email });
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
      const response = await api.post('/admin/verify', { email, pin });
      const token = response.data.data.token;
      localStorage.setItem('adminToken', token);
      router.push('/admin/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--suzaa-surface-subtle)] px-4 py-12">
      <div className="absolute inset-0 bg-gradient-midnight opacity-95" />
      <div className="absolute left-20 top-24 h-72 w-72 rounded-full bg-[var(--suzaa-blue)]/28 blur-3xl" />
      <div className="absolute bottom-0 right-12 h-64 w-64 rounded-full bg-[var(--suzaa-teal)]/28 blur-3xl" />

      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-white/92 shadow-[0_45px_140px_-60px_rgba(0,0,0,0.55)] backdrop-blur-lg">
        <div className="px-10 py-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--suzaa-navy)] text-sm font-semibold text-white shadow-soft">
                Σ
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--suzaa-navy)]">SUZAA</p>
                <p className="text-xs uppercase tracking-[0.32em] text-[var(--suzaa-muted)]">
                  Super Admin
                </p>
              </div>
            </div>
            <h1 className="mt-6 text-2xl font-semibold text-[var(--suzaa-navy)]">
              {mode.includes('verify') ? 'Verify Super Admin' : 'Super Admin Access'}
            </h1>
            <p className="mt-2 text-sm text-[var(--suzaa-muted)]">
              PIN-based verification protects privileged access to the network.
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

          <div className="mt-8 space-y-6">
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--suzaa-midnight)]">
                    Authorized Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="security@suzaa.com"
                    required
                  />
                  <p className="text-xs text-[var(--suzaa-muted)]">
                    A one-time PIN will be delivered to verify this session.
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
                  Need to provision access?
                </button>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--suzaa-midnight)]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="security@suzaa.com"
                    required
                  />
                  <p className="text-xs text-[var(--suzaa-muted)]">
                    Registration requires an approved security contact.
                  </p>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Sending PIN...' : 'Register & Send PIN'}
                </button>

                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="btn-ghost w-full justify-center text-[var(--suzaa-blue)] hover:text-[var(--suzaa-teal)]"
                >
                  Already provisioned? Log in
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
                  {loading ? 'Verifying...' : 'Verify & Access'}
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

          <div className="mt-6 text-center text-xs text-[var(--suzaa-muted)]">
            Merchant portal instead?{' '}
            <a
              href="/dashboard"
              className="font-semibold text-[var(--suzaa-blue)] hover:text-[var(--suzaa-teal)]"
            >
              Switch to merchant login →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
