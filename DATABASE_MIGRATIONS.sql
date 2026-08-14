-- SGLD Database Migration Script
-- Copy and paste all sections into your Supabase SQL Editor

-- ============================================================================
-- 1. CORE TABLES
-- ============================================================================

-- Users Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'student',
  status VARCHAR(50) DEFAULT 'pending_approval',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- ============================================================================
-- 2. NEWS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at DESC);

-- ============================================================================
-- 3. EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  event_date DATE NOT NULL,
  event_time TIME,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);

-- ============================================================================
-- 4. CONCERNS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS concerns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_concerns_user_id ON concerns(user_id);
CREATE INDEX IF NOT EXISTS idx_concerns_status ON concerns(status);

-- ============================================================================
-- 5. POLLS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  options JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 6. POLL VOTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  poll_id UUID NOT NULL,
  selected_option VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, poll_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON poll_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON poll_votes(poll_id);

-- ============================================================================
-- 7. ADMIN TABLES
-- ============================================================================

-- Policies Table
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_by UUID NOT NULL,
  approved_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);
CREATE INDEX IF NOT EXISTS idx_policies_created_by ON policies(created_by);
CREATE INDEX IF NOT EXISTS idx_policies_created_at ON policies(created_at DESC);

-- Admin Logs Table
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);

-- System Reports Table
CREATE TABLE IF NOT EXISTS system_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  data JSONB,
  generated_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_system_reports_type ON system_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_system_reports_created_at ON system_reports(created_at DESC);

-- User Suspensions Table
CREATE TABLE IF NOT EXISTS user_suspensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  reason TEXT,
  suspended_by UUID NOT NULL,
  suspension_start TIMESTAMP DEFAULT NOW(),
  suspension_end TIMESTAMP,
  is_permanent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (suspended_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_user_suspensions_user_id ON user_suspensions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_suspensions_active ON user_suspensions(is_permanent, suspension_end);

-- Audit Trail Table
CREATE TABLE IF NOT EXISTS audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action VARCHAR(255) NOT NULL,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_trail_user_id ON audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created_at ON audit_trail(created_at DESC);

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) - ENABLE ON ALL TABLES
-- ============================================================================

-- Users Table RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own profile" ON users;
CREATE POLICY "Users can read their own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "All authenticated users can see other users" ON users;
CREATE POLICY "All authenticated users can see other users" 
ON users FOR SELECT 
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow unauthenticated login lookups" ON users;
CREATE POLICY "Allow unauthenticated login lookups" 
ON users FOR SELECT 
USING (true);

-- News Table RLS
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read news" ON news;
CREATE POLICY "Anyone can read news" 
ON news FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Only admins can insert news" ON news;
CREATE POLICY "Only admins can insert news" 
ON news FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Only admins can update news" ON news;
CREATE POLICY "Only admins can update news" 
ON news FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Only admins can delete news" ON news;
CREATE POLICY "Only admins can delete news" 
ON news FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Events Table RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read events" ON events;
CREATE POLICY "Anyone can read events" 
ON events FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Only admins can insert events" ON events;
CREATE POLICY "Only admins can insert events" 
ON events FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Only admins can update events" ON events;
CREATE POLICY "Only admins can update events" 
ON events FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Only admins can delete events" ON events;
CREATE POLICY "Only admins can delete events" 
ON events FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Concerns Table RLS
ALTER TABLE concerns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own concerns" ON concerns;
CREATE POLICY "Users can read their own concerns" 
ON concerns FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all concerns" ON concerns;
CREATE POLICY "Admins can read all concerns" 
ON concerns FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Authenticated users can insert concerns" ON concerns;
CREATE POLICY "Authenticated users can insert concerns" 
ON concerns FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Polls Table RLS
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read polls" ON polls;
CREATE POLICY "Anyone can read polls" 
ON polls FOR SELECT 
USING (true);

-- Poll Votes Table RLS
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own votes" ON poll_votes;
CREATE POLICY "Users can read their own votes" 
ON poll_votes FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can vote on polls" ON poll_votes;
CREATE POLICY "Users can vote on polls" 
ON poll_votes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policies Table RLS
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all policies" ON policies;
CREATE POLICY "Admins can manage all policies" 
ON policies FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Everyone can read approved policies" ON policies;
CREATE POLICY "Everyone can read approved policies" 
ON policies FOR SELECT 
USING (status = 'approved');

