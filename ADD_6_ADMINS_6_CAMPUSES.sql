-- ============================================================================
-- ADD 6 ADMINS AND 6 CAMPUSES TO SYSTEM
-- ============================================================================
-- This script expands the system to support 6 admins across 6 campuses
-- Existing: 2 admins, 2 campuses
-- Adding: 4 admins, 4 campuses
-- ============================================================================

-- ============================================================================
-- STEP 1: ADD CAMPUS AND PASSWORD COLUMNS TO USERS TABLE (if not exists)
-- ============================================================================

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS campus VARCHAR(100);

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- ============================================================================
-- STEP 2: UPDATE EXISTING ADMINS WITH CAMPUS AND PASSWORD ASSIGNMENTS
-- ============================================================================

UPDATE public.users 
SET campus = 'Campus 1', password = '123456789'
WHERE email = 'admin@sgld.com';

UPDATE public.users 
SET campus = 'Campus 2', password = '123456789'
WHERE email = 'admin1@sgld.com';

-- ============================================================================
-- STEP 3: INSERT 4 NEW ADMIN USERS (admin3 - admin6) WITH SPECIFIC UIDs AND PASSWORDS
-- ============================================================================

INSERT INTO public.users (id, email, name, role, status, campus, password, created_at, updated_at)
VALUES 
  ('09ecdec3-a6ee-443b-b7f2-da0a99fc71bc', 'admin3@sgld.com', 'Admin 3 - Campus 3', 'admin', 'active', 'Campus 3', '123456789', NOW(), NOW()),
  ('29d4a8ba-e1ae-4769-9a1f-e800f66af472', 'admin4@sgld.com', 'Admin 4 - Campus 4', 'admin', 'active', 'Campus 4', '123456789', NOW(), NOW()),
  ('4cd13aeb-1922-4349-9a01-a6832142dc46', 'admin5@sgld.com', 'Admin 5 - Campus 5', 'admin', 'active', 'Campus 5', '123456789', NOW(), NOW()),
  ('10b91904-8ae1-45a8-b56a-654f154edc31', 'admin6@sgld.com', 'Admin 6 - Campus 6', 'admin', 'active', 'Campus 6', '123456789', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- STEP 4: UPDATE SRC MEMBERS WITH CAMPUS 3-6 (if SRC table exists)
-- ============================================================================

-- IF YOUR srcs TABLE EXISTS, ADD SRC MEMBERS FOR NEW CAMPUSES:
-- Uncomment the section below if you have SRC members to add

-- INSERT INTO public.srcs (name, email, password, admin_id, campus, status)
-- SELECT 
--   'SRC - Campus 3' as name,
--   'src_campus3@sgld.com' as email,
--   'password123' as password,
--   (SELECT id FROM public.users WHERE email = 'admin3@sgld.com') as admin_id,
--   'Campus 3' as campus,
--   'active' as status
-- ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- STEP 5: UPDATE SFC MEMBERS WITH CAMPUS 3-6 (if SFC table exists)
-- ============================================================================

-- IF YOUR sfcs TABLE EXISTS, ADD SFC MEMBERS FOR NEW CAMPUSES:
-- Uncomment the section below if you have SFC members to add

-- INSERT INTO public.sfcs (name, email, password, admin_id, campus, status)
-- SELECT 
--   'SFC - Campus 3' as name,
--   'sfc_campus3@sgld.com' as email,
--   'password123' as password,
--   (SELECT id FROM public.users WHERE email = 'admin3@sgld.com') as admin_id,
--   'Campus 3' as campus,
--   'active' as status
-- ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- STEP 6: VERIFICATION QUERIES
-- ============================================================================

-- Show all admins with their assigned campuses and passwords
SELECT 
  id, 
  email, 
  name, 
  role, 
  campus, 
  password,
  status,
  created_at
FROM public.users 
WHERE role = 'admin'
ORDER BY campus;

-- Count admins
SELECT 
  COUNT(*) as total_admins,
  COUNT(DISTINCT campus) as total_campuses,
  COUNT(password) as admins_with_password
FROM public.users 
WHERE role = 'admin';

-- List all unique campuses
SELECT DISTINCT campus 
FROM public.users 
WHERE campus IS NOT NULL 
ORDER BY campus;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- ✅ Added 4 new admin accounts with specific UIDs:
--    - 09ecdec3-a6ee-443b-b7f2-da0a99fc71bc → admin3@sgld.com → Campus 3
--    - 29d4a8ba-e1ae-4769-9a1f-e800f66af472 → admin4@sgld.com → Campus 4
--    - 4cd13aeb-1922-4349-9a01-a6832142dc46 → admin5@sgld.com → Campus 5
--    - 10b91904-8ae1-45a8-b56a-654f154edc31 → admin6@sgld.com → Campus 6
--
-- ✅ Total: 6 Admins across 6 Campuses
--
-- COMPLETE ADMIN DISTRIBUTION:
--  - Campus 1: admin@sgld.com
--  - Campus 2: admin1@sgld.com
--  - Campus 3: admin3@sgld.com (09ecdec3-a6ee-443b-b7f2-da0a99fc71bc)
--  - Campus 4: admin4@sgld.com (29d4a8ba-e1ae-4769-9a1f-e800f66af472)
--  - Campus 5: admin5@sgld.com (4cd13aeb-1922-4349-9a01-a6832142dc46)
--  - Campus 6: admin6@sgld.com (10b91904-8ae1-45a8-b56a-654f154edc31)
--
-- ============================================================================
