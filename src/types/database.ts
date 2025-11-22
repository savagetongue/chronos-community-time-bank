export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & { id: string };
        Update: Partial<Profile>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Task>;
      };
      escrows: {
        Row: Escrow;
        Insert: Omit<Escrow, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Escrow>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Review>;
      };
      disputes: {
        Row: Dispute;
        Insert: Omit<Dispute, 'id' | 'created_at' | 'resolved_at'> & { id?: string };
        Update: Partial<Dispute>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Transaction>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Notification>;
      };
      files: {
        Row: FileRecord;
        Insert: Omit<FileRecord, 'id' | 'uploaded_at'> & { id?: string };
        Update: Partial<FileRecord>;
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
  is_admin?: boolean;
  kyc_level: number;
  created_at: string;
  updated_at: string;
}
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
  proposed_times: string[] | null;
  confirmed_time: string | null;
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
  reply_id: string | null;
  is_hidden?: boolean;
  created_at: string;
}
export type DisputeReason = 'not_completed' | 'no_show' | 'poor_quality' | 'safety' | 'fraud' | 'unauthorized_recording' | 'other';
export type DisputeStatus = 'open' | 'admin_reviewed' | 'resolved';
export interface Dispute {
  id: string;
  escrow_id: string;
  raised_by: string;
  reason: DisputeReason;
  details: string;
  evidence: string[];
  status: DisputeStatus;
  admin_decision: string | null;
  admin_decision_payload: any | null;
  created_at: string;
  resolved_at: string | null;
}
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
  meta: any | null;
  created_at: string;
}
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  payload: any;
  is_read: boolean;
  created_at: string;
}
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