-- Admin Logs Table RLS
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can read admin logs" ON admin_logs;
CREATE POLICY "Only admins can read admin logs" 
ON admin_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- System Reports Table RLS
ALTER TABLE system_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can access system reports" ON system_reports;
CREATE POLICY "Only admins can access system reports" 
ON system_reports FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- User Suspensions Table RLS
ALTER TABLE user_suspensions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can manage suspensions" ON user_suspensions;
CREATE POLICY "Only admins can manage suspensions" 
ON user_suspensions FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Audit Trail Table RLS
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can read all audit logs" ON audit_trail;
CREATE POLICY "Only admins can read all audit logs" 
ON audit_trail FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Users can insert audit logs for themselves" ON audit_trail;
CREATE POLICY "Users can insert audit logs for themselves" 
ON audit_trail FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 9. DATABASE FUNCTIONS
-- ============================================================================

-- Get Admin Statistics
CREATE OR REPLACE FUNCTION get_admin_statistics()
RETURNS TABLE (
  total_users BIGINT,
  pending_approvals BIGINT,
  active_concerns BIGINT,
  active_polls BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM users)::BIGINT as total_users,
    (SELECT COUNT(*) FROM users WHERE status = 'pending_approval')::BIGINT as pending_approvals,
    (SELECT COUNT(*) FROM concerns WHERE status = 'open')::BIGINT as active_concerns,
    (SELECT COUNT(*) FROM polls)::BIGINT as active_polls;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Approve Pending User
