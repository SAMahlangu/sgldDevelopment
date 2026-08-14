-- ============================================================================
-- CLEANUP SCRIPT - REMOVE ALL TABLES EXCEPT USERS (LOGIN ONLY)
-- ============================================================================
-- This script removes all data and tables added, keeping only the users table
-- for admin login functionality
-- ============================================================================

-- ============================================================================
-- STEP 1: Drop All Extra Tables
-- ============================================================================

DROP TABLE IF EXISTS public.audit_trail CASCADE;
DROP TABLE IF EXISTS public.user_suspensions CASCADE;
DROP TABLE IF EXISTS public.system_reports CASCADE;
DROP TABLE IF EXISTS public.admin_logs CASCADE;
DROP TABLE IF EXISTS public.concerns CASCADE;
DROP TABLE IF EXISTS public.poll_votes CASCADE;
DROP TABLE IF EXISTS public.polls CASCADE;
DROP TABLE IF EXISTS public.policies CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.news CASCADE;

-- ============================================================================
-- STEP 2: Keep USERS Table (Already Exists)
-- ============================================================================
-- The users table with admin user is already created and should remain

-- ============================================================================
-- STEP 3: Verify Admin User Still Exists
-- ============================================================================

SELECT 
  id,
  email,
  name,
  role,
  status,
  created_at,
  '✓ Admin login ready' as status_check
FROM public.users
WHERE email = 'admin@sgld.com'
AND role = 'admin'
AND status = 'active';

-- ============================================================================
-- STEP 4: Cleanup Complete
-- ============================================================================
-- All extra tables removed. Database is now clean with only login functionality.
-- Ready to test admin login:
-- Email: admin@sgld.com
-- Password: 123456789
-- ============================================================================
