import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
const supabaseUrl = 'https://qogtrlkybrqkqopttxsp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZ3RybGt5YnJxa3FvcHR0eHNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjQ1NTcsImV4cCI6MjA3ODgwMDU1N30.u8u2gx99p2UtkllcHhrOhrKAZupdC3yTj8s-8MaZ7rs';
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
// Note: For admin/Edge Functions requiring service role, use SUPABASE_SERVICE_ROLE_KEY env var separately (e.g., in worker or functions), but frontend uses anon key for auth/signup.