import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Task, TaskType, TaskMode, Escrow, Review, Dispute, Database, FileRecord } from '@/types/database';
import { subDays } from 'date-fns';
import { toast } from 'sonner';
export interface TaskFilters {
  search: string;
  type: TaskType | 'all';
  mode: TaskMode | 'all';
  minCredits: number;
  maxCredits: number;
}
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
    visibility: 'public',
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
    updated_at: subDays(new Date(), 2).toISOString()
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
    visibility: 'public',
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
    updated_at: subDays(new Date(), 1).toISOString()
  }
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
        query = query.eq('creator_id', userId);
      } else {
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
        // Fallback to mock data if DB fails (e.g. RLS issues or empty DB)
        let mocks = MOCK_TASKS;
        if (userId) mocks = []; // Don't show mocks for specific user queries to avoid confusion
        return mocks.filter((t) => {
          if (!filters) return true;
          if (filters.type !== 'all' && t.type !== filters.type) return false;
          if (filters.mode !== 'all' && t.mode !== filters.mode) return false;
          if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
          return true;
        });
      }
      let result = data as unknown as (Task & { profiles: { display_name: string; reputation_score: number } })[];
      if (filters) {
        result = result.filter((t) => t.estimated_credits <= filters.maxCredits && t.estimated_credits >= filters.minCredits);
      }
      return result;
    }
  });
}
export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      // Check mocks first for demo purposes
      const mock = MOCK_TASKS.find((t) => t.id === id);
      if (mock) return { ...mock, profiles: { display_name: 'Mock User', reputation_score: 100 } };
      const { data, error } = await supabase
        .from('tasks')
        .select('*, profiles(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Task & { profiles: { display_name: string; reputation_score: number } };
    },
    enabled: !!id
  });
}
type CreateTaskInput = Database['public']['Tables']['tasks']['Insert'];
export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation<Task, Error, CreateTaskInput>({
    mutationFn: async (newTask) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single();
      if (error) throw error;
      if (!data) throw new Error('No data returned from task creation');
      return data as Task;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
    }
  });
}
export function useAcceptTask() {
  const queryClient = useQueryClient();
  return useMutation<Escrow, Error, { taskId: string; userId: string }>({
    mutationFn: async ({ taskId, userId }) => {
      if (!taskId) throw new Error('Task ID required');
      // In a real app, this would be an Edge Function call
      // supabase.functions.invoke('accept-task', { body: { taskId, userId } })
      // For now, we manually update the task status
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ status: 'accepted' })
        .eq('id', taskId);
      if (updateError) console.warn('Mock update failed, proceeding with mock escrow');
      // Create a real escrow record if possible, otherwise mock
      const escrowData: Database['public']['Tables']['escrows']['Insert'] = {
        task_id: taskId,
        requester_id: 'req-id', // Placeholder, ideally fetched from task
        provider_id: userId,
        credits_locked: 5,
        credits_released: 0,
        status: 'locked',
        locked_at: new Date().toISOString(),
        is_finalized: false
      };
      // Try to insert real escrow
      const { data, error } = await supabase.from('escrows').insert(escrowData).select().single();
      if (error) {
          console.warn('Escrow insert failed (likely RLS or missing task data), using mock', error);
          return {
            ...escrowData,
            id: `escrow-${Date.now()}`,
            created_at: new Date().toISOString(),
            auto_release_at: null,
            released_at: null,
            dispute_id: null
          } as Escrow;
      }
      return data as Escrow;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['active-tasks'] });
    }
  });
}
export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation<Task, Error, { id: string; updates: Database['public']['Tables']['tasks']['Update'] }>({
    mutationFn: async ({ id, updates }) => {
      if (!id) throw new Error('Task ID required');
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      if (!data) throw new Error('No data returned from task update');
      return data as Task;
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
  return useMutation<Task, Error, string>({
    mutationFn: async (taskId) => {
      if (!taskId) throw new Error('Task ID required');
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: 'in_progress' })
        .eq('id', taskId)
        .select()
        .single();
      if (error) throw error;
      if (!data) throw new Error('No data returned from check-in');
      return data as Task;
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
  return useMutation<Task, Error, string>({
    mutationFn: async (taskId) => {
      if (!taskId) throw new Error('Task ID required');
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: 'completed' })
        .eq('id', taskId)
        .select()
        .single();
      if (error) throw error;
      if (!data) throw new Error('No data returned from completion');
      return data as Task;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['task', data.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });
}
export function useAddReview() {
  const queryClient = useQueryClient();
  return useMutation<Review, Error, Database['public']['Tables']['reviews']['Insert']>({
    mutationFn: async (review) => {
      const { data, error } = await supabase
        .from('reviews')
        .insert(review)
        .select()
        .single();
      if (error) throw error;
      if (!data) throw new Error('No data returned from review submission');
      return data as Review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Review submitted successfully');
    }
  });
}
export function useRaiseDispute() {
  const queryClient = useQueryClient();
  return useMutation<Dispute, Error, Database['public']['Tables']['disputes']['Insert']>({
    mutationFn: async (dispute) => {
      const { data, error } = await supabase
        .from('disputes')
        .insert(dispute)
        .select()
        .single();
      if (error) throw error;
      if (!data) throw new Error('No data returned from dispute creation');
      if (dispute.escrow_id) {
        await supabase
          .from('escrows')
          .update({ status: 'disputed', dispute_id: data.id })
          .eq('id', dispute.escrow_id);
      }
      return data as Dispute;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Dispute raised. Admin will review shortly.');
    }
  });
}
export function useUploadEvidence() {
  const queryClient = useQueryClient();
  return useMutation<FileRecord, Error, { file: File; taskId: string; userId: string }>({
    mutationFn: async ({ file, taskId, userId }) => {
      // 1. Upload to Storage
      const filePath = `${taskId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('evidence')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      if (!uploadData) throw new Error('Upload failed');
      // 2. Get Public URL
      const { data: urlData } = supabase.storage
        .from('evidence')
        .getPublicUrl(uploadData.path);
      // 3. Insert into files table
      const fileRecord: Database['public']['Tables']['files']['Insert'] = {
        owner_id: userId,
        bucket: 'evidence',
        path: uploadData.path,
        url: urlData.publicUrl,
        size_bytes: file.size,
        mime_type: file.type,
        file_hash: null,
        uploaded_at: new Date().toISOString()
      };
      const { data: fileData, error: dbError } = await supabase
        .from('files')
        .insert(fileRecord)
        .select()
        .single();
      if (dbError) throw dbError;
      if (!fileData) throw new Error('Database insert failed');
      return fileData as FileRecord;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task-files', variables.taskId] });
      toast.success('Evidence uploaded successfully');
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
    }
  });
}
export function useTaskFiles(taskId: string) {
  return useQuery({
    queryKey: ['task-files', taskId],
    queryFn: async () => {
      if (!taskId) return [];
      // Filter files by path prefix matching taskId
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .ilike('path', `${taskId}/%`)
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      return data as FileRecord[];
    },
    enabled: !!taskId
  });
}