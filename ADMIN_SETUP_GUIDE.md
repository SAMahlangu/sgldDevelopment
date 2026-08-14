# Admin Setup - Step by Step Guide

## ⚠️ IMPORTANT: Two-Step Process Required

Supabase Auth and your application database are **separate systems** that must be synchronized.

---

## STEP 1: Create Admin User in Supabase Auth (Dashboard)

**This CANNOT be done via SQL - must be done in the Supabase dashboard.**

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Authentication** → **Users** tab
3. Click **"Invite user"** button
4. Fill in:
   - **Email**: `siphoalex955@gmail.com`
   - **Password**: `OpTiMuM.2.`
   - ✅ Check "Auto confirm user"
   - ❌ Do NOT send invitation email
5. Click **"Send invite"**
6. **Copy the User ID** that appears (UUID format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
7. **Save this ID** - you'll need it in Step 2

---

## STEP 2: Run the Admin Setup SQL Script

Once you have the User ID from Step 1, replace `YOUR_USER_ID_HERE` in the script below and run it in Supabase SQL Editor.

### Setup Script:

```sql
-- ============================================================================
-- SGLD ADMIN SETUP SCRIPT
-- Replace 'YOUR_USER_ID_HERE' with the actual User ID from Supabase Auth
-- ============================================================================

-- Step 1: Verify Admin User in Auth Table
-- This is informational only - shows if the auth user was created
SELECT 
  id, 
  email, 
  created_at 
FROM auth.users 
WHERE email = 'siphoalex955@gmail.com';

-- ============================================================================
-- Step 2: Clear any old admin entries (if re-running setup)
-- ============================================================================
DELETE FROM users 
WHERE email = 'siphoalex955@gmail.com' 
AND id != 'YOUR_USER_ID_HERE';

-- ============================================================================
-- Step 3: Insert or Update Admin User in Application Database
-- ============================================================================
INSERT INTO users (
  id, 
  email, 
  name, 
  role, 
  status, 
  created_at, 
  updated_at
)
VALUES (
  'YOUR_USER_ID_HERE',
  'siphoalex955@gmail.com',
  'System Administrator',
  'admin',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  status = 'active',
  updated_at = NOW();

-- ============================================================================
-- Step 4: Verify Admin Setup
-- ============================================================================
-- Run this to confirm everything is set up correctly:

SELECT 
  id,
  email,
  name,
  role,
  status,
  created_at
FROM users
WHERE email = 'siphoalex955@gmail.com';

-- Expected result:
-- ✓ id: YOUR_USER_ID_HERE
-- ✓ email: siphoalex955@gmail.com
-- ✓ name: System Administrator
-- ✓ role: admin
-- ✓ status: active

-- ============================================================================
-- Step 5: Verify RLS Policies Allow Login
-- ============================================================================
-- This checks that login policies are correctly configured:

SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  qual 
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;

-- Should see policy: "Allow unauthenticated login lookups"

-- ============================================================================
-- Step 6: Create Sample Data (Optional - if not done from main migration)
-- ============================================================================

-- News Articles
INSERT INTO news (title, description, image_url, created_at) VALUES
('Campus News Launch', 'Welcome to the new student governance news portal', 'https://picsum.photos/400/300?random=1', NOW() - INTERVAL '5 days'),
('Upcoming Leadership Workshop', 'Join us for an exclusive leadership development workshop', 'https://picsum.photos/400/300?random=2', NOW() - INTERVAL '3 days'),
('Academic Excellence Announcement', 'New scholarships available for high-performing students', 'https://picsum.photos/400/300?random=3', NOW() - INTERVAL '1 day'),
('Campus Safety Initiative', 'New security protocols implemented for student safety', 'https://picsum.photos/400/300?random=4', NOW()),
('Student Union Elections', 'Nominations open for upcoming student leadership positions', 'https://picsum.photos/400/300?random=5', NOW())
ON CONFLICT DO NOTHING;

-- Events
INSERT INTO events (title, location, event_date, event_time, description, created_at) VALUES
('Leadership Workshop', 'Main Auditorium', CURRENT_DATE + INTERVAL '7 days', '14:00:00', 'Learn leadership skills from industry experts', NOW()),
('General Assembly', 'Student Centre', CURRENT_DATE + INTERVAL '14 days', '10:00:00', 'Monthly meeting with all student representatives', NOW()),
('Career Fair 2026', 'Convention Centre', CURRENT_DATE + INTERVAL '21 days', '09:00:00', 'Connect with top employers and explore career opportunities', NOW()),
('Networking Dinner', 'Grand Hall', CURRENT_DATE + INTERVAL '28 days', '18:30:00', 'Evening networking event for student leaders and alumni', NOW()),
('Policy Discussion Forum', 'Conference Room A', CURRENT_DATE + INTERVAL '35 days', '15:00:00', 'Open discussion on new campus policies', NOW())
ON CONFLICT DO NOTHING;

-- Polls
INSERT INTO polls (title, description, options, created_at) VALUES
('Best Time for Meetings', 'When should general assemblies be held?', '["Morning", "Afternoon", "Evening", "Weekend"]'::jsonb, NOW()),
('Campus Improvement Priority', 'What should be our main focus?', '["Infrastructure", "Student Services", "Safety", "Academics"]'::jsonb, NOW() - INTERVAL '2 days'),
('Event Frequency', 'How often should we organize events?', '["Weekly", "Bi-weekly", "Monthly", "Quarterly"]'::jsonb, NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- Concerns (linked to admin)
INSERT INTO concerns (user_id, title, description, status, created_at) VALUES
('YOUR_USER_ID_HERE', 'Library Hours Extended', 'Request to extend library hours during exam period', 'open', NOW() - INTERVAL '3 days'),
('YOUR_USER_ID_HERE', 'Parking Availability', 'More parking spaces needed on campus', 'open', NOW() - INTERVAL '5 days'),
('YOUR_USER_ID_HERE', 'Dining Options', 'Request for more vegetarian meal options in cafeteria', 'open', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Policies (linked to admin)
INSERT INTO policies (title, description, content, status, created_by, created_at) VALUES
('Code of Conduct', 'Student conduct guidelines', 'All students must adhere to the following conduct guidelines...', 'pending', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '2 days'),
('Attendance Policy', 'Revised attendance requirements', 'Updated attendance policy for 2026 academic year...', 'pending', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '1 day'),
('Academic Integrity', 'Plagiarism and academic standards', 'Students are expected to maintain highest academic standards...', 'approved', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '30 days')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Step 7: Final Verification
-- ============================================================================

SELECT 
  'Admin Users' as check_name,
  COUNT(*) as count
FROM users
WHERE role = 'admin'

UNION ALL

SELECT 
  'Active Data - News',
  COUNT(*)
FROM news

UNION ALL

SELECT 
  'Active Data - Events',
  COUNT(*)
FROM events

UNION ALL

SELECT 
  'Active Data - Policies',
  COUNT(*)
FROM policies;

-- Expected results:
-- ✓ Admin Users: 1
-- ✓ News: 5
-- ✓ Events: 5
-- ✓ Policies: 3
```

---

## STEP 3: Test Admin Login

1. Go to your SGLD application
2. Click **"Administrator"** role
3. Enter:
   - **Email**: `siphoalex955@gmail.com`
   - **Password**: `OpTiMuM.2.`
4. Click **"Login"**
5. ✅ Should see Admin Dashboard

---

## 🔒 Security Checklist

- ✅ Admin user created in Supabase Auth (Step 1)
- ✅ Admin linked in application database (Step 2)
- ✅ Admin role = 'admin'
- ✅ Admin status = 'active'
- ✅ RLS policies prevent unauthorized access
- ✅ No demo credentials shown for admin login
- ✅ Password: `OpTiMuM.2.` (change in production)
- ✅ Audit trail tracks all admin actions

---

## Troubleshooting

### "Invalid email, password, or role" error
- Check if User ID was correctly copied from Supabase Auth
- Verify the User ID in Step 2 SQL matches the actual auth user ID
- Run verification query from Step 4

### Can't see admin in database
- User ID might be incorrect
- Run SELECT query to find actual user:
```sql
SELECT id, email FROM auth.users WHERE email = 'siphoalex955@gmail.com';
```

### Still can't login
- Clear browser cache/cookies
- Check that you've run ALL steps in order
- Verify RLS policies allow unauthenticated login lookups (Step 5)

---

## Next: Create Test Accounts

Once admin login works, you can create student/src test accounts through the signup flow for demos.
