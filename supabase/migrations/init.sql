-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Create Enums
CREATE TYPE task_type AS ENUM ('offer', 'request');
CREATE TYPE task_mode AS ENUM ('online', 'in_person', 'hybrid');
CREATE TYPE task_status AS ENUM ('open', 'accepted', 'in_progress', 'completed', 'cancelled');
CREATE TYPE task_visibility AS ENUM ('public', 'private');
CREATE TYPE escrow_status AS ENUM ('locked', 'released', 'refunded', 'disputed');
CREATE TYPE dispute_reason AS ENUM ('not_completed', 'no_show', 'poor_quality', 'safety', 'fraud', 'unauthorized_recording', 'other');
CREATE TYPE dispute_status AS ENUM ('open', 'admin_reviewed', 'resolved');
CREATE TYPE transaction_type AS ENUM ('lock', 'release', 'refund', 'admin_adjust');
-- PROFILES TABLE
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT,
    email TEXT NOT NULL,
    bio TEXT,
    skills TEXT[] DEFAULT '{}',
    credits NUMERIC DEFAULT 0,
    locked_credits NUMERIC DEFAULT 0,
    reputation_score NUMERIC DEFAULT 0,
    completed_tasks_count INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT FALSE,
    is_suspended BOOLEAN DEFAULT FALSE,
    kyc_level INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- TASKS TABLE
CREATE TABLE public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES public.profiles(id) NOT NULL,
    type task_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    estimated_credits NUMERIC NOT NULL,
    mode task_mode NOT NULL,
    status task_status DEFAULT 'open',
    visibility task_visibility DEFAULT 'public',
    max_participants INTEGER DEFAULT 1,
    travel_allowance NUMERIC DEFAULT 0,
    cancellation_policy TEXT DEFAULT 'flexible',
    location_city TEXT,
    location_state TEXT,
    location_country TEXT,
    location_lat NUMERIC,
    location_lng NUMERIC,
    online_platform TEXT,
    online_link TEXT,
    proposed_times TEXT[] DEFAULT '{}', -- Storing as ISO strings
    confirmed_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- ESCROWS TABLE
CREATE TABLE public.escrows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) NOT NULL,
    requester_id UUID REFERENCES public.profiles(id) NOT NULL,
    provider_id UUID REFERENCES public.profiles(id) NOT NULL,
    credits_locked NUMERIC NOT NULL,
    credits_released NUMERIC DEFAULT 0,
    status escrow_status DEFAULT 'locked',
    locked_at TIMESTAMPTZ DEFAULT NOW(),
    auto_release_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    dispute_id UUID, -- Circular reference handled by update later if needed, or just UUID
    is_finalized BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- TRANSACTIONS TABLE
CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    type transaction_type NOT NULL,
    amount NUMERIC NOT NULL,
    balance_before NUMERIC NOT NULL,
    balance_after NUMERIC NOT NULL,
    escrow_id UUID REFERENCES public.escrows(id),
    task_id UUID REFERENCES public.tasks(id),
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- DISPUTES TABLE
CREATE TABLE public.disputes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    escrow_id UUID REFERENCES public.escrows(id) NOT NULL,
    raised_by UUID REFERENCES public.profiles(id) NOT NULL,
    reason dispute_reason NOT NULL,
    details TEXT NOT NULL,
    evidence TEXT[] DEFAULT '{}',
    status dispute_status DEFAULT 'open',
    admin_decision TEXT,
    admin_decision_payload JSONB,
    deadline_at TIMESTAMPTZ,
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);
-- REVIEWS TABLE
CREATE TABLE public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) NOT NULL,
    reviewer_id UUID REFERENCES public.profiles(id) NOT NULL,
    reviewee_id UUID REFERENCES public.profiles(id) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    tags TEXT[] DEFAULT '{}',
    is_anonymous BOOLEAN DEFAULT FALSE,
    reply_id UUID REFERENCES public.reviews(id),
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- NOTIFICATIONS TABLE
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    type TEXT NOT NULL,
    payload JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- FILES TABLE (Metadata for Storage)
CREATE TABLE public.files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) NOT NULL,
    bucket TEXT NOT NULL,
    path TEXT NOT NULL,
    url TEXT NOT NULL,
    file_hash TEXT,
    size_bytes BIGINT,
    mime_type TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
-- ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
-- RLS POLICIES
-- Profiles: Public read, Owner update
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
-- Tasks: Public read, Creator update
CREATE POLICY "Tasks are viewable by everyone" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert tasks" ON public.tasks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Creators can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = creator_id);
-- Escrows: Involved parties read
CREATE POLICY "Involved parties can view escrows" ON public.escrows FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = provider_id);
-- Insert handled by Edge Functions usually, but allowing auth for demo
CREATE POLICY "Authenticated users can insert escrows" ON public.escrows FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Involved parties can update escrows" ON public.escrows FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = provider_id);
-- Disputes: Involved parties read
CREATE POLICY "Involved parties can view disputes" ON public.disputes FOR SELECT USING (auth.uid() = raised_by OR EXISTS (SELECT 1 FROM public.escrows WHERE id = escrow_id AND (requester_id = auth.uid() OR provider_id = auth.uid())));
CREATE POLICY "Authenticated users can insert disputes" ON public.disputes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- Admin updates handled via service role client in hooks, no specific RLS needed for admin user if bypassing RLS
-- Reviews: Public read
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- Notifications: Owner read/update
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
-- Files: Owner read/insert
CREATE POLICY "Files are viewable by everyone" ON public.files FOR SELECT USING (true);
CREATE POLICY "Users can insert own files" ON public.files FOR INSERT WITH CHECK (auth.uid() = owner_id);
-- TRIGGERS
-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $
BEGIN
  INSERT INTO public.profiles (id, email, display_name, is_approved, credits, locked_credits, reputation_score, completed_tasks_count, kyc_level)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'display_name', false, 0, 0, 0, 0, 0);
  RETURN new;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
-- STORAGE BUCKET SETUP (If not exists)
INSERT INTO storage.buckets (id, name, public) VALUES ('evidence', 'evidence', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'evidence');
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'evidence' AND auth.role() = 'authenticated');