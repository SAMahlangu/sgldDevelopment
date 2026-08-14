-- ============================================================================
-- ADD ADMIN USER - NEW SUPABASE PROJECT
-- ============================================================================
-- Admin Credentials:
--   Email: admin@sgld.com
--   Password: 123456789
--   User ID: e0daaf16-3a43-4fec-b73b-88fbe6c434af
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
WHERE email = 'admin@sgld.com'
LIMIT 1;

-- ============================================================================
-- STEP 2: Insert Admin into Application Database
-- ============================================================================

INSERT INTO public.users (id, email, name, role, status) 
VALUES (
  'e0daaf16-3a43-4fec-b73b-88fbe6c434af',
  'admin@sgld.com',
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
WHERE id = 'e0daaf16-3a43-4fec-b73b-88fbe6c434af'
AND role = 'admin'
AND status = 'active';

-- ============================================================================
-- READY TO LOGIN
-- ============================================================================
-- Go to your SGLD Application and login with:
-- Role: Administrator
-- Email: admin@sgld.com
-- Password: 123456789
-- ============================================================================
