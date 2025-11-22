import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing! Authentication features will not work.');
}
// Prevent crash by using fallback values if env vars are missing
// This allows the UI to render even if the backend connection is invalid
const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseAnonKey || 'placeholder';
export const supabase = createClient<Database>(url, key);