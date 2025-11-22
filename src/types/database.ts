export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]
  | undefined;
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      tasks: {
        Row: Task;
        Insert: TaskInsert;
        Update: TaskUpdate;
      };
      escrows: {
        Row: Escrow;
        Insert: EscrowInsert;
        Update: EscrowUpdate;
      };
      reviews: {
        Row: Review;
        Insert: ReviewInsert;
        Update: ReviewUpdate;
      };
      disputes: {
        Row: Dispute;
        Insert: DisputeInsert;
        Update: DisputeUpdate;
      };
      transactions: {
        Row: Transaction;
        Insert: TransactionInsert;
        Update: TransactionUpdate;
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsert;
        Update: NotificationUpdate;
      };
      files: {
        Row: FileRecord;
        Insert: FileRecordInsert;
        Update: FileRecordUpdate;
      };
    };
  };
}
// Helper to make all properties optional and nullable for Update types
// This ensures compatibility with Supabase's Partial<T> expectation
type UpdateType<T> = {
  [P in keyof T]?: T[P] | null | undefined;
};
// --- Profiles ---
export interface Profile {
  id: string;
  display_name: string | null;
  email: string;
  bio: string | null;
  skills: string[] | null;
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
export interface ProfileInsert {
  id: string;
  display_name?: string | null | undefined;
  email: string;
  bio?: string | null | undefined;
  skills?: string[] | null | undefined;
  credits?: number | null | undefined;
  locked_credits?: number | null | undefined;
  reputation_score?: number | null | undefined;
  completed_tasks_count?: number | null | undefined;
  is_approved?: boolean | null | undefined;
  is_suspended?: boolean | null | undefined;
  kyc_level?: number | null | undefined;
  created_at?: string | null | undefined;
  updated_at?: string | null | undefined;
}
export type ProfileUpdate = UpdateType<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
// --- Tasks ---
export type TaskType = 'offer' | 'request';
export type TaskMode = 'online' | 'in_person' | 'hybrid';
export type TaskStatus = 'open' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
export type TaskVisibility = 'public' | 'private';
export interface Task {
  id: string;
  creator_id: string;
  type: TaskType;
  title: string;
  description: string;
  estimated_credits: number;
  mode: TaskMode;
  status: TaskStatus;
  visibility: TaskVisibility;
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
  proposed_times: Json | null;
  confirmed_time: string | null;
  created_at: string;
  updated_at: string;
}
export interface TaskInsert {
  id?: string | undefined;
  creator_id: string;
  type: TaskType;
  title: string;
  description: string;
  estimated_credits: number;
  mode: TaskMode;
  status?: TaskStatus | null | undefined;
  visibility?: TaskVisibility | null | undefined;
  max_participants?: number | null | undefined;
  travel_allowance?: number | null | undefined;
  cancellation_policy?: string | null | undefined;
  location_city?: string | null | undefined;
  location_state?: string | null | undefined;
  location_country?: string | null | undefined;
  location_lat?: number | null | undefined;
  location_lng?: number | null | undefined;
  online_platform?: string | null | undefined;
  online_link?: string | null | undefined;
  proposed_times?: Json | null | undefined;
  confirmed_time?: string | null | undefined;
  created_at?: string | null | undefined;
  updated_at?: string | null | undefined;
}
export type TaskUpdate = UpdateType<Omit<Task, 'id' | 'created_at' | 'updated_at'>>;
// --- Escrows ---
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
export interface EscrowInsert {
  id?: string | undefined;
  task_id: string;
  requester_id: string;
  provider_id: string;
  credits_locked: number;
  credits_released?: number | null | undefined;
  status?: EscrowStatus | null | undefined;
  locked_at?: string | null | undefined;
  auto_release_at?: string | null | undefined;
  released_at?: string | null | undefined;
  dispute_id?: string | null | undefined;
  is_finalized?: boolean | null | undefined;
  created_at?: string | null | undefined;
}
export type EscrowUpdate = UpdateType<Omit<Escrow, 'id' | 'created_at'>>;
// --- Reviews ---
export interface Review {
  id: string;
  task_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  tags: string[] | null;
  is_anonymous: boolean;
  reply_id: string | null;
  is_hidden: boolean;
  created_at: string;
}
export interface ReviewInsert {
  id?: string | undefined;
  task_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  title?: string | null | undefined;
  comment?: string | null | undefined;
  tags?: string[] | null | undefined;
  is_anonymous?: boolean | null | undefined;
  reply_id?: string | null | undefined;
  is_hidden?: boolean | null | undefined;
  created_at?: string | null | undefined;
}
export type ReviewUpdate = UpdateType<Omit<Review, 'id' | 'created_at'>>;
// --- Disputes ---
export type DisputeReason = 'not_completed' | 'no_show' | 'poor_quality' | 'safety' | 'fraud' | 'unauthorized_recording' | 'other';
export type DisputeStatus = 'open' | 'admin_reviewed' | 'resolved';
export interface Dispute {
  id: string;
  escrow_id: string;
  raised_by: string;
  reason: DisputeReason;
  details: string;
  evidence: string[] | null;
  status: DisputeStatus;
  admin_decision: string | null;
  admin_decision_payload: Json | null;
  deadline_at: string | null;
  decided_at: string | null;
  created_at: string;
  resolved_at: string | null;
}
export interface DisputeInsert {
  id?: string | undefined;
  escrow_id: string;
  raised_by: string;
  reason: DisputeReason;
  details: string;
  evidence?: string[] | null | undefined;
  status?: DisputeStatus | null | undefined;
  admin_decision?: string | null | undefined;
  admin_decision_payload?: Json | null | undefined;
  deadline_at?: string | null | undefined;
  decided_at?: string | null | undefined;
  created_at?: string | null | undefined;
  resolved_at?: string | null | undefined;
}
export type DisputeUpdate = UpdateType<Omit<Dispute, 'id' | 'created_at'>>;
// --- Transactions ---
export type TransactionType = 'lock' | 'release' | 'refund' | 'admin_adjust';
export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  escrow_id: string | null;
  task_id: string | null;
  meta: Json | null;
  created_at: string;
}
export interface TransactionInsert {
  id?: string | undefined;
  user_id: string;
  type: TransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  escrow_id?: string | null | undefined;
  task_id?: string | null | undefined;
  meta?: Json | null | undefined;
  created_at?: string | null | undefined;
}
export type TransactionUpdate = UpdateType<Omit<Transaction, 'id' | 'created_at'>>;
// --- Notifications ---
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  payload: Json | null;
  is_read: boolean;
  created_at: string;
}
export interface NotificationInsert {
  id?: string | undefined;
  user_id: string;
  type: string;
  payload?: Json | null | undefined;
  is_read?: boolean | null | undefined;
  created_at?: string | null | undefined;
}
export type NotificationUpdate = UpdateType<Omit<Notification, 'id' | 'created_at'>>;
// --- Files ---
export interface FileRecord {
  id: string;
  owner_id: string;
  bucket: string;
  path: string;
  url: string;
  file_hash: string | null;
  size_bytes: number;
  mime_type: string;
  uploaded_at: string;
}
export interface FileRecordInsert {
  id?: string | undefined;
  owner_id: string;
  bucket: string;
  path: string;
  url: string;
  file_hash?: string | null | undefined;
  size_bytes: number;
  mime_type: string;
  uploaded_at?: string | null | undefined;
}
export type FileRecordUpdate = UpdateType<Omit<FileRecord, 'id' | 'created_at'>>;