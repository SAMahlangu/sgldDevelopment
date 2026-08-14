-- ============================================================================
-- SGLD ADMIN SETUP SQL SCRIPT - NEW PROJECT
-- ============================================================================
-- Admin Credentials:
--   Email: admin1@sgld.com
--   Password: 123456
--   User ID: 0e98b2f1-024f-4ab5-bf3d-fbfdfbd9bbcc
-- ============================================================================

-- ============================================================================
-- STEP 1: Verify Auth User Exists
-- ============================================================================

SELECT 
  id, 
  email, 
  created_at,
  '✓ Auth user exists' as status
FROM auth.users 
WHERE email = 'admin1@sgld.com'
LIMIT 1;

-- ============================================================================
-- STEP 2: Insert Admin User into Application Database
-- ============================================================================

INSERT INTO public.users (id, email, name, role, status) 
VALUES (
  '0e98b2f1-024f-4ab5-bf3d-fbfdfbd9bbcc',
  'admin1@sgld.com',
  'Admin User',
  'admin',
  'active'
)
ON CONFLICT (id) DO UPDATE SET status = 'active';

-- ============================================================================
-- STEP 3: Verify Admin User Setup
-- ============================================================================

SELECT 
  id,
  email,
  name,
  role,
  status,
  created_at,
  '✓ Admin configured correctly' as verification
FROM public.users
WHERE id = '0e98b2f1-024f-4ab5-bf3d-fbfdfbd9bbcc'
AND role = 'admin'
AND status = 'active';

-- ============================================================================
-- READY TO LOGIN
-- ============================================================================
-- Go to SGLD Application and login with:
-- Role: Administrator
-- Email: admin1@sgld.com
-- Password: 123456
-- ============================================================================
