import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './navbar';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { Profile } from '@/types/database';
import { Toaster } from '@/components/ui/sonner';
export function MainLayout() {
  // Selectors - primitive only to prevent infinite loops
  const setSession = useAuthStore((s) => s.setSession);
  const setLoading = useAuthStore((s) => s.setLoading);
  const isLoading = useAuthStore((s) => s.isLoading);
  // Local state to ensure we don't render Outlet before auth is checked
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      // Only set loading if not already checked to avoid flicker
      if (!isAuthChecked) {
        setLoading(true);
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
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
          setIsAuthChecked(true);
        }
      } catch (error) {
        console.error('Auth init failed:', error);
        if (mounted) {
          setSession(null, null);
          setIsAuthChecked(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    initAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setSession(session.user, profile as Profile | null);
      } else {
        setSession(null, null);
      }
      setIsAuthChecked(true);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setSession, setLoading]);
  return (
    <div className="min-h-screen bg-background font-sans antialiased flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
          {/* Prevent rendering routes until we know auth state to avoid redirects/flickers */}
          {!isAuthChecked && isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse text-muted-foreground">Loading application...</div>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </main>
      <footer className="border-t border-border/40 bg-background/95 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-4" />
        </div>
      </footer>
      <Toaster richColors />
    </div>
  );
}