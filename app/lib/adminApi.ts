import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - get token from ADMIN Supabase
adminApi.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const { adminSupabase } = await import('@/app/lib/adminSupabase');
    const { data: { session } } = await adminSupabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  }
  return config;
});

// Response interceptor
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const logPayload = ['Admin API Error:', status, data];
      if (status >= 500) {
        console.error(...logPayload);
      } else {
        console.warn(...logPayload);
      }
    }
    return Promise.reject(error);
  }
);
