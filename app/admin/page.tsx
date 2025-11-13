'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminSupabase } from '@/app/lib/adminSupabase';
import { Shield } from 'lucide-react';

const GATE_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_GATE_PASSWORD!;

type Mode = 'gate' | 'login' | 'register' | 'verify';

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('gate');
  const [gatePassword, setGatePassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if already passed gate
    const gatePassed = sessionStorage.getItem('admin_gate_passed');
    if (gatePassed === 'true') {
      setMode('login');
    }
  }, []);

  function handleGateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (gatePassword === GATE_PASSWORD) {
      sessionStorage.setItem('admin_gate_passed', 'true');
      setMode('login');
      setError('');
    } else {
      setError('Invalid access code');
      setGatePassword('');
    }
  }

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { error: err } = await adminSupabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: mode === 'register' }
      });
      if (err) throw err;
      setMessage('Check your email for the admin login PIN!');
      setMode('verify');
    } catch (err: any) {
      setError(err?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: err } = await adminSupabase.auth.verifyOtp({
        email,
        token: pin,
        type: 'email'
      });
      if (err) throw err;

      if (mode === 'verify' && name) {
        try {
          const { data: { session } } = await adminSupabase.auth.getSession();
          const response = await fetch('https://api.suzaa.com/admin/bootstrap', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session?.access_token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
          });
          
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error);
          }
        } catch (bootstrapError: any) {
          setError(bootstrapError.message || 'Failed to create admin account');
          setLoading(false);
          return;
        }
      }
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  // Password Gate Screen
  if (mode === 'gate') {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--suzaa-surface-subtle)] px-4 py-12">
        <div className="absolute inset-0 bg-gradient-midnight opacity-95" />
        <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/92 shadow-2xl backdrop-blur-lg">
          <div className="px-10 py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-red-600 text-white shadow-lg mb-6">
                <Shield className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-semibold text-[var(--suzaa-navy)]">Restricted Access</h1>
              <p className="mt-2 text-sm text-[var(--suzaa-muted)]">Enter access code to continue</p>
            </div>
            {error && <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div>}
            <form onSubmit={handleGateSubmit} className="mt-8 space-y-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--suzaa-muted)]">Access Code</label>
                <input 
                  type="password" 
                  value={gatePassword} 
                  onChange={(e) => setGatePassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="input mt-2" 
                  required 
                  autoFocus 
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                Verify Access
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // PIN Verification Screen
  if (mode === 'verify') {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--suzaa-surface-subtle)] px-4 py-12">
        <div className="absolute inset-0 bg-gradient-midnight opacity-95" />
        <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-white/92 shadow-2xl backdrop-blur-lg">
          <div className="px-10 py-12">
            <div className="text-center">
              <div className="inline-flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--suzaa-navy)] text-sm font-semibold text-white shadow-soft">Σ</div>
                <div><p className="text-sm font-semibold text-[var(--suzaa-navy)]">SUZAA</p><p className="text-xs uppercase tracking-[0.32em] text-[var(--suzaa-muted)]">Super Admin</p></div>
              </div>
              <h1 className="mt-6 text-2xl font-semibold text-[var(--suzaa-navy)]">Verify PIN</h1>
            </div>
            {error && <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div>}
            {message && <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}
            <form onSubmit={handleVerify} className="mt-6 space-y-5">
              <input type="email" value={email} disabled className="input" />
              <input type="text" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="• • • • • •" className="input text-center text-2xl tracking-[0.5em]" maxLength={6} required autoFocus />
              <button type="submit" disabled={loading || pin.length !== 6} className="btn-primary w-full justify-center">{loading ? 'Verifying...' : 'Verify'}</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Login/Register Screen
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--suzaa-surface-subtle)] px-4 py-12">
      <div className="absolute inset-0 bg-gradient-midnight opacity-95" />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-white/92 shadow-2xl backdrop-blur-lg">
        <div className="px-10 py-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--suzaa-navy)] text-sm font-semibold text-white shadow-soft">Σ</div>
              <div><p className="text-sm font-semibold text-[var(--suzaa-navy)]">SUZAA</p><p className="text-xs uppercase tracking-[0.32em] text-[var(--suzaa-muted)]">Super Admin</p></div>
            </div>
            <h1 className="mt-6 text-2xl font-semibold text-[var(--suzaa-navy)]">Super Admin Access</h1>
            <p className="mt-2 text-sm text-[var(--suzaa-muted)]">Separate authentication for administrators</p>
          </div>
          <div className="mt-8 flex rounded-xl bg-[var(--suzaa-surface-muted)] p-1">
            <button onClick={() => setMode('login')} className={`flex-1 rounded-lg py-2.5 text-sm font-medium ${mode === 'login' ? 'bg-white shadow-soft' : ''}`}>Sign in</button>
            <button onClick={() => setMode('register')} className={`flex-1 rounded-lg py-2.5 text-sm font-medium ${mode === 'register' ? 'bg-white shadow-soft' : ''}`}>Create account</button>
          </div>
          {error && <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div>}
          <form onSubmit={handleSendOTP} className="mt-6 space-y-5">
            {mode === 'register' && <div><label className="text-xs font-semibold uppercase tracking-wider text-[var(--suzaa-muted)]">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" className="input mt-2" required /></div>}
            <div><label className="text-xs font-semibold uppercase tracking-wider text-[var(--suzaa-muted)]">Admin Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@suzaa.com" className="input mt-2" required /></div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">{loading ? 'Sending...' : 'Send PIN'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
