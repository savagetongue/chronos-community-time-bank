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
// Explicit loose typing to satisfy Supabase's strict inference
export type ProfileInsert = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>> & {
  id: string;
  email: string;
  [key: string]: any; // Allow flexibility for optional fields
};
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>> & {
  [key: string]: any;
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
export type TaskInsert = Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>> & {
  creator_id: string;
  type: TaskType;
  title: string;
  description: string;
  estimated_credits: number;
  mode: TaskMode;
  [key: string]: any;
};
export type TaskUpdate = Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>> & {
  [key: string]: any;
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
export type EscrowInsert = Partial<Omit<Escrow, 'id' | 'created_at'>> & {
  task_id: string;
  requester_id: string;
  provider_id: string;
  credits_locked: number;
  [key: string]: any;
};
export type EscrowUpdate = Partial<Omit<Escrow, 'id' | 'created_at'>> & {
  [key: string]: any;
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
export type ReviewInsert = Partial<Omit<Review, 'id' | 'created_at'>> & {
  task_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  [key: string]: any;
};
export type ReviewUpdate = Partial<Omit<Review, 'id' | 'created_at'>> & {
  [key: string]: any;
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
export type DisputeInsert = Partial<Omit<Dispute, 'id' | 'created_at'>> & {
  escrow_id: string;
  raised_by: string;
  reason: DisputeReason;
  details: string;
  [key: string]: any;
};
export type DisputeUpdate = Partial<Omit<Dispute, 'id' | 'created_at'>> & {
  [key: string]: any;
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
export type TransactionInsert = Partial<Omit<Transaction, 'id' | 'created_at'>> & {
  user_id: string;
  type: TransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  [key: string]: any;
};
export type TransactionUpdate = Partial<Omit<Transaction, 'id' | 'created_at'>> & {
  [key: string]: any;
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
export type NotificationInsert = Partial<Omit<Notification, 'id' | 'created_at'>> & {
  user_id: string;
  type: string;
  [key: string]: any;
};
export type NotificationUpdate = Partial<Omit<Notification, 'id' | 'created_at'>> & {
  [key: string]: any;
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
export type FileRecordInsert = Partial<Omit<FileRecord, 'id' | 'uploaded_at'>> & {
  owner_id: string;
  bucket: string;
  path: string;
  url: string;
  size_bytes: number;
  mime_type: string;
  [key: string]: any;
};
export type FileRecordUpdate = Partial<Omit<FileRecord, 'id' | 'uploaded_at'>> & {
  [key: string]: any;
};