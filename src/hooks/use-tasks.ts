import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Task, TaskType, TaskMode, Escrow } from '@/types/database';
import { subDays } from 'date-fns';
export interface TaskFilters {
  search: string;
  type: TaskType | 'all';
  mode: TaskMode | 'all';
  minCredits: number;
  maxCredits: number;
}
// Mock data for demonstration when DB is empty
const MOCK_TASKS: Task[] = [
  {
    id: '1',
    creator_id: 'mock-user-1',
    type: 'offer',
    title: 'Guitar Lessons for Beginners',
    description: 'I can teach you the basics of acoustic guitar. We will cover chords, strumming patterns, and simple songs. I have 5 years of teaching experience.',
    estimated_credits: 1,
    mode: 'online',
    status: 'open',
    max_participants: 1,
    travel_allowance: 0,
    cancellation_policy: 'flexible',
    location_city: null,
    location_state: null,
    location_country: null,
    location_lat: null,
    location_lng: null,
    online_platform: 'Zoom',
    online_link: null,
    proposed_times: [],
    confirmed_time: null,
    created_at: subDays(new Date(), 2).toISOString(),
    updated_at: subDays(new Date(), 2).toISOString(),
  },
  {
    id: '2',
    creator_id: 'mock-user-2',
    type: 'request',
    title: 'Help moving a sofa',
    description: 'I need strong hands to help me move a sofa to the second floor. Should take about 30 minutes.',
    estimated_credits: 2,
    mode: 'in_person',
    status: 'open',
    max_participants: 2,
    travel_allowance: 1,
    cancellation_policy: 'moderate',
    location_city: 'San Francisco',
    location_state: 'CA',
    location_country: 'USA',
    location_lat: 37.7749,
    location_lng: -122.4194,
    online_platform: null,
    online_link: null,
    proposed_times: [],
    confirmed_time: null,
    created_at: subDays(new Date(), 1).toISOString(),
    updated_at: subDays(new Date(), 1).toISOString(),
  },
  {
    id: '3',
    creator_id: 'mock-user-3',
    type: 'offer',
    title: 'React & TypeScript Mentorship',
    description: 'Senior engineer offering code review and mentorship sessions. I can help you debug issues or understand complex concepts.',
    estimated_credits: 3,
    mode: 'online',
    status: 'open',
    max_participants: 1,
    travel_allowance: 0,
    cancellation_policy: 'strict',
    location_city: null,
    location_state: null,
    location_country: null,
    location_lat: null,
    location_lng: null,
    online_platform: 'Google Meet',
    online_link: null,
    proposed_times: [],
    confirmed_time: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
export function useTasks(filters?: TaskFilters, userId?: string) {
  return useQuery({
    queryKey: ['tasks', filters, userId],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*, profiles(display_name, reputation_score)')
        .order('created_at', { ascending: false });
      if (userId) {
        // For dashboard: show tasks where user is creator OR (future) provider
        // Since we don't have a many-to-many relation easily queryable here without complex joins,
        // we'll just fetch created tasks for now.
        // In a real app, we'd query escrows or a participants table.
        query = query.eq('creator_id', userId);
      } else {
        // Public marketplace: only open tasks
        query = query.eq('status', 'open');
      }
      if (filters) {
        if (filters.type !== 'all') {
          query = query.eq('type', filters.type);
        }
        if (filters.mode !== 'all') {
          query = query.eq('mode', filters.mode);
        }
        if (filters.search) {
          query = query.ilike('title', `%${filters.search}%`);
        }
      }
      const { data, error } = await query;
      if (error) {
        console.error('Error fetching tasks:', error);
        // Fallback to mocks if DB is empty or error
        let mocks = MOCK_TASKS;
        if (userId) mocks = []; // No mocks for specific user dashboard to avoid confusion
        return mocks.filter(t => {
          if (!filters) return true;
          if (filters.type !== 'all' && t.type !== filters.type) return false;
          if (filters.mode !== 'all' && t.mode !== filters.mode) return false;
          if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
          return true;
        });
      }
      // Client-side filtering for credits since it's a range
      let result = data as unknown as (Task & { profiles: { display_name: string, reputation_score: number } })[];
      if (filters) {
        result = result.filter(t => t.estimated_credits <= filters.maxCredits && t.estimated_credits >= filters.minCredits);
      }
      return result;
    },
  });
}
export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      // Check mocks first for demo
      const mock = MOCK_TASKS.find(t => t.id === id);
      if (mock) return { ...mock, profiles: { display_name: 'Mock User', reputation_score: 100 } };
      const { data, error } = await supabase
        .from('tasks')
        .select('*, profiles(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Task & { profiles: { display_name: string, reputation_score: number } };
    },
    enabled: !!id,
  });
}
// Correct type for task creation to avoid 'Partial<Task>' mismatch
type CreateTaskInput = Omit<Task, 'id' | 'created_at' | 'updated_at' | 'proposed_times' | 'confirmed_time'> & {
  creator_id: string;
  proposed_times?: string[] | null;
};
export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newTask: CreateTaskInput) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask as any) // Cast to any to bypass strict Partial<Task> check if needed, or match exact shape
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
export function useAcceptTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, userId }: { taskId: string; userId: string }) => {
      // In a real app, this calls a Supabase Edge Function
      // const { data, error } = await supabase.functions.invoke('accept-task', { body: { taskId, userId } });
      // Mocking the Edge Function logic:
      // 1. Check if task exists and is open
      // 2. Lock credits (create escrow)
      // 3. Update task status to 'accepted'
      console.log(`Mocking accept task ${taskId} by ${userId}`);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Mock DB updates
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ status: 'accepted' } as any)
        .eq('id', taskId);
      if (updateError) {
        console.warn('Mock update failed (likely RLS or no DB), proceeding with mock success');
      }
      // Return mock escrow object
      const mockEscrow: Escrow = {
        id: `escrow-${Date.now()}`,
        task_id: taskId,
        requester_id: 'req-id', // would be dynamic
        provider_id: userId,
        credits_locked: 5,
        credits_released: 0,
        status: 'locked',
        locked_at: new Date().toISOString(),
        auto_release_at: null,
        released_at: null,
        dispute_id: null,
        is_finalized: false,
        created_at: new Date().toISOString()
      };
      return mockEscrow;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['active-tasks'] });
    },
  });
}
export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['task', data.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });
}
export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      // Mock check-in logic
      // In real app: update metadata or check-in table
      // Here: update status to in_progress if not already
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: 'in_progress' } as any)
        .eq('id', taskId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['task', data.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });
}
export function useCompleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      // Mock completion logic
      // 1. Release escrow (Edge Function)
      // 2. Update task status to completed
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: 'completed' } as any)
        .eq('id', taskId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['task', data.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });
}