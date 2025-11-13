import axios from 'axios';
import { createClient } from '@/lib/supabase';

const API_URL =
  process.env.NEXT_PUBLIC_SUPER_ADMIN_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://api.suzaa.com';

export interface ApiError {
  status?: number;
  message?: string;
  payload?: {
    error?: string;
    [key: string]: any;
  };
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - use Supabase session token
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError: ApiError = {
      status: error.response?.status,
      message: error.message,
      payload: error.response?.data,
    };

    if (error.response) {
      const { status, data } = error.response;
      const logPayload = ['API Error:', status, data];
      if (status >= 500) {
        console.error(...logPayload);
      } else {
        console.warn(...logPayload);
      }
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(apiError);
  }
);
