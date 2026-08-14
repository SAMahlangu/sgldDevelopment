-- ============================================================================
-- FINAL FIX - ELIMINATE INFINITE RECURSION IN RLS POLICIES
-- ============================================================================
-- The problem: RLS policies can't query the same table they're protecting
-- This script uses simpler, recursive-free policies
-- ============================================================================

-- Step 1: Drop ALL problematic policies on users table
DROP POLICY IF EXISTS "Allow login query" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admin full access" ON public.users;
DROP POLICY IF EXISTS "Allow Public Login" ON public.users;
DROP POLICY IF EXISTS "Users Read Own Data" ON public.users;
DROP POLICY IF EXISTS "Admin Access" ON public.users;
DROP POLICY IF EXISTS "Temporary Allow All" ON public.users;

-- Step 2: DISABLE RLS temporarily while we fix
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 3: Add ONE simple policy - allow all SELECT (login queries)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for login" ON public.users
  FOR SELECT
  USING (true);

-- Step 4: Verify users data exists
SELECT 'Users table data:' as "Status";
SELECT id, email, name, role, status FROM public.users;

-- Step 5: Test the exact login query
SELECT 'Test Query Result:' as "Status";
SELECT id, email, name, role, status 
FROM public.users 
WHERE email = 'admin1@sgld.com' 
  AND role = 'admin'
LIMIT 1;

-- Step 6: Test second admin account
SELECT 'Test Query 2:' as "Status";
SELECT id, email, name, role, status 
FROM public.users 
WHERE email = 'admin@sgld.com' 
  AND role = 'admin'
LIMIT 1;
