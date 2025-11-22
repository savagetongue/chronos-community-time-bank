export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
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
export type ProfileInsert = {
  id: string;
  display_name?: string | null;
  email: string;
  bio?: string | null;
  skills?: string[] | null;
  credits?: number | null;
  locked_credits?: number | null;
  reputation_score?: number | null;
  completed_tasks_count?: number | null;
  is_approved?: boolean | null;
  is_suspended?: boolean | null;
  kyc_level?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};
export type ProfileUpdate = {
  display_name?: string | null;
  email?: string;
  bio?: string | null;
  skills?: string[] | null;
  credits?: number | null;
  locked_credits?: number | null;
  reputation_score?: number | null;
  completed_tasks_count?: number | null;
  is_approved?: boolean | null;
  is_suspended?: boolean | null;
  kyc_level?: number | null;
  updated_at?: string | null;
};
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
export type TaskInsert = {
  id?: string;
  creator_id: string;
  type: TaskType;
  title: string;
  description: string;
  estimated_credits: number;
  mode: TaskMode;
  status?: TaskStatus | null;
  visibility?: TaskVisibility | null;
  max_participants?: number | null;
  travel_allowance?: number | null;
  cancellation_policy?: string | null;
  location_city?: string | null;
  location_state?: string | null;
  location_country?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  online_platform?: string | null;
  online_link?: string | null;
  proposed_times?: Json | null;
  confirmed_time?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};
export type TaskUpdate = {
  type?: TaskType;
  title?: string;
  description?: string;
  estimated_credits?: number;
  mode?: TaskMode;
  status?: TaskStatus | null;
  visibility?: TaskVisibility | null;
  max_participants?: number | null;
  travel_allowance?: number | null;
  cancellation_policy?: string | null;
  location_city?: string | null;
  location_state?: string | null;
  location_country?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  online_platform?: string | null;
  online_link?: string | null;
  proposed_times?: Json | null;
  confirmed_time?: string | null;
  updated_at?: string | null;
};
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
export type EscrowInsert = {
  id?: string;
  task_id: string;
  requester_id: string;
  provider_id: string;
  credits_locked: number;
  credits_released?: number | null;
  status?: EscrowStatus | null;
  locked_at?: string | null;
  auto_release_at?: string | null;
  released_at?: string | null;
  dispute_id?: string | null;
  is_finalized?: boolean | null;
  created_at?: string | null;
};
export type EscrowUpdate = {
  credits_locked?: number;
  credits_released?: number | null;
  status?: EscrowStatus | null;
  locked_at?: string | null;
  auto_release_at?: string | null;
  released_at?: string | null;
  dispute_id?: string | null;
  is_finalized?: boolean | null;
};
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
export type ReviewInsert = {
  id?: string;
  task_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  tags?: string[] | null;
  is_anonymous?: boolean | null;
  reply_id?: string | null;
  is_hidden?: boolean | null;
  created_at?: string | null;
};
export type ReviewUpdate = {
  rating?: number;
  title?: string | null;
  comment?: string | null;
  tags?: string[] | null;
  is_anonymous?: boolean | null;
  reply_id?: string | null;
  is_hidden?: boolean | null;
};
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
export type DisputeInsert = {
  id?: string;
  escrow_id: string;
  raised_by: string;
  reason: DisputeReason;
  details: string;
  evidence?: string[] | null;
  status?: DisputeStatus | null;
  admin_decision?: string | null;
  admin_decision_payload?: Json | null;
  deadline_at?: string | null;
  decided_at?: string | null;
  created_at?: string | null;
  resolved_at?: string | null;
};
export type DisputeUpdate = {
  reason?: DisputeReason;
  details?: string;
  evidence?: string[] | null;
  status?: DisputeStatus | null;
  admin_decision?: string | null;
  admin_decision_payload?: Json | null;
  deadline_at?: string | null;
  decided_at?: string | null;
  resolved_at?: string | null;
};
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
export type TransactionInsert = {
  id?: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  escrow_id?: string | null;
  task_id?: string | null;
  meta?: Json | null;
  created_at?: string | null;
};
export type TransactionUpdate = {
  type?: TransactionType;
  amount?: number;
  balance_before?: number;
  balance_after?: number;
  escrow_id?: string | null;
  task_id?: string | null;
  meta?: Json | null;
};
// --- Notifications ---
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  payload: Json | null;
  is_read: boolean;
  created_at: string;
}
export type NotificationInsert = {
  id?: string;
  user_id: string;
  type: string;
  payload?: Json | null;
  is_read?: boolean | null;
  created_at?: string | null;
};
export type NotificationUpdate = {
  type?: string;
  payload?: Json | null;
  is_read?: boolean | null;
};
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
export type FileRecordInsert = {
  id?: string;
  owner_id: string;
  bucket: string;
  path: string;
  url: string;
  file_hash?: string | null;
  size_bytes: number;
  mime_type: string;
  uploaded_at?: string | null;
};
export type FileRecordUpdate = {
  bucket?: string;
  path?: string;
  url?: string;
  file_hash?: string | null;
  size_bytes?: number;
  mime_type?: string;
};