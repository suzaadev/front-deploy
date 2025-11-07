'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if has token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        // Already logged in, redirect to overview
        router.push('/dashboard/overview');
      }
    }
  }, []);

  // Show login page (from before)
  return <LoginPage />;
}

function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'pin'>('email');
  const [pin, setPin] = useState('');
  const router = useRouter();

  async function handleRequestPin(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/auth/login', { email });
      setStep('pin');
      alert('Check your terminal for PIN');
    } catch (error) {
      alert('Error requesting PIN');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyPin(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post('/auth/verify', { email, pin });
      const token = response.data.data?.token;
      
      if (token) {
        localStorage.setItem('token', token);
        router.push('/dashboard/overview');
      } else {
        alert('Login failed - no token received');
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Invalid PIN');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="card max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Merchant Dashboard</h1>
        {step === 'email' ? (
          <form onSubmit={handleRequestPin}>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@suzaa.com"
              className="input mb-4"
              required
            />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyPin}>
            <p className="text-sm text-gray-600 mb-4">
              Enter PIN for <strong>{email}</strong>
            </p>
            <label className="block text-sm font-medium mb-2">PIN</label>
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="000000"
              maxLength={6}
              className="input mb-4 text-center text-2xl"
              autoFocus
              required
            />
            <button type="submit" disabled={loading} className="btn-primary w-full mb-2">
              {loading ? 'Verifying...' : 'Sign In'}
            </button>
            <button type="button" onClick={() => setStep('email')} className="btn-secondary w-full">
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { api } from '@/app/lib/api';
