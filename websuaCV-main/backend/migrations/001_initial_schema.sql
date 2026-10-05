-- Supabase MVP Database Schema - Phase 1B
-- Profiles and CVs tables with RLS and updated_at trigger

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================================================
-- JOBS TABLE
-- ==================================================

CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source TEXT NOT NULL,
    source_job_id TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    job_type TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
    preferred_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    posted_at TIMESTAMPTZ NULL,
    remote BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (source, source_job_id)
);

CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON jobs(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_source_job_id ON jobs(source, source_job_id);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read jobs" ON jobs;
CREATE POLICY "Anyone can read jobs" ON jobs FOR SELECT USING (true);

-- ==================================================
-- PROFILES TABLE
-- ==================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
    current_location TEXT NULL,
    desired_locations JSONB NULL,
    desired_field TEXT NULL,
    experience_level TEXT NULL,
    salary_expectation TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==================================================
-- CVS TABLE
-- ==================================================

CREATE TABLE cvs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    file_url TEXT NULL,
    file_name TEXT NULL,
    file_type TEXT NULL,
    file_size BIGINT NULL,
    extracted_text TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==================================================
-- INDEXES (for better query performance)
-- ==================================================

-- Index on profiles.user_id for faster lookups
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- Index on cvs.user_id for faster lookups
CREATE INDEX idx_cvs_user_id ON cvs(user_id);

-- ==================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ==================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==================================================
-- APPLY UPDATED_AT TRIGGERS
-- ==================================================

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cvs_updated_at
    BEFORE UPDATE ON cvs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- ROW LEVEL SECURITY (RLS)
-- ==================================================

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on cvs table
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;

-- ==================================================
-- RLS POLICIES FOR PROFILES
-- ==================================================

-- Policy: Users can only select their own profile
CREATE POLICY "Users can select own profile" ON profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can only insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own profile
CREATE POLICY "Users can delete own profile" ON profiles
    FOR DELETE
    USING (auth.uid() = user_id);

-- ==================================================
-- RLS POLICIES FOR CVS
-- ==================================================

-- Policy: Users can only select their own CVs
CREATE POLICY "Users can select own CVs" ON cvs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can only insert their own CVs
CREATE POLICY "Users can insert own CVs" ON cvs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own CVs
CREATE POLICY "Users can update own CVs" ON cvs
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own CVs
CREATE POLICY "Users can delete own CVs" ON cvs
    FOR DELETE
    USING (auth.uid() = user_id);
