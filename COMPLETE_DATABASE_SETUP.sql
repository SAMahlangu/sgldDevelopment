-- ============================================================================
-- SGLD COMPLETE DATABASE SETUP SCRIPT
-- ============================================================================
-- This script creates all tables, policies, and sample data for SGLD
-- Paste this entire script into Supabase SQL Editor and run it
-- ============================================================================

-- ============================================================================
-- 1. CREATE USERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin', 'src')),
  status TEXT NOT NULL CHECK (status IN ('active', 'pending_approval', 'suspended')) DEFAULT 'pending_approval',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. CREATE NEWS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. CREATE EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  organizer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. CREATE POLICIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected')) DEFAULT 'draft',
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. CREATE POLLS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 6. CREATE POLL VOTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

-- ============================================================================
-- 7. CREATE CONCERNS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.concerns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  submitted_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved')) DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 8. CREATE ADMIN LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 9. CREATE SYSTEM REPORTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.system_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 10. CREATE USER SUSPENSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_suspensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  suspended_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 11. CREATE AUDIT TRAIL TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 12. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concerns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_suspensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 13. ROW LEVEL SECURITY POLICIES - USERS TABLE
-- ============================================================================

-- Allow users to read their own profile
CREATE POLICY "Users can read their own profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- All authenticated users can see other users
CREATE POLICY "All authenticated users can see other users"
ON public.users
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow unauthenticated login lookups (critical for login form)
CREATE POLICY "Allow unauthenticated login lookups"
ON public.users
FOR SELECT
USING (true);

-- ============================================================================
-- 14. ROW LEVEL SECURITY POLICIES - NEWS TABLE
-- ============================================================================

-- Everyone can read news
CREATE POLICY "Everyone can read news"
ON public.news
FOR SELECT
USING (true);

-- Only admins can create news
CREATE POLICY "Only admins can create news"
ON public.news
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin' AND status = 'active'
  )
);

-- Only admins can update news
CREATE POLICY "Only admins can update news"
ON public.news
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin' AND status = 'active'
  )
);

-- Only admins can delete news
CREATE POLICY "Only admins can delete news"
ON public.news
FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin' AND status = 'active'
  )
);

-- ============================================================================
-- 15. ROW LEVEL SECURITY POLICIES - EVENTS TABLE
-- ============================================================================

-- Everyone can read events
CREATE POLICY "Everyone can read events"
ON public.events
FOR SELECT
USING (true);

-- Only admins can create events
CREATE POLICY "Only admins can create events"
ON public.events
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin' AND status = 'active'
  )
);

-- Only admins can update events
CREATE POLICY "Only admins can update events"
ON public.events
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin' AND status = 'active'
  )
);

-- Only admins can delete events
CREATE POLICY "Only admins can delete events"
ON public.events
FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin' AND status = 'active'
  )
);

-- ============================================================================
-- 16. ROW LEVEL SECURITY POLICIES - POLICIES TABLE
-- ============================================================================

-- Everyone can read approved policies
CREATE POLICY "Everyone can read approved policies"
ON public.policies
FOR SELECT
USING (status = 'approved' OR auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- Active users can create policies
CREATE POLICY "Active users can create policies"
ON public.policies
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.users WHERE status = 'active'
  )
);

-- Only admins can approve/reject policies
CREATE POLICY "Only admins can update policies"
ON public.policies
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin' AND status = 'active'
  )
);

-- ============================================================================
-- 17. ROW LEVEL SECURITY POLICIES - POLLS TABLE
-- ============================================================================

-- Everyone can read polls
CREATE POLICY "Everyone can read polls"
ON public.polls
FOR SELECT
USING (true);

-- Authenticated users can create polls
CREATE POLICY "Authenticated users can create polls"
ON public.polls
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- 18. ROW LEVEL SECURITY POLICIES - POLL VOTES TABLE
-- ============================================================================

-- Users can read poll votes
CREATE POLICY "Users can read poll votes"
ON public.poll_votes
FOR SELECT
USING (true);

-- Authenticated users can vote
CREATE POLICY "Authenticated users can vote"
ON public.poll_votes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 19. ROW LEVEL SECURITY POLICIES - CONCERNS TABLE
-- ============================================================================

