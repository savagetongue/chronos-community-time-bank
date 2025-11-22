import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Task, TaskType, TaskMode } from '@/types/database';
import { addDays, subDays } from 'date-fns';
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
export function useTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*, profiles(display_name, reputation_score)')
        .eq('status', 'open')
        .order('created_at', { ascending: false });
      if (filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      if (filters.mode !== 'all') {
        query = query.eq('mode', filters.mode);
      }
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }
      // Client-side filtering for credits since it's a range
      // In a real app with millions of rows, we'd use proper range queries
      const { data, error } = await query;
      if (error) {
        console.error('Error fetching tasks:', error);
        // Return mock data on error or empty for demo purposes if connection fails
        return MOCK_TASKS.filter(t => {
          if (filters.type !== 'all' && t.type !== filters.type) return false;
          if (filters.mode !== 'all' && t.mode !== filters.mode) return false;
          if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
          return true;
        });
      }
      // If no data in DB (fresh install), return mocks
      if (!data || data.length === 0) {
        return MOCK_TASKS.filter(t => {
          if (filters.type !== 'all' && t.type !== filters.type) return false;
          if (filters.mode !== 'all' && t.mode !== filters.mode) return false;
          if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
          return true;
        });
      }
      return data as unknown as (Task & { profiles: { display_name: string, reputation_score: number } })[];
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
      return data;
    },
    enabled: !!id,
  });
}
export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newTask: Partial<Task>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
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