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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SUZAA</h1>
          <p className="text-gray-600">Super Admin Portal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">{message}</p>
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="admin@suzaa.com"
                required
              />
              <p className="text-xs text-gray-500 mt-1">We'll send a PIN to your email</p>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary mb-4">
              {loading ? 'Sending PIN...' : 'Send Login PIN'}
            </button>

            <button type="button" onClick={() => setMode('register')} className="w-full text-sm text-blue-600 hover:underline">
              No account? Register as Super Admin
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="admin@suzaa.com"
                required
              />
              <p className="text-xs text-gray-500 mt-1">We'll send a verification PIN to this email</p>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary mb-4">
              {loading ? 'Sending PIN...' : 'Register & Send PIN'}
            </button>

            <button type="button" onClick={() => setMode('login')} className="w-full text-sm text-blue-600 hover:underline">
              Already have an account? Login
            </button>
          </form>
        )}

        {(mode === 'verify-register' || mode === 'verify-login') && (
          <form onSubmit={handleVerify}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification PIN</label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="input"
                placeholder="Enter 6-digit PIN"
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Check your email for the PIN</p>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary mb-4">
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>

            <button type="button" onClick={() => { setMode('login'); setPin(''); }} className="w-full text-sm text-blue-600 hover:underline">
              Back to Login
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <a href="/dashboard" className="text-sm text-gray-600 hover:underline">
            ← Back to Merchant Login
          </a>
        </div>
      </div>
    </div>
  );
}
