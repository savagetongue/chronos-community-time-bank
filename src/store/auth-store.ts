import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/types/database';
import { supabase } from '@/lib/supabase';
interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  setSession: (user: User | null, profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
}
export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    user: null,
    profile: null,
    isLoading: true,
    setSession: (user, profile) => {
      set((state) => {
        state.user = user;
        state.profile = profile;
        state.isLoading = false;
      });
    },
    setLoading: (loading) => {
      set((state) => {
        state.isLoading = loading;
      });
    },
    signOut: async () => {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Sign out error:', error);
      }
      set((state) => {
        state.user = null;
        state.profile = null;
      });
    },
  }))
);
// Export getState for non-hook usage if strictly necessary, though hooks are preferred
export const getAuthStoreState = () => useAuthStore.getState();