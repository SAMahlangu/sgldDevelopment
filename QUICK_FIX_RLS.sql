-- ============================================================================
-- QUICK START - FIX RLS POLICIES FOR LOGIN
-- ============================================================================
-- If you're getting 500 errors on login, run this script
-- ============================================================================

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Allow login query" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admin full access" ON public.users;

-- Create a SIMPLE policy that allows login (read-only, no auth required)
CREATE POLICY "Allow Public Login" ON public.users
  FOR SELECT
  USING (true);

-- Create policy for authenticated users to read their own data
CREATE POLICY "Users Read Own Data" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Create policy for admin users (authenticated with admin role)
CREATE POLICY "Admin Access" ON public.users
  FOR ALL
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Verify the users table
SELECT COUNT(*) as "Total Users", 
       SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as "Admin Count",
       SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as "Active Count"
FROM public.users;

-- Show all RLS policies on users table
SELECT policyname, permissive, qual 
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- ============================================================================
-- If you still get errors, try this complete reset:
-- ============================================================================

-- Disable RLS temporarily for testing
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Re-enable with simple policy
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Temporary Allow All" ON public.users
  FOR SELECT
  USING (true);

-- Test the query manually
SELECT id, email, name, role, status 
FROM public.users 
WHERE email = 'admin1@sgld.com' 
  AND role = 'admin'
LIMIT 1;