CREATE OR REPLACE FUNCTION approve_pending_user(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  admin_id UUID := auth.uid();
BEGIN
  UPDATE users SET status = 'active' WHERE id = user_id_param AND status = 'pending_approval';
  
  INSERT INTO admin_logs (admin_id, action, resource_type, resource_id)
  VALUES (admin_id, 'approve_user', 'user', user_id_param);
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reject Pending User
CREATE OR REPLACE FUNCTION reject_pending_user(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  admin_id UUID := auth.uid();
BEGIN
  DELETE FROM users WHERE id = user_id_param AND status = 'pending_approval';
  
  INSERT INTO admin_logs (admin_id, action, resource_type, resource_id)
  VALUES (admin_id, 'reject_user', 'user', user_id_param);
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Suspend User
CREATE OR REPLACE FUNCTION suspend_user(
  user_id_param UUID,
  reason_param TEXT,
  days_param INT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  admin_id UUID := auth.uid();
BEGIN
  INSERT INTO user_suspensions (user_id, reason, suspended_by, suspension_end, is_permanent)
  VALUES (user_id_param, reason_param, admin_id, NOW() + (days_param || ' days')::INTERVAL, days_param IS NULL);
  
  INSERT INTO admin_logs (admin_id, action, resource_type, resource_id)
  VALUES (admin_id, 'suspend_user', 'user', user_id_param);
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get User Suspension Status
CREATE OR REPLACE FUNCTION get_user_suspension_status(user_id_param UUID)
RETURNS TABLE (
  is_suspended BOOLEAN,
  suspension_reason TEXT,
  suspension_end_time TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN COUNT(*) > 0 AND (su.is_permanent OR su.suspension_end > NOW()) THEN true 
      ELSE false 
    END as is_suspended,
    su.reason,
    su.suspension_end
  FROM user_suspensions su
  WHERE su.user_id = user_id_param
  GROUP BY su.reason, su.suspension_end;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 10. SAMPLE DATA (COMPREHENSIVE TEST DATA)
-- ============================================================================

-- Insert sample news (multiple entries)
INSERT INTO news (title, description, image_url, created_at) VALUES
('Campus News Launch', 'Welcome to the new student governance news portal', 'https://picsum.photos/400/300?random=1', NOW() - INTERVAL '5 days'),
('Upcoming Leadership Workshop', 'Join us for an exclusive leadership development workshop', 'https://picsum.photos/400/300?random=2', NOW() - INTERVAL '3 days'),
('Academic Excellence Announcement', 'New scholarships available for high-performing students', 'https://picsum.photos/400/300?random=3', NOW() - INTERVAL '1 day'),
('Campus Safety Initiative', 'New security protocols implemented for student safety', 'https://picsum.photos/400/300?random=4', NOW()),
('Student Union Elections', 'Nominations open for upcoming student leadership positions', 'https://picsum.photos/400/300?random=5', NOW())
ON CONFLICT DO NOTHING;

-- Insert sample events
INSERT INTO events (title, location, event_date, event_time, description, created_at) VALUES
('Leadership Workshop', 'Main Auditorium', CURRENT_DATE + INTERVAL '7 days', '14:00:00', 'Learn leadership skills from industry experts', NOW()),
('General Assembly', 'Student Centre', CURRENT_DATE + INTERVAL '14 days', '10:00:00', 'Monthly meeting with all student representatives', NOW()),
('Career Fair 2026', 'Convention Centre', CURRENT_DATE + INTERVAL '21 days', '09:00:00', 'Connect with top employers and explore career opportunities', NOW()),
('Networking Dinner', 'Grand Hall', CURRENT_DATE + INTERVAL '28 days', '18:30:00', 'Evening networking event for student leaders and alumni', NOW()),
('Policy Discussion Forum', 'Conference Room A', CURRENT_DATE + INTERVAL '35 days', '15:00:00', 'Open discussion on new campus policies', NOW())
ON CONFLICT DO NOTHING;

-- Insert sample polls
INSERT INTO polls (title, description, options, created_at) VALUES
('Best Time for Meetings', 'When should general assemblies be held?', '["Morning", "Afternoon", "Evening", "Weekend"]'::jsonb, NOW()),
('Campus Improvement Priority', 'What should be our main focus?', '["Infrastructure", "Student Services", "Safety", "Academics"]'::jsonb, NOW() - INTERVAL '2 days'),
('Event Frequency', 'How often should we organize events?', '["Weekly", "Bi-weekly", "Monthly", "Quarterly"]'::jsonb, NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- Insert sample concerns (for students to submit)
INSERT INTO concerns (user_id, title, description, status, created_at) VALUES
('50306f1f-fb84-4aa5-8a3e-10033a927f32', 'Library Hours Extended', 'Request to extend library hours during exam period', 'open', NOW() - INTERVAL '3 days'),
('50306f1f-fb84-4aa5-8a3e-10033a927f32', 'Parking Availability', 'More parking spaces needed on campus', 'open', NOW() - INTERVAL '5 days'),
('50306f1f-fb84-4aa5-8a3e-10033a927f32', 'Dining Options', 'Request for more vegetarian meal options in cafeteria', 'open', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Insert sample policies
INSERT INTO policies (title, description, content, status, created_by, created_at) VALUES
('Code of Conduct', 'Student conduct guidelines', 'All students must adhere to the following conduct guidelines...', 'pending', '50306f1f-fb84-4aa5-8a3e-10033a927f32', NOW() - INTERVAL '2 days'),
('Attendance Policy', 'Revised attendance requirements', 'Updated attendance policy for 2026 academic year...', 'pending', '50306f1f-fb84-4aa5-8a3e-10033a927f32', NOW() - INTERVAL '1 day'),
('Academic Integrity', 'Plagiarism and academic standards', 'Students are expected to maintain highest academic standards...', 'approved', '50306f1f-fb84-4aa5-8a3e-10033a927f32', NOW() - INTERVAL '30 days')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 11. MANUAL ADMIN CREATION
-- ============================================================================
-- IMPORTANT: Admins cannot self-register through the app. They must be manually created.
-- Admin test credentials:
--   Email: siphoalex955@gmail.com
--   Password: OpTiMuM.2.

-- Insert admin user into users table
INSERT INTO users (id, email, name, role, status, created_at, updated_at)
VALUES (
  '50306f1f-fb84-4aa5-8a3e-10033a927f32',
  'siphoalex955@gmail.com',
  'System Administrator',
  'admin',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 12. POST-MIGRATION VERIFICATION
-- ============================================================================

-- Run this query to verify all tables were created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Run this to check RLS is enabled:
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
