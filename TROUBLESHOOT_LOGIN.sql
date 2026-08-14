-- ============================================================================
-- TROUBLESHOOT LOGIN ISSUES
-- ============================================================================
-- Run each query separately to diagnose the problem

-- ============================================================================
-- 1. Check if USERS table exists
-- ============================================================================

SELECT 
  table_name,
  'Users table EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'users';

-- ============================================================================
-- 2. Check all users in the table
-- ============================================================================

SELECT 
  id,
  email,
  name,
  role,
  status,
  created_at
FROM public.users
ORDER BY created_at DESC;

-- ============================================================================
-- 3. Check RLS policies on users table
-- ============================================================================

SELECT 
  policyname,
  permissive,
  qual as "policy_condition"
FROM pg_policies 
WHERE tablename = 'users' 
  AND schemaname = 'public'
ORDER BY policyname;

-- ============================================================================
-- 4. Check auth.users table to see all auth accounts
-- ============================================================================

SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- ============================================================================
-- RESULTS:
-- If you see 0 rows:
-- 1. Users table doesn't exist - run DATABASE_SETUP_MINIMAL.sql
-- 2. No users in table - run ADMIN_SETUP_SCRIPT.sql
-- If you see users but login fails:
-- 3. RLS policies might be blocking reads
-- 4. Check if email/role combination matches exactly
-- ============================================================================
