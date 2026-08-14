# Admin Dashboard - Complete Setup Guide

## Admin Functionalities

The admin dashboard manages:
1. **Overview** - System statistics and reports
2. **Approvals** - Approve/reject pending admin & SRC users
3. **Users** - View, manage, and suspend users
4. **Policies** - Create and approve governance policies
5. **News & Events** - Manage news posts and events

---

## Database Tables

### 1. Admin Logs Table
```sql
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at DESC);
```

### 2. Policies Table
```sql
CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_by UUID NOT NULL REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP
);

CREATE INDEX idx_policies_status ON policies(status);
CREATE INDEX idx_policies_created_by ON policies(created_by);
CREATE INDEX idx_policies_created_at ON policies(created_at DESC);
```

### 3. System Reports Table
```sql
CREATE TABLE system_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  data JSONB,
  generated_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_system_reports_type ON system_reports(report_type);
CREATE INDEX idx_system_reports_created_at ON system_reports(created_at DESC);
```

### 4. User Suspension/Ban Records Table
```sql
CREATE TABLE user_suspensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  suspended_by UUID NOT NULL REFERENCES users(id),
  suspension_start TIMESTAMP DEFAULT NOW(),
  suspension_end TIMESTAMP,
  is_permanent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_suspensions_user_id ON user_suspensions(user_id);
CREATE INDEX idx_user_suspensions_active ON user_suspensions(is_permanent, suspension_end);
```

### 5. Audit Trail Table
```sql
CREATE TABLE audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_trail_user_id ON audit_trail(user_id);
CREATE INDEX idx_audit_trail_created_at ON audit_trail(created_at DESC);
```

---

## Row Level Security (RLS) Policies for Admin

```sql
-- Admin Logs - Only admins can read their own logs
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read their own logs"
ON admin_logs FOR SELECT
USING (auth.uid() = admin_id);

CREATE POLICY "Admins can insert their own logs"
ON admin_logs FOR INSERT
WITH CHECK (auth.uid() = admin_id);

-- Policies - Admins can manage, others can read approved only
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all policies"
ON policies FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Everyone can read approved policies"
ON policies FOR SELECT
USING (status = 'approved');

-- System Reports - Only admins can access
ALTER TABLE system_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access system reports"
ON system_reports FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- User Suspensions - Only admins can manage
ALTER TABLE user_suspensions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage suspensions"
ON user_suspensions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Audit Trail - Only admins can read, users can insert for themselves
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all audit logs"
ON audit_trail FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Users can insert audit logs for themselves"
ON audit_trail FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

---

## Admin Service Functions

Add these to your database:

```sql
-- Function to get dashboard statistics
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
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM users WHERE status = 'pending_approval') as pending_approvals,
    (SELECT COUNT(*) FROM concerns WHERE status = 'open') as active_concerns,
    (SELECT COUNT(*) FROM polls) as active_polls;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to suspend a user
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

-- Function to approve a user
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

-- Function to reject a user
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
```

---

## Updated .env Variables

Make sure your `.env.local` includes:

```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
VITE_ADMIN_DEBUG=false
```

---

## Admin Features Checklist

- [ ] Create all database tables
- [ ] Enable RLS policies
- [ ] Create database functions
- [ ] Add admin service to apiService.js
- [ ] Update AdminDashboard.jsx to use Supabase
- [ ] Test user approval workflow
- [ ] Test policy creation and approval
- [ ] Test news & events creation
- [ ] Test user suspension feature
- [ ] Verify audit logs are being recorded