-- Users can read their own concerns
CREATE POLICY "Users can read their own concerns"
ON public.concerns
FOR SELECT
USING (auth.uid() = submitted_by OR auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- Active users can create concerns
CREATE POLICY "Active users can create concerns"
ON public.concerns
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.users WHERE status = 'active'
  )
);

-- Only admins can update concerns
CREATE POLICY "Only admins can update concerns"
ON public.concerns
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin' AND status = 'active'
  )
);

-- ============================================================================
-- 20. ROW LEVEL SECURITY POLICIES - ADMIN LOGS TABLE
-- ============================================================================

-- Only admins can read admin logs
CREATE POLICY "Only admins can read admin logs"
ON public.admin_logs
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin' AND status = 'active'
  )
);

-- Only admins can insert admin logs
CREATE POLICY "System can insert admin logs"
ON public.admin_logs
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin' AND status = 'active'
  )
);

-- ============================================================================
-- 21. ROW LEVEL SECURITY POLICIES - AUDIT TRAIL TABLE
-- ============================================================================

-- Only admins can read audit trail
CREATE POLICY "Only admins can read audit trail"
ON public.audit_trail
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin' AND status = 'active'
  )
);

-- ============================================================================
-- 22. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_news_author ON public.news(author_id);
CREATE INDEX IF NOT EXISTS idx_news_created ON public.news(created_at);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_policies_status ON public.policies(status);
CREATE INDEX IF NOT EXISTS idx_polls_created ON public.polls(created_at);
CREATE INDEX IF NOT EXISTS idx_concerns_status ON public.concerns(status);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON public.admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_trail(created_at);

-- ============================================================================
-- 23. SAMPLE DATA - ADMIN USER
-- ============================================================================

-- NOTE: You need to create the admin auth user first via Supabase Auth Dashboard
-- Then insert here. Use the UUID from auth.users after creating the auth account.
-- For now, we'll create a placeholder. Replace 'YOUR_ADMIN_UUID' with actual UUID

-- Example: If your admin auth user has UUID 'b5606c33-de91-472d-9be7-e52605840e0f'
-- Uncomment and use this:
/*
INSERT INTO public.users (id, email, name, role, status) 
VALUES (
  'b5606c33-de91-472d-9be7-e52605840e0f',
  'admin@sgld.com',
  'Admin User',
  'admin',
  'active'
)
ON CONFLICT (id) DO UPDATE SET status = 'active';
*/

-- ============================================================================
-- 24. SAMPLE DATA - NEWS
-- ============================================================================

INSERT INTO public.news (title, content, author_id)
SELECT 
  'Welcome to SGLD Platform',
  'Welcome to the SGLD Student Leadership Dashboard. This platform is designed to help manage student activities, governance, and communications.',
  id
FROM public.users WHERE role = 'admin' AND email = 'admin@sgld.com'
LIMIT 1;

INSERT INTO public.news (title, content, author_id)
SELECT 
  'Upcoming Campus Event',
  'We have an exciting campus event coming up next month. Stay tuned for more details!',
  id
FROM public.users WHERE role = 'admin' AND email = 'admin@sgld.com'
LIMIT 1;

INSERT INTO public.news (title, content, author_id)
SELECT 
  'Student Feedback Form Available',
  'Your voice matters! Please fill out our student feedback form to help us improve the platform.',
  id
FROM public.users WHERE role = 'admin' AND email = 'admin@sgld.com'
LIMIT 1;

INSERT INTO public.news (title, content, author_id)
SELECT 
  'New Policy Implementation',
  'We are implementing new policies to enhance student life. Please review them in the Policies section.',
  id
FROM public.users WHERE role = 'admin' AND email = 'admin@sgld.com'
LIMIT 1;

INSERT INTO public.news (title, content, author_id)
SELECT 
  'Leadership Program Launched',
  'We are proud to launch our new leadership development program for interested students.',
  id
FROM public.users WHERE role = 'admin' AND email = 'admin@sgld.com'
LIMIT 1;

-- ============================================================================
-- 25. SAMPLE DATA - EVENTS
-- ============================================================================

