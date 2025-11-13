import { createClient } from '@supabase/supabase-js';

const adminSupabaseUrl = process.env.NEXT_PUBLIC_ADMIN_SUPABASE_URL!;
const adminSupabaseAnonKey = process.env.NEXT_PUBLIC_ADMIN_SUPABASE_ANON_KEY!;

if (!adminSupabaseUrl || !adminSupabaseAnonKey) {
  throw new Error('Admin Supabase credentials not configured');
}

export const adminSupabase = createClient(adminSupabaseUrl, adminSupabaseAnonKey);
