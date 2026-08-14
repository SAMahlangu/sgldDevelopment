-- ============================================================================
-- FIX NULL PASSWORDS FOR EXISTING ADMINS
-- ============================================================================
-- Run this script to set passwords for admins that currently have NULL
-- ============================================================================

-- ============================================================================
-- STEP 1: SET PASSWORDS FOR ALL EXISTING ADMINS (even if they already had values)
-- ============================================================================

UPDATE public.users 
SET password = '123456789'
WHERE role = 'admin' AND password IS NULL;

-- ============================================================================
-- STEP 2: VERIFY THE UPDATE
-- ============================================================================

SELECT 
  id,
  email,
  name,
  campus,
  password,
  status
FROM public.users 
WHERE role = 'admin'
ORDER BY campus;

-- ============================================================================
-- COUNT RESULTS
-- ============================================================================

SELECT 
  COUNT(*) as total_admins,
  COUNT(CASE WHEN password = '123456789' THEN 1 END) as admins_with_correct_password,
  COUNT(CASE WHEN password IS NULL THEN 1 END) as admins_without_password
FROM public.users 
WHERE role = 'admin';

-- ============================================================================
-- DONE!
-- All admins should now have password: 123456789
-- ============================================================================
