'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase';
import { api, type ApiError } from '@/app/lib/api';
import type { ApiResponse as BackendResponse } from '@/app/types';

interface MerchantProfile {
  id: string;
  slug: string;
  email: string;
  businessName: string;
  defaultCurrency: string;
  timezone: string;
  maxBuyerOrdersPerHour: number;
  allowUnsolicitedPayments: boolean;
  defaultPaymentExpiryMinutes: number;
  settleTolerancePct: number;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

interface AuthContextType {
  supabase: ReturnType<typeof createClient>;
  user: User | null;
  loading: boolean;
  merchant: MerchantProfile | null;
  merchantLoading: boolean;
  refreshMerchant: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [merchant, setMerchant] = useState<MerchantProfile | null>(null);
  const [merchantLoading, setMerchantLoading] = useState(false);

  const refreshMerchant = useCallback(async () => {
    setMerchantLoading(true);
    try {
      const response = await api.get<BackendResponse<MerchantProfile>>('/auth/me');
      const payload = response.data;
      if (payload && 'data' in payload && payload.data) {
        setMerchant(payload.data);
      } else {
        setMerchant(null);
      }
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError?.status === 404) {
        setMerchant(null);
      } else {
        console.error('Unable to load merchant profile', error);
      }
    } finally {
      setMerchantLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        refreshMerchant();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        refreshMerchant();
      } else {
        setMerchant(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, refreshMerchant]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setMerchant(null);
  }, [supabase]);

  const value: AuthContextType = {
    supabase,
    user,
    loading,
    merchant,
    merchantLoading,
    refreshMerchant,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
