import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Profile, Dispute, Review, Notification } from '@/types/database';
import { toast } from 'sonner';
// --- User Management ---
export function useUnapprovedUsers() {
  return useQuery({
    queryKey: ['admin', 'users', 'unapproved'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });
}
export function useApproveUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ is_approved: true } as any)
          .eq('id', userId);
        if (error) throw error;
      } catch (error) {
        console.error('Approve user error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User approved successfully');
    },
    onError: (error) => {
      toast.error(`Failed to approve user: ${error.message}`);
    }
  });
}
export function useRejectUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      try {
        // In a real app, maybe delete or mark as rejected. Here we'll just suspend/hide.
        const { error } = await supabase
          .from('profiles')
          .update({ is_suspended: true } as any)
          .eq('id', userId);
        if (error) throw error;
      } catch (error) {
        console.error('Reject user error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User rejected/suspended');
    },
    onError: (error) => {
      toast.error(`Failed to reject user: ${error.message}`);
    }
  });
}
// --- Dispute Management ---
export function useDisputes() {
  return useQuery({
    queryKey: ['admin', 'disputes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('disputes')
        .select('*, escrows(*, tasks(*))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as (Dispute & { escrows: any })[];
    },
  });
}
export function useResolveDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ disputeId, decision, payload }: { disputeId: string, decision: string, payload: { splitPercentage?: number; notes?: string } }) => {
      try {
        // 1. Update dispute status
        const { error: disputeError } = await supabase
          .from('disputes')
          .update({ 
            status: 'resolved', 
            admin_decision: decision, 
            admin_decision_payload: payload,
            resolved_at: new Date().toISOString()
          } as any)
          .eq('id', disputeId);
        if (disputeError) throw disputeError;
        // 2. In a real app, trigger Edge Function to actually move credits based on decision
        // Here we mock the escrow update
        // const { error: escrowError } = await supabase.from('escrows').update({ status: 'released' })...
      } catch (error) {
        console.error('Resolve dispute error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'disputes'] });
      toast.success('Dispute resolved');
    },
    onError: (error) => {
      toast.error(`Failed to resolve dispute: ${error.message}`);
    }
  });
}
// --- Review Moderation ---
export function useAdminReviews() {
  return useQuery({
    queryKey: ['admin', 'reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
  });
}
export function useModerateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ reviewId, isHidden }: { reviewId: string, isHidden: boolean }) => {
      try {
        const { error } = await supabase
          .from('reviews')
          .update({ is_hidden: isHidden } as any)
          .eq('id', reviewId);
        if (error) throw error;
      } catch (error) {
        console.error('Moderate review error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      toast.success('Review updated');
    },
    onError: (error) => {
      toast.error(`Failed to update review: ${error.message}`);
    }
  });
}
// --- Notifications ---
export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!userId,
  });
}
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true } as any)
          .eq('id', notificationId);
        if (error) throw error;
      } catch (error) {
        console.error('Mark notification read error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Failed to mark notification as read:', error);
    }
  });
}
// --- Stats ---
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      // Mock aggregation or use Supabase count
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: disputeCount } = await supabase.from('disputes').select('*', { count: 'exact', head: true });
      const { count: taskCount } = await supabase.from('tasks').select('*', { count: 'exact', head: true });
      return {
        users: userCount || 0,
        disputes: disputeCount || 0,
        tasks: taskCount || 0,
      };
    },
  });
}