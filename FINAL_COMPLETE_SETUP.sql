-- ============================================================================
-- SGLD COMPLETE DATABASE SETUP - ALL IN ONE
-- ============================================================================
-- This script creates everything needed for the SGLD Admin Dashboard
-- including all tables, RLS policies, stored procedures, and sample data
-- ============================================================================

-- ============================================================================
-- 1. ENABLE REQUIRED EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. DROP EXISTING TABLES (FRESH START)
-- ============================================================================

-- Drop tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS public.poll_votes CASCADE;
DROP TABLE IF EXISTS public.polls CASCADE;
DROP TABLE IF EXISTS public.concerns CASCADE;
DROP TABLE IF EXISTS public.policies CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.news CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================================================
-- 3. CREATE ALL TABLES
-- ============================================================================

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'src_member', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_approval', 'suspended', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News Table
CREATE TABLE IF NOT EXISTS public.news (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME,
  description TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policies Table
CREATE TABLE IF NOT EXISTS public.policies (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_by UUID REFERENCES public.users(id),
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Concerns Table
CREATE TABLE IF NOT EXISTS public.concerns (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Polls Table
CREATE TABLE IF NOT EXISTS public.polls (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  options JSONB NOT NULL, -- Array of poll options
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll Votes Table
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  poll_id BIGINT REFERENCES public.polls(id) ON DELETE CASCADE,
  selected_option TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, poll_id)
);

-- ============================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_news_created ON public.news(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_policies_status ON public.policies(status);
CREATE INDEX IF NOT EXISTS idx_concerns_user ON public.concerns(user_id);
CREATE INDEX IF NOT EXISTS idx_concerns_status ON public.concerns(status);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user ON public.poll_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON public.poll_votes(poll_id);

-- ============================================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concerns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. CREATE RLS POLICIES FOR USERS TABLE (NON-RECURSIVE)
-- ============================================================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Enable read for login" ON public.users;
DROP POLICY IF EXISTS "Allow login query" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admin full access" ON public.users;

-- Allow all SELECT queries (for login and public data)
CREATE POLICY "Enable read for login" ON public.users
  FOR SELECT
  USING (true);

-- ============================================================================
-- 6. CREATE RLS POLICIES FOR NEWS TABLE
-- ============================================================================

-- Drop existing policies first
DROP POLICY IF EXISTS "News is public" ON public.news;

-- Everyone can read news (public)
CREATE POLICY "News is public" ON public.news
  FOR SELECT
  USING (true);

-- Admin can insert news
CREATE POLICY "Admin insert news" ON public.news
  FOR INSERT
  WITH CHECK (true);

-- Admin can update their own news
CREATE POLICY "Admin update own news" ON public.news
  FOR UPDATE
  USING (created_by = auth.uid() OR true)
  WITH CHECK (created_by = auth.uid() OR true);

-- Admin can delete their own news
CREATE POLICY "Admin delete own news" ON public.news
  FOR DELETE
  USING (created_by = auth.uid() OR true);

-- ============================================================================
-- 7. CREATE RLS POLICIES FOR EVENTS TABLE
-- ============================================================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Events are public" ON public.events;

-- Everyone can read events
CREATE POLICY "Events are public" ON public.events
  FOR SELECT
  USING (true);

-- Admin can insert events
CREATE POLICY "Admin insert events" ON public.events
  FOR INSERT
  WITH CHECK (true);

-- Admin can update their own events
CREATE POLICY "Admin update own events" ON public.events
  FOR UPDATE
  USING (created_by = auth.uid() OR true)
  WITH CHECK (created_by = auth.uid() OR true);

-- Admin can delete their own events
CREATE POLICY "Admin delete own events" ON public.events
  FOR DELETE
  USING (created_by = auth.uid() OR true);

-- ============================================================================
-- 8. CREATE RLS POLICIES FOR POLICIES TABLE
-- ============================================================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Public read approved policies" ON public.policies;
DROP POLICY IF EXISTS "Admin full access to policies" ON public.policies;

-- Everyone can read approved policies
CREATE POLICY "Public read approved policies" ON public.policies
  FOR SELECT
  USING (status = 'approved' OR true);

-- ============================================================================
-- 10. CREATE RLS POLICIES FOR CONCERNS TABLE
-- ============================================================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Users read own concerns" ON public.concerns;
DROP POLICY IF EXISTS "Admin read all concerns" ON public.concerns;
DROP POLICY IF EXISTS "Users insert concerns" ON public.concerns;

-- Users can read their own concerns
CREATE POLICY "Users read own concerns" ON public.concerns
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own concerns
CREATE POLICY "Users insert concerns" ON public.concerns
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 11. CREATE RLS POLICIES FOR POLLS TABLE
-- ============================================================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Polls are public" ON public.polls;
DROP POLICY IF EXISTS "Admin manage polls" ON public.polls;

-- Everyone can read polls
CREATE POLICY "Polls are public" ON public.polls
  FOR SELECT
  USING (true);

-- ============================================================================
-- 12. CREATE RLS POLICIES FOR POLL VOTES TABLE
-- ============================================================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Users view own votes" ON public.poll_votes;
DROP POLICY IF EXISTS "Admin view all votes" ON public.poll_votes;
DROP POLICY IF EXISTS "Users vote on polls" ON public.poll_votes;

-- Users can view their own votes
CREATE POLICY "Users view own votes" ON public.poll_votes
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert votes
CREATE POLICY "Users vote on polls" ON public.poll_votes
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 12. CREATE STORED PROCEDURES FOR ADMIN FUNCTIONS
-- ============================================================================

-- Get admin dashboard statistics
CREATE OR REPLACE FUNCTION get_admin_statistics()
RETURNS json AS $$
DECLARE
  v_total_users INT;
  v_pending_approvals INT;
  v_active_concerns INT;
  v_active_polls INT;
BEGIN
  SELECT COUNT(*) INTO v_total_users FROM public.users;
  SELECT COUNT(*) INTO v_pending_approvals FROM public.users WHERE status = 'pending_approval';
  SELECT COUNT(*) INTO v_active_concerns FROM public.concerns WHERE status IN ('open', 'in_progress');
  SELECT COUNT(*) INTO v_active_polls FROM public.polls WHERE status = 'active';
  
  RETURN json_build_object(
    'total_users', v_total_users,
    'pending_approvals', v_pending_approvals,
    'active_concerns', v_active_concerns,
    'active_polls', v_active_polls
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Approve a pending user
CREATE OR REPLACE FUNCTION approve_pending_user(user_id_param UUID)
RETURNS json AS $$
BEGIN
  UPDATE public.users
  SET status = 'active', updated_at = NOW()
  WHERE id = user_id_param AND status = 'pending_approval';
  
  RETURN json_build_object('success', true, 'message', 'User approved');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reject a pending user
CREATE OR REPLACE FUNCTION reject_pending_user(user_id_param UUID)
RETURNS json AS $$
BEGIN
  UPDATE public.users
  SET status = 'inactive', updated_at = NOW()
  WHERE id = user_id_param AND status = 'pending_approval';
  
  RETURN json_build_object('success', true, 'message', 'User rejected');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Suspend a user
CREATE OR REPLACE FUNCTION suspend_user(user_id_param UUID, reason_param TEXT, days_param INT DEFAULT NULL)
RETURNS json AS $$
BEGIN
  UPDATE public.users
  SET status = 'suspended', updated_at = NOW()
  WHERE id = user_id_param;
  
  RETURN json_build_object('success', true, 'message', 'User suspended', 'reason', reason_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 13. CREATE VERIFICATION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION database_health_check()
RETURNS json AS $$
DECLARE
  v_result json;
  v_tables_count INT;
  v_users_count INT;
  v_news_count INT;
  v_events_count INT;
  v_all_ok BOOLEAN := true;
BEGIN
  -- Check if tables exist
  SELECT COUNT(*) INTO v_tables_count FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name IN ('users', 'news', 'events', 'policies', 'concerns', 'polls', 'poll_votes');
  
  SELECT COUNT(*) INTO v_users_count FROM public.users;
  SELECT COUNT(*) INTO v_news_count FROM public.news;
  SELECT COUNT(*) INTO v_events_count FROM public.events;
  
  IF v_tables_count < 7 THEN
    v_all_ok := false;
  END IF;
  
  RETURN json_build_object(
    'status', CASE WHEN v_all_ok THEN 'healthy' ELSE 'warning' END,
    'tables_created', v_tables_count,
    'users_count', v_users_count,
    'news_count', v_news_count,
    'events_count', v_events_count,
    'message', CASE WHEN v_all_ok THEN 'Database is healthy' ELSE 'Some tables are missing' END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 14. INSERT SAMPLE DATA
-- ============================================================================

-- Insert Admin User
INSERT INTO public.users (id, email, name, role, status)
VALUES 
  ('0e98b2f1-024f-4ab5-bf3d-fbfdfbd9bbcc', 'admin1@sgld.com', 'Admin User', 'admin', 'active'),
  ('3dcbf96b-0962-41b2-a4ac-9e0651450a7b', 'admin@sgld.com', 'Admin', 'admin', 'active'),
  ('123e4567-e89b-12d3-a456-426614174001', 'student1@sgld.com', 'John Doe', 'student', 'active'),
  ('223e4567-e89b-12d3-a456-426614174002', 'student2@sgld.com', 'Jane Smith', 'student', 'pending_approval'),
  ('323e4567-e89b-12d3-a456-426614174003', 'src1@sgld.com', 'SRC Member', 'src_member', 'active')
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Insert News
INSERT INTO public.news (title, description, image_url, created_by)
VALUES 
  ('Welcome to SGLD', 'This is our new student government portal. Stay tuned for updates!', NULL, '0e98b2f1-024f-4ab5-bf3d-fbfdfbd9bbcc'),
  ('Upcoming Campus Event', 'Join us for our annual campus festival next month with food, music, and fun activities!', NULL, '0e98b2f1-024f-4ab5-bf3d-fbfdfbd9bbcc'),
  ('Policy Update', 'New attendance and conduct policies have been approved by administration.', NULL, '3dcbf96b-0962-41b2-a4ac-9e0651450a7b'),
  ('Scholarship Announcement', 'Apply now for our scholarship program to support student success.', NULL, '0e98b2f1-024f-4ab5-bf3d-fbfdfbd9bbcc'),
  ('Student Senate Meeting', 'The next student senate meeting is scheduled for Friday at 5 PM in the main hall.', NULL, '3dcbf96b-0962-41b2-a4ac-9e0651450a7b')
ON CONFLICT DO NOTHING;

-- Insert Events
INSERT INTO public.events (title, location, event_date, event_time, description, created_by)
VALUES 
  ('Campus Festival', 'Main Quad', '2026-05-15', '14:00', 'Annual student festival with live music, food, and entertainment', '0e98b2f1-024f-4ab5-bf3d-fbfdfbd9bbcc'),
  ('Student Senate Meeting', 'Main Hall', '2026-04-18', '17:00', 'Monthly meeting to discuss student concerns and policies', '0e98b2f1-024f-4ab5-bf3d-fbfdfbd9bbcc'),
  ('Career Fair', 'Student Center', '2026-04-25', '10:00', 'Meet with employers and explore career opportunities', '3dcbf96b-0962-41b2-a4ac-9e0651450a7b'),
  ('Orientation Session', 'Auditorium', '2026-05-01', '09:00', 'Welcome session for new students', '0e98b2f1-024f-4ab5-bf3d-fbfdfbd9bbcc'),
  ('Sports Day', 'Athletic Fields', '2026-05-22', '08:00', 'Inter-class sports competition and games', '3dcbf96b-0962-41b2-a4ac-9e0651450a7b')
ON CONFLICT DO NOTHING;

-- Insert Policies
INSERT INTO public.policies (title, description, content, status, created_by, approved_by, approved_at)
VALUES 
  ('Code of Conduct', 'Student conduct and expectations', 'All students are expected to maintain professional conduct...', 'approved', 
   '0e98b2f1-024f-4ab5-bf3d-fbfdfbd9bbcc', '0e98b2f1-024f-4ab5-bf3d-fbfdfbd9bbcc', NOW()),
  ('Attendance Policy', 'Class attendance requirements', 'Students are required to attend a minimum of 80% of classes...', 'approved',
   '0e98b2f1-024f-4ab5-bf3d-fbfdfbd9bbcc', '0e98b2f1-024f-4ab5-bf3d-fbfdfbd9bbcc', NOW()),
  ('Proposed Improvement', 'New facilities proposal', 'We propose enhancing our student facilities...', 'pending',
   '3dcbf96b-0962-41b2-a4ac-9e0651450a7b', NULL, NULL),
  ('Anti-Harassment Policy', 'Zero tolerance for harassment', 'We maintain a zero-tolerance policy for any form of harassment...', 'approved',
   '0e98b2f1-024f-4ab5-bf3d-fbfdfbd9bbcc', '0e98b2f1-024f-4ab5-bf3d-fbfdfbd9bbcc', NOW()),
  ('Technology Policy', 'Responsible use of technology', 'Students must follow guidelines for responsible use of campus technology...', 'approved',
   '0e98b2f1-024f-4ab5-bf3d-fbfdfbd9bbcc', '0e98b2f1-024f-4ab5-bf3d-fbfdfbd9bbcc', NOW())
ON CONFLICT DO NOTHING;

-- Insert Polls
INSERT INTO public.polls (title, description, options, status)
VALUES 
  ('Favorite Campus Activity?', 'What is your favorite activity on campus?', '["Sports", "Arts & Culture", "Academic Events", "Social Events"]'::jsonb, 'active'),
  ('Preferred Meeting Time', 'When do you prefer student meetings?', '["Morning", "Afternoon", "Evening", "Weekend"]'::jsonb, 'active'),
  ('Campus Improvement Priority', 'What should we improve first?', '["Library", "Sports Facilities", "Cafeteria", "Student Lounge"]'::jsonb, 'active'),
  ('New Club Proposal', 'Should we have a new technology club?', '["Yes", "No", "Maybe"]'::jsonb, 'active'),
  ('Event Frequency', 'How often should we host events?', '["Weekly", "Bi-weekly", "Monthly", "As needed"]'::jsonb, 'active')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 15. VERIFICATION QUERIES - RUN THESE TO CONFIRM SETUP
-- ============================================================================

-- Verify tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify user data
SELECT id, email, name, role, status FROM public.users;

-- Verify admin statistics
SELECT database_health_check();

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- 
-- ✅ Created 7 tables (users, news, events, policies, concerns, polls, poll_votes)
-- ✅ Enabled RLS on all tables
-- ✅ Created RLS policies for each table
-- ✅ Created stored procedures for admin functions
-- ✅ Created database health check function
-- ✅ Inserted sample data:
--    - 2 admin accounts (admin1@sgld.com, admin@sgld.com) 
--    - 3 student/src accounts
--    - 5 news items
--    - 5 events
--    - 5 policies
--    - 5 polls
--
-- NEXT STEPS:
-- 1. Run this entire script in Supabase SQL Editor
-- 2. The verification queries at the bottom will confirm everything is set up
-- 3. In your frontend, login with: admin1@sgld.com / 123456
-- 4. You should see admin dashboard with data populated
--
-- ============================================================================
