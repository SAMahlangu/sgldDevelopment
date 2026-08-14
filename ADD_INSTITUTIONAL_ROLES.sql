-- ============================================================================
-- CREATE INSTITUTIONAL STRUCTURES TABLES
-- ============================================================================
-- This script creates separate tables for 4 institutional structures:
-- - isrc_structures: Institutional Student Representative Council
-- - isp_structures: Institutional Student Parliament  
-- - csrc_structures: Campus Student Representative Council
-- - csp_structures: Campus Student Parliament
-- Each table gets 6 records (one per campus/admin)
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE ISRC STRUCTURES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.isrc_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  campus VARCHAR(100) NOT NULL,
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  description TEXT,
  representative_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on admin_id for faster queries
CREATE INDEX IF NOT EXISTS idx_isrc_structures_admin_id ON public.isrc_structures(admin_id);
CREATE INDEX IF NOT EXISTS idx_isrc_structures_campus ON public.isrc_structures(campus);

-- ============================================================================
-- STEP 2: CREATE ISP STRUCTURES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.isp_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  campus VARCHAR(100) NOT NULL,
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  description TEXT,
  member_count INTEGER DEFAULT 0,
  session_frequency VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on admin_id for faster queries
CREATE INDEX IF NOT EXISTS idx_isp_structures_admin_id ON public.isp_structures(admin_id);
CREATE INDEX IF NOT EXISTS idx_isp_structures_campus ON public.isp_structures(campus);

-- ============================================================================
-- STEP 3: CREATE CSRC STRUCTURES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.csrc_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  campus VARCHAR(100) NOT NULL,
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  description TEXT,
  council_size INTEGER DEFAULT 0,
  established_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on admin_id for faster queries
CREATE INDEX IF NOT EXISTS idx_csrc_structures_admin_id ON public.csrc_structures(admin_id);
CREATE INDEX IF NOT EXISTS idx_csrc_structures_campus ON public.csrc_structures(campus);

-- ============================================================================
-- STEP 4: CREATE CSP STRUCTURES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.csp_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  campus VARCHAR(100) NOT NULL,
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  description TEXT,
  parliament_size INTEGER DEFAULT 0,
  session_frequency VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on admin_id for faster queries
CREATE INDEX IF NOT EXISTS idx_csp_structures_admin_id ON public.csp_structures(admin_id);
CREATE INDEX IF NOT EXISTS idx_csp_structures_campus ON public.csp_structures(campus);

-- ============================================================================
-- STEP 5: INSERT ISRC STRUCTURES (6 per campus)
-- ============================================================================

INSERT INTO public.isrc_structures (name, campus, admin_id, status, description, representative_count)
SELECT 
  'ISRC - ' || campus,
  campus,
  id,
  'active',
  'Institutional Student Representative Council for ' || campus,
  12
FROM public.users 
WHERE email IN ('admin1@sgld.com', 'admin2@sgld.com', 'admin3@sgld.com', 
                'admin4@sgld.com', 'admin5@sgld.com', 'admin6@sgld.com')
AND role = 'admin'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 6: INSERT ISP STRUCTURES (6 per campus)
-- ============================================================================

INSERT INTO public.isp_structures (name, campus, admin_id, status, description, member_count, session_frequency)
SELECT 
  'ISP - ' || campus,
  campus,
  id,
  'active',
  'Institutional Student Parliament for ' || campus,
  45,
  'Monthly'
FROM public.users 
WHERE email IN ('admin1@sgld.com', 'admin2@sgld.com', 'admin3@sgld.com', 
                'admin4@sgld.com', 'admin5@sgld.com', 'admin6@sgld.com')
AND role = 'admin'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 7: INSERT CSRC STRUCTURES (6 per campus)
-- ============================================================================

INSERT INTO public.csrc_structures (name, campus, admin_id, status, description, council_size, established_date)
SELECT 
  'CSRC - ' || campus,
  campus,
  id,
  'active',
  'Campus Student Representative Council for ' || campus,
  15,
  CURRENT_DATE
FROM public.users 
WHERE email IN ('admin1@sgld.com', 'admin2@sgld.com', 'admin3@sgld.com', 
                'admin4@sgld.com', 'admin5@sgld.com', 'admin6@sgld.com')
AND role = 'admin'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 8: INSERT CSP STRUCTURES (6 per campus)
-- ============================================================================

INSERT INTO public.csp_structures (name, campus, admin_id, status, description, parliament_size, session_frequency)
SELECT 
  'CSP - ' || campus,
  campus,
  id,
  'active',
  'Campus Student Parliament for ' || campus,
  35,
  'Bi-weekly'
FROM public.users 
WHERE email IN ('admin1@sgld.com', 'admin2@sgld.com', 'admin3@sgld.com', 
                'admin4@sgld.com', 'admin5@sgld.com', 'admin6@sgld.com')
AND role = 'admin'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 9: VERIFICATION QUERY - COUNT ALL STRUCTURES
-- ============================================================================

SELECT 
  'ISRC Structures' as type, 
  COUNT(*) as count 
FROM public.isrc_structures

UNION ALL

SELECT 
  'ISP Structures' as type, 
  COUNT(*) as count 
FROM public.isp_structures

UNION ALL

SELECT 
  'CSRC Structures' as type, 
  COUNT(*) as count 
FROM public.csrc_structures

UNION ALL

SELECT 
  'CSP Structures' as type, 
  COUNT(*) as count 
FROM public.csp_structures;

-- ============================================================================
-- STEP 10: DETAILED STRUCTURE VIEW WITH ADMINS
-- ============================================================================

SELECT 
  'ISRC' as structure_type,
  i.name,
  i.campus,
  u.name as admin_name,
  u.email as admin_email,
  i.status,
  i.representative_count::VARCHAR(50) as member_count
FROM public.isrc_structures i
LEFT JOIN public.users u ON i.admin_id = u.id

UNION ALL

SELECT 
  'ISP' as structure_type,
  i.name,
  i.campus,
  u.name as admin_name,
  u.email as admin_email,
  i.status,
  i.member_count::VARCHAR(50)
FROM public.isp_structures i
LEFT JOIN public.users u ON i.admin_id = u.id

UNION ALL

SELECT 
  'CSRC' as structure_type,
  c.name,
  c.campus,
  u.name as admin_name,
  u.email as admin_email,
  c.status,
  c.council_size::VARCHAR(50)
FROM public.csrc_structures c
LEFT JOIN public.users u ON c.admin_id = u.id

UNION ALL

SELECT 
  'CSP' as structure_type,
  c.name,
  c.campus,
  u.name as admin_name,
  u.email as admin_email,
  c.status,
  c.parliament_size::VARCHAR(50)
FROM public.csp_structures c
LEFT JOIN public.users u ON c.admin_id = u.id;
