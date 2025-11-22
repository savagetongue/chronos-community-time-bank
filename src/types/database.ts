export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
      };
      tasks: {
        Row: Task;
        Insert: Partial<Task>;
        Update: Partial<Task>;
      };
      escrows: {
        Row: Escrow;
        Insert: Partial<Escrow>;
        Update: Partial<Escrow>;
      };
      reviews: {
        Row: Review;
        Insert: Partial<Review>;
        Update: Partial<Review>;
      };
    };
  };
}
export interface Profile {
  id: string;
  display_name: string | null;
  email: string;
  bio: string | null;
  skills: string[];
  credits: number;
  locked_credits: number;
  reputation_score: number;
  completed_tasks_count: number;
  is_approved: boolean;
  is_suspended: boolean;
  kyc_level: number;
  created_at: string;
  updated_at: string;
}
export type TaskType = 'offer' | 'request';
export type TaskMode = 'online' | 'in_person' | 'hybrid';
export type TaskStatus = 'open' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
export interface Task {
  id: string;
  creator_id: string;
  type: TaskType;
  title: string;
  description: string;
  estimated_credits: number;
  mode: TaskMode;
  status: TaskStatus;
  max_participants: number;
  travel_allowance: number;
  cancellation_policy: string;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  location_lat: number | null;
  location_lng: number | null;
  online_platform: string | null;
  online_link: string | null;
  created_at: string;
  updated_at: string;
}
export type EscrowStatus = 'locked' | 'released' | 'refunded' | 'disputed';
export interface Escrow {
  id: string;
  task_id: string;
  requester_id: string;
  provider_id: string;
  credits_locked: number;
  credits_released: number;
  status: EscrowStatus;
  locked_at: string;
  auto_release_at: string | null;
  released_at: string | null;
  dispute_id: string | null;
  is_finalized: boolean;
  created_at: string;
}
export interface Review {
  id: string;
  task_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  tags: string[];
  is_anonymous: boolean;
  created_at: string;
}