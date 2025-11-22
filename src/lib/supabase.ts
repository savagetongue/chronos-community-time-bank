import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database'; // We will define this next
// Use environment variables with fallback for development safety (though env vars are expected)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing! Authentication features will not work.');
}
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);