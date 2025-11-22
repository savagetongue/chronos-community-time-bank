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
        Relationships: [];
      };
      tasks: {
        Row: Task;
        Insert: TaskInsert;
        Update: TaskUpdate;
        Relationships: [
          {
            foreignKeyName: "tasks_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      escrows: {
        Row: Escrow;
        Insert: EscrowInsert;
        Update: EscrowUpdate;
        Relationships: [
          {
            foreignKeyName: "escrows_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          }
        ];
      };
      reviews: {
        Row: Review;
        Insert: ReviewInsert;
        Update: ReviewUpdate;
        Relationships: [
          {
            foreignKeyName: "reviews_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          }
        ];
      };
      disputes: {
        Row: Dispute;
        Insert: DisputeInsert;
        Update: DisputeUpdate;
        Relationships: [
          {
            foreignKeyName: "disputes_escrow_id_fkey";
            columns: ["escrow_id"];
            isOneToOne: false;
            referencedRelation: "escrows";
            referencedColumns: ["id"];
          }
        ];
      };
      transactions: {
        Row: Transaction;
        Insert: TransactionInsert;
        Update: TransactionUpdate;
        Relationships: [];
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsert;
        Update: NotificationUpdate;
        Relationships: [];
      };
      files: {
        Row: FileRecord;
        Insert: FileRecordInsert;
        Update: FileRecordUpdate;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      task_type: 'offer' | 'request';
      task_mode: 'online' | 'in_person' | 'hybrid';
      task_status: 'open' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
      task_visibility: 'public' | 'private';
      escrow_status: 'locked' | 'released' | 'refunded' | 'disputed';
      dispute_reason: 'not_completed' | 'no_show' | 'poor_quality' | 'safety' | 'fraud' | 'unauthorized_recording' | 'other';
      dispute_status: 'open' | 'admin_reviewed' | 'resolved';
      transaction_type: 'lock' | 'release' | 'refund' | 'admin_adjust';
    };
    CompositeTypes: {
      [_ in never]: never;
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
};
export type ProfileUpdate = {
  display_name?: string | null | undefined;
  email?: string | undefined;
  bio?: string | null | undefined;
  skills?: string[] | null | undefined;
  credits?: number | null | undefined;
  locked_credits?: number | null | undefined;
  reputation_score?: number | null | undefined;
  completed_tasks_count?: number | null | undefined;
  is_approved?: boolean | null | undefined;
  is_suspended?: boolean | null | undefined;
  kyc_level?: number | null | undefined;
  updated_at?: string | null | undefined;
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
  id?: string | null | undefined;
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
};
export type TaskUpdate = {
  type?: TaskType | undefined;
  title?: string | undefined;
  description?: string | undefined;
  estimated_credits?: number | undefined;
  mode?: TaskMode | undefined;
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
  updated_at?: string | null | undefined;
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
  id?: string | null | undefined;
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
};
export type EscrowUpdate = {
  credits_locked?: number | undefined;
  credits_released?: number | null | undefined;
  status?: EscrowStatus | null | undefined;
  locked_at?: string | null | undefined;
  auto_release_at?: string | null | undefined;
  released_at?: string | null | undefined;
  dispute_id?: string | null | undefined;
  is_finalized?: boolean | null | undefined;
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
  id?: string | null | undefined;
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
};
export type ReviewUpdate = {
  rating?: number | undefined;
  title?: string | null | undefined;
  comment?: string | null | undefined;
  tags?: string[] | null | undefined;
  is_anonymous?: boolean | null | undefined;
  reply_id?: string | null | undefined;
  is_hidden?: boolean | null | undefined;
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
  id?: string | null | undefined;
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
};
export type DisputeUpdate = {
  reason?: DisputeReason | undefined;
  details?: string | undefined;
  evidence?: string[] | null | undefined;
  status?: DisputeStatus | null | undefined;
  admin_decision?: string | null | undefined;
  admin_decision_payload?: Json | null | undefined;
  deadline_at?: string | null | undefined;
  decided_at?: string | null | undefined;
  resolved_at?: string | null | undefined;
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
  id?: string | null | undefined;
  user_id: string;
  type: TransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  escrow_id?: string | null | undefined;
  task_id?: string | null | undefined;
  meta?: Json | null | undefined;
  created_at?: string | null | undefined;
};
export type TransactionUpdate = {
  type?: TransactionType | undefined;
  amount?: number | undefined;
  balance_before?: number | undefined;
  balance_after?: number | undefined;
  escrow_id?: string | null | undefined;
  task_id?: string | null | undefined;
  meta?: Json | null | undefined;
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
  id?: string | null | undefined;
  user_id: string;
  type: string;
  payload?: Json | null | undefined;
  is_read?: boolean | null | undefined;
  created_at?: string | null | undefined;
};
export type NotificationUpdate = {
  type?: string | undefined;
  payload?: Json | null | undefined;
  is_read?: boolean | null | undefined;
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
  id?: string | null | undefined;
  owner_id: string;
  bucket: string;
  path: string;
  url: string;
  file_hash?: string | null | undefined;
  size_bytes: number;
  mime_type: string;
  uploaded_at?: string | null | undefined;
};
export type FileRecordUpdate = {
  bucket?: string | undefined;
  path?: string | undefined;
  url?: string | undefined;
  file_hash?: string | null | undefined;
  size_bytes?: number | undefined;
  mime_type?: string | undefined;
};