INSERT INTO public.events (title, description, date, location, organizer_id)
SELECT 
  'Student Leadership Conference',
  'Annual conference for student leaders to discuss initiatives and strategies.',
  NOW() + INTERVAL '30 days',
  'Main Auditorium',
  id
FROM public.users WHERE role = 'admin' AND email = 'admin@sgld.com'
LIMIT 1;

INSERT INTO public.events (title, description, date, location, organizer_id)
SELECT 
  'Community Service Drive',
  'Join us for a community service event to give back to our local area.',
  NOW() + INTERVAL '14 days',
  'Campus Grounds',
  id
FROM public.users WHERE role = 'admin' AND email = 'admin@sgld.com'
LIMIT 1;

INSERT INTO public.events (title, description, date, location, organizer_id)
SELECT 
  'Forum for Student Concerns',
  'Open forum where students can raise concerns and suggestions.',
  NOW() + INTERVAL '7 days',
  'Student Center',
  id
FROM public.users WHERE role = 'admin' AND email = 'admin@sgld.com'
LIMIT 1;

INSERT INTO public.events (title, description, date, location, organizer_id)
SELECT 
  'Social Integration Event',
  'Casual social event to help students connect and build community.',
  NOW() + INTERVAL '21 days',
  'Recreation Center',
  id
FROM public.users WHERE role = 'admin' AND email = 'admin@sgld.com'
LIMIT 1;

INSERT INTO public.events (title, description, date, location, organizer_id)
SELECT 
  'Campus Clean-up Initiative',
  'Help us maintain a clean and beautiful campus environment.',
  NOW() + INTERVAL '10 days',
  'Various Locations',
  id
FROM public.users WHERE role = 'admin' AND email = 'admin@sgld.com'
LIMIT 1;

-- ============================================================================
-- 26. SAMPLE DATA - POLICIES
-- ============================================================================

INSERT INTO public.policies (title, description, status, created_by, approved_by)
SELECT 
  'Academic Integrity Policy',
  'Policy ensuring academic integrity and preventing plagiarism.',
  'approved',
  id,
  id
FROM public.users WHERE role = 'admin' AND email = 'admin@sgld.com'
LIMIT 1;

INSERT INTO public.policies (title, description, status, created_by, approved_by)
SELECT 
  'Student Code of Conduct',
  'Expected behavior standards for all student members.',
  'approved',
  id,
  id
FROM public.users WHERE role = 'admin' AND email = 'admin@sgld.com'
LIMIT 1;

INSERT INTO public.policies (title, description, status, created_by)
SELECT 
  'New Event Approval Process',
  'Process for student organizations to request event approvals.',
  'pending_approval',
  id
FROM public.users WHERE role = 'admin' AND email = 'admin@sgld.com'
LIMIT 1;

-- ============================================================================
-- 27. SAMPLE DATA - CONCERNS
-- ============================================================================
-- Note: Concerns require an authenticated user, so we'll skip sample data
-- You can create concerns after logging in as a user or admin

-- ============================================================================
-- 28. SAMPLE DATA - POLLS
-- ============================================================================

INSERT INTO public.polls (question, created_by, expires_at)
SELECT 
  'What is your preferred event format?',
  id,
  NOW() + INTERVAL '7 days'
FROM public.users WHERE role = 'admin' AND email = 'admin@sgld.com'
LIMIT 1;

INSERT INTO public.polls (question, created_by, expires_at)
SELECT 
  'How often should we hold campus events?',
  id,
  NOW() + INTERVAL '14 days'
FROM public.users WHERE role = 'admin' AND email = 'admin@sgld.com'
LIMIT 1;

INSERT INTO public.polls (question, created_by, expires_at)
SELECT 
  'What topics would you like to discuss in student forums?',
  id,
  NOW() + INTERVAL '10 days'
FROM public.users WHERE role = 'admin' AND email = 'admin@sgld.com'
LIMIT 1;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- Your database is now ready!
-- Next steps:
-- 1. Create your admin auth account via Supabase Auth Dashboard
-- 2. Get the admin UUID and insert it into users table
-- 3. Update your .env.local with the new Supabase credentials
-- 4. Restart your Vite dev server
-- 5. Try logging in with your admin account
-- ============================================================================
