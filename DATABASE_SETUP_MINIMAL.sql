-- ============================================================================
-- MINIMAL DATABASE SETUP - LOGIN ONLY
-- ============================================================================
-- Creates only the users table with RLS policies for admin login
-- ============================================================================

-- ============================================================================
-- STEP 1: Create USERS Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin', 'src_member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- STEP 2: Enable Row Level Security
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: Create RLS Policies for Login
-- ============================================================================

-- Allow unauthenticated users to read users table (for login lookup)
CREATE POLICY "Allow unauthenticated login lookups" 
  ON public.users 
  FOR SELECT 
  USING (true);

-- Allow users to read their own profile
CREATE POLICY "Users can read their own data" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow admin to read all users
CREATE POLICY "Admin can read all users" 
  ON public.users 
  FOR SELECT 
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- ============================================================================
-- STEP 4: Create Index for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- ============================================================================
-- DATABASE READY
-- ============================================================================
-- Minimal database setup complete. Ready to add admin user.
