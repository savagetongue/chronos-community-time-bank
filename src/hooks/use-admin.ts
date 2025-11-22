import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { Profile, Dispute, Review, Notification, ProfileUpdate, DisputeUpdate, ReviewUpdate, NotificationUpdate, Json, DisputeStatus } from '@/types/database';
import { toast } from 'sonner';
// --- User Management ---
export function useUnapprovedUsers() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const channel = supabase.channel('admin-profiles')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
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
      if (!userId) throw new Error('User ID required');
      try {
        // Use admin client to bypass RLS
        const updatePayload: ProfileUpdate = { is_approved: true };
        const { error } = await supabaseAdmin
          .from('profiles')
          .update(updatePayload)
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
      if (!userId) throw new Error('User ID required');
      try {
        const updatePayload: ProfileUpdate = { is_suspended: true };
        const { error } = await supabaseAdmin
          .from('profiles')
          .update(updatePayload)
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
  const queryClient = useQueryClient();
  useEffect(() => {
    const channel = supabase.channel('admin-disputes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'disputes' }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'disputes'] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  return useQuery({
    queryKey: ['admin', 'disputes'],
    queryFn: async () => {
      // Use admin client to ensure we see ALL disputes regardless of RLS
      const { data, error } = await supabaseAdmin
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
      if (!disputeId) throw new Error('Dispute ID required');
      try {
        // 1. Update dispute status
        const updatePayload: DisputeUpdate = {
            status: 'resolved' as DisputeStatus,
            admin_decision: decision,
            admin_decision_payload: payload as unknown as Json,
            resolved_at: new Date().toISOString()
        };
        const { error: disputeError } = await supabaseAdmin
          .from('disputes')
          .update(updatePayload)
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
  const queryClient = useQueryClient();
  useEffect(() => {
    const channel = supabase.channel('admin-reviews')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
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
      if (!reviewId) throw new Error('Review ID required');
      try {
        const updatePayload: ReviewUpdate = { is_hidden: isHidden };
        const { error } = await supabaseAdmin
          .from('reviews')
          .update(updatePayload)
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
      if (!notificationId) throw new Error('Notification ID required');
      try {
        const updatePayload: NotificationUpdate = { is_read: true };
        const { error } = await supabase
          .from('notifications')
          .update(updatePayload)
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