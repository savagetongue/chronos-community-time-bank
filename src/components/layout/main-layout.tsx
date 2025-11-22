import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './navbar';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { Profile } from '@/types/database';
import { Toaster } from '@/components/ui/sonner';
export function MainLayout() {
  const setSession = useAuthStore((s) => s.setSession);
  const setLoading = useAuthStore((s) => s.setLoading);
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Fetch profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setSession(session.user, profile as Profile | null);
        } else {
          setSession(null, null);
        }
      } catch (error) {
        console.error('Auth init failed:', error);
        setSession(null, null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Optionally refetch profile here if needed on session change
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setSession(session.user, profile as Profile | null);
      } else {
        setSession(null, null);
      }
    });
    return () => subscription.unsubscribe();
  }, [setSession, setLoading]);
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border/40 bg-background/95 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              &copy; {new Date().getFullYear()} Chronos Community Time Bank. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Built with ❤️ at Cloudflare
            </p>
          </div>
        </div>
      </footer>
      <Toaster richColors />
    </div>
  );
}