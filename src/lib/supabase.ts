import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { toast } from 'sonner';
// Use environment variables with hardcoded fallbacks for preview/demo
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qogtrlkybrqkqopttxsp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZ3RybGt5YnJxa3FvcHR0eHNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjQ1NTcsImV4cCI6MjA3ODgwMDU1N30.u8u2gx99p2UtkllcHhrOhrKAZupdC3yTj8s-8MaZ7rs';
// Service role key for admin operations (should ideally be used only in server-side contexts)
// Fallback provided for demo purposes
const supabaseServiceUrl = import.meta.env.SUPABASE_URL || supabaseUrl;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZ3RybGt5YnJxa3FvcHR0eHNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzIyNDU1NywiZXhwIjoyMDc4ODAwNTU3fQ.y1Gn4NAPOQ7I0RJouHE6-Pq7Nk3x79BUy3JmUDC2vAg';
// Check for placeholders
if (!supabaseAnonKey || supabaseAnonKey.includes('placeholder')) {
  console.warn('Supabase placeholders detected. Authentication and DB operations may fail.');
}
// Main client for frontend operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
// Admin client for privileged operations (use with caution in client-side code)
// Configured with unique storage key to prevent "Multiple GoTrueClient" warnings
export const supabaseAdmin = createClient<Database>(supabaseServiceUrl, supabaseServiceKey, {
  auth: {
    storageKey: 'sb-admin-auth-token',
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});
// Helper to check env status
export const checkSupabaseEnv = () => {
  const isPlaceholder = !supabaseAnonKey || supabaseAnonKey.includes('placeholder');
  const isAdminPlaceholder = !supabaseServiceKey || supabaseServiceKey.includes('placeholder');
  if (isPlaceholder) {
    toast.error('Supabase environment variables missing or invalid. App running in limited demo mode.');
  } else if (isAdminPlaceholder) {
    console.warn('Admin service key is missing or placeholder. Admin operations may fail.');
  }
  return !isPlaceholder;
};