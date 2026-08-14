-- ============================================================================
-- ADD NEW ADMIN USER - SGLD
-- ============================================================================
-- New Admin Credentials:
--   Email: admin@sgld.com
--   Password: 123456789
--   User ID: b5606c33-de91-472d-9be7-e52605840e0f
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
-- STEP 2: Clean Up Any Duplicate Entries
-- ============================================================================

DELETE FROM users 
WHERE email = 'admin@sgld.com' 
AND id::text != 'b5606c33-de91-472d-9be7-e52605840e0f';

-- ============================================================================
-- STEP 3: Insert New Admin User into Application Database
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
SELECT
  id,
  email,
  'Admin User' as name,
  'admin' as role,
  'active' as status,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users
WHERE email = 'admin@sgld.com'
  AND NOT EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.users.id
  )

ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  status = 'active',
  updated_at = NOW();

-- ============================================================================
-- STEP 4: Verify New Admin User Setup
-- ============================================================================

SELECT 
  id,
  email,
  name,
  role,
  status,
  created_at,
  'User correctly configured' as verification
FROM users
WHERE email = 'admin@sgld.com'
AND role = 'admin'
AND status = 'active';

-- ============================================================================
-- STEP 5: List All Admin Users
-- ============================================================================

SELECT 
  id,
  email,
  name,
  role,
  status,
  created_at
FROM users
WHERE role = 'admin'
ORDER BY created_at DESC;

-- ============================================================================
-- Ready to Test
-- ============================================================================
-- Go to SGLD Application
-- Select Role: Administrator
-- Email: admin@sgld.com
-- Password: 123456789
-- Click Login
-- ============================================================================
