'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/api';
import { useAuth } from '@/app/contexts/AuthContext';

type Mode = 'login' | 'register' | 'verify-login' | 'verify-register';

export default function HomePage() {
  const router = useRouter();
  const { supabase, refreshMerchant } = useAuth();
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
      const { error: supabaseError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true }
      });
      if (supabaseError) throw supabaseError;
      setMessage('Check your email for the verification PIN!');
      setMode('verify-register');
    } catch (error: any) {
      setError(error?.message || 'Registration failed');
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
      // Check if merchant is suspended before allowing Supabase to send OTP
      try {
        const statusResponse = await api.post('/public/check-merchant-status', { email });
        if (!statusResponse.data?.canProceed) {
          setError('Account has been suspended. Please contact support for assistance.');
          setLoading(false);
          return;
        }
      } catch (statusError: any) {
        // If 403, merchant is suspended - BLOCK THEM
        if (statusError?.response?.status === 403) {
          setError('Account has been suspended. Please contact support for assistance.');
          setLoading(false);
          return;
        }
        // For other errors, log but continue (don't block registration for network issues)
        console.warn('Failed to check merchant status:', statusError);
      }

      const { error: supabaseError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false }
      });
      if (supabaseError) throw supabaseError;
      setMessage('Check your email for the login PIN!');
      setMode('verify-login');
    } catch (error: any) {
      setError(error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check suspension status BEFORE verifying OTP
      try {
        const statusResponse = await api.post('/public/check-merchant-status', { email });
        if (!statusResponse.data.canProceed) {
          setError(statusResponse.data.message || 'Account has been suspended. Please contact support.');
          return;
        }
      } catch (statusError: any) {
        if (statusError?.response?.status === 403) {
          setError(statusError.response.data?.message || 'Account has been suspended. Please contact support.');
          return;
        }
      }

      // Verify OTP with Supabase
      const { error: supabaseError, data: supabaseData } = await supabase.auth.verifyOtp({
        email,
        token: pin,
        type: mode === 'verify-register' ? 'signup' : 'email'
      });
      if (supabaseError) throw supabaseError;

      // IMPORTANT: Check suspension IMMEDIATELY after OTP verification, before proceeding
      // This prevents suspended users from getting a valid session
      try {
        const statusCheck = await api.post('/public/check-merchant-status', { email });
        if (!statusCheck.data.canProceed) {
          // Sign out immediately if suspended
          await supabase.auth.signOut();
          setError(statusCheck.data.message || 'Account has been suspended. Please contact support.');
          return;
        }
      } catch (statusError: any) {
        if (statusError?.response?.status === 403) {
          await supabase.auth.signOut();
          setError(statusError.response.data?.message || 'Account has been suspended. Please contact support.');
          return;
        }
      }

      if (mode === 'verify-register') {
        await api.post('/auth/bootstrap', { businessName });
      }
      
      // Now refresh merchant - this will also check suspension via /auth/me
      try {
        await refreshMerchant();
        
        // Double-check by calling /auth/me directly - if suspended, this will return 403
        const merchantResponse = await api.get('/auth/me');
        if (merchantResponse.data?.data) {
          // All checks passed, redirect to dashboard
          router.push('/dashboard/overview');
        }
      } catch (meError: any) {
        // Check for suspension errors (403 Forbidden or 401 with suspension message)
        const status = meError?.response?.status;
        const errorMessage = meError?.response?.data?.error || meError?.message || '';
        const isSuspended = status === 403 || 
                           (status === 401 && errorMessage.toLowerCase().includes('suspended')) ||
                           errorMessage.toLowerCase().includes('suspended');
        
        if (isSuspended) {
          await supabase.auth.signOut();
          setError('Account has been suspended. Please contact support for assistance.');
          setLoading(false);
          return;
        } else {
          throw meError;
        }
      }
    } catch (error: any) {
      // Check for suspension errors (403 Forbidden or 401 with suspension message)
      const status = error?.response?.status;
      const errorMessage = error?.response?.data?.error || error?.message || '';
      const isSuspended = status === 403 || 
                         (status === 401 && errorMessage.toLowerCase().includes('suspended')) ||
                         errorMessage.toLowerCase().includes('suspended');
      
      if (isSuspended) {
        await supabase.auth.signOut();
        setError('Account has been suspended. Please contact support for assistance.');
      } else {
        setError(error?.message || error?.response?.data?.error || 'Verification failed');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--suzaa-surface-subtle)] px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--suzaa-border)] bg-white/90 shadow-soft backdrop-blur">
        <div
          className="px-6 py-8 text-center"
          style={{ background: 'linear-gradient(135deg, #0a84ff 0%, #00b8a9 100%)' }}
        >
          <div className="inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-sm font-semibold text-white shadow-soft">
              Σ
            </div>
            <div className="text-left text-white">
              <p className="text-[0.6rem] uppercase tracking-[0.32em] text-white/60">Merchant Portal</p>
              <h1 className="text-xl font-semibold uppercase tracking-[0.24em] text-white">SuzAA Access</h1>
            </div>
          </div>
          <p className="mt-4 text-xs text-white/80">
            Passwordless entry to manage payment links, wallets, and settlements.
          </p>
        </div>

        <div className="bg-white px-5 pt-5">
          <div className="flex rounded-2xl border border-[var(--suzaa-border)] bg-[var(--suzaa-surface-muted)] p-1">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                mode === 'login'
                  ? 'bg-white text-[var(--suzaa-navy)] shadow-soft'
                  : mode === 'verify-login'
                    ? 'bg-white text-[var(--suzaa-navy)] shadow-soft'
                    : 'text-[var(--suzaa-muted)] hover:text-[var(--suzaa-blue)]'
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                mode === 'register' || mode === 'verify-register'
                  ? 'bg-white text-[var(--suzaa-navy)] shadow-soft'
                  : 'text-[var(--suzaa-muted)] hover:text-[var(--suzaa-blue)]'
              }`}
            >
              Create account
            </button>
          </div>
        </div>

        <div className="bg-white px-6 py-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-[var(--suzaa-navy)]">
              {mode.includes('verify')
                ? 'Verify your one-time PIN'
                : mode === 'login'
                  ? 'Access your control centre'
                  : 'Onboard your merchant account'}
            </h2>
            <p className="mt-2 text-xs text-[var(--suzaa-muted)]">
              {mode.includes('verify')
                ? 'Enter the 6-digit code we delivered to your inbox.'
                : mode === 'login'
                  ? 'Passwordless entry powered by email verification.'
                  : 'We will send a verification PIN to activate your workspace.'}
            </p>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-sm text-[var(--suzaa-danger)]">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-5 rounded-2xl border border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.08)] px-4 py-3 text-sm text-[var(--suzaa-success)]">
              {message}
            </div>
          )}

          <div className="mt-6 space-y-6">
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--suzaa-muted)]">
                    Work email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input mt-2"
                    placeholder="merchant@company.com"
                    required
                  />
                  <p className="mt-2 text-xs text-[var(--suzaa-muted)]">
                    We'll send a login PIN to this address.
                  </p>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                  {loading ? 'Sending PIN…' : 'Send login PIN'}
                </button>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--suzaa-muted)]">
                    Business name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="input mt-2"
                    placeholder="ACME Payments Ltd."
                    required
                  />
                </div>

                <div>
                  <label className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--suzaa-muted)]">
                    Work email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input mt-2"
                    placeholder="ops@acme.com"
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                  {loading ? 'Sending PIN…' : 'Register & send PIN'}
                </button>
              </form>
            )}

            {(mode === 'verify-register' || mode === 'verify-login') && (
              <form onSubmit={handleVerify} className="space-y-5">
                <div>
                  <label className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--suzaa-muted)]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input mt-2"
                    required
                  />
                </div>

                <div>
                  <label className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--suzaa-muted)]">
                    Verification PIN
                  </label>
                  <input
                    type="text"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="input mt-2 tracking-[0.4em] text-center font-mono text-lg"
                    placeholder="••••••"
                    maxLength={6}
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                  {loading ? 'Verifying…' : 'Verify & continue'}
                </button>
              </form>
            )}

            {mode !== 'login' && !mode.includes('verify') && (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="btn-ghost w-full justify-center text-[var(--suzaa-blue)] hover:text-[var(--suzaa-teal)]"
              >
                Already have access? Sign in
              </button>
            )}

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => setMode('register')}
                className="btn-ghost w-full justify-center text-[var(--suzaa-blue)] hover:text-[var(--suzaa-teal)]"
              >
                Need an account? Create one
              </button>
            )}

            {mode.includes('verify') && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setPin('');
                }}
                className="btn-ghost w-full justify-center text-[var(--suzaa-blue)] hover:text-[var(--suzaa-teal)]"
              >
                Back to sign in
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-[var(--suzaa-border)] bg-white/90 px-6 py-4 text-center text-[0.65rem] uppercase tracking-[0.24em] text-[var(--suzaa-muted)]">
          Powered by <span className="font-semibold text-[var(--suzaa-navy)]">SUZAA</span>
        </div>
      </div>
    </div>
  );
}
