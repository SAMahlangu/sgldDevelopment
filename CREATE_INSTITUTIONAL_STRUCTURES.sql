-- ============================================================================
-- CREATE NEW INSTITUTIONAL STRUCTURES (ISRC, ISP, CSRC, CSP)
-- ============================================================================
-- This script creates tables for 4 new institutional roles
-- Each structure will have 6 users per admin (6 admins × 6 users = 36 per role)
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE ISRC TABLE (Institutional Representative Council)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.isrc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  campus VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_isrc_admin_id ON public.isrc(admin_id);
CREATE INDEX IF NOT EXISTS idx_isrc_campus ON public.isrc(campus);
CREATE INDEX IF NOT EXISTS idx_isrc_email ON public.isrc(email);

-- ============================================================================
-- STEP 2: CREATE ISP TABLE (Institutional Student Parliament)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.isp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  campus VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_isp_admin_id ON public.isp(admin_id);
CREATE INDEX IF NOT EXISTS idx_isp_campus ON public.isp(campus);
CREATE INDEX IF NOT EXISTS idx_isp_email ON public.isp(email);

-- ============================================================================
-- STEP 3: CREATE CSRC TABLE (Campus SRC)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.csrc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  campus VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_csrc_admin_id ON public.csrc(admin_id);
CREATE INDEX IF NOT EXISTS idx_csrc_campus ON public.csrc(campus);
CREATE INDEX IF NOT EXISTS idx_csrc_email ON public.csrc(email);

-- ============================================================================
-- STEP 4: CREATE CSP TABLE (Campus Student Parliament)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.csp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  campus VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_csp_admin_id ON public.csp(admin_id);
CREATE INDEX IF NOT EXISTS idx_csp_campus ON public.csp(campus);
CREATE INDEX IF NOT EXISTS idx_csp_email ON public.csp(email);

-- ============================================================================
-- STEP 5: ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE public.isrc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.isp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csrc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csp ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 6: CREATE RLS POLICIES FOR ISRC
-- ============================================================================

DROP POLICY IF EXISTS "Admins can see their ISRC members" ON public.isrc;
DROP POLICY IF EXISTS "ISRC can see their own profile" ON public.isrc;
DROP POLICY IF EXISTS "Anyone can query ISRC by email" ON public.isrc;

CREATE POLICY "Admins can see their ISRC members"
ON public.isrc FOR SELECT
USING (admin_id = auth.uid());

CREATE POLICY "ISRC can see their own profile"
ON public.isrc FOR SELECT
USING (id = auth.uid()::text::uuid);

CREATE POLICY "Anyone can query ISRC by email"
ON public.isrc FOR SELECT
USING (true);

-- ============================================================================
-- STEP 7: CREATE RLS POLICIES FOR ISP
-- ============================================================================

DROP POLICY IF EXISTS "Admins can see their ISP members" ON public.isp;
DROP POLICY IF EXISTS "ISP can see their own profile" ON public.isp;
DROP POLICY IF EXISTS "Anyone can query ISP by email" ON public.isp;

CREATE POLICY "Admins can see their ISP members"
ON public.isp FOR SELECT
USING (admin_id = auth.uid());

CREATE POLICY "ISP can see their own profile"
ON public.isp FOR SELECT
USING (id = auth.uid()::text::uuid);

CREATE POLICY "Anyone can query ISP by email"
ON public.isp FOR SELECT
USING (true);

-- ============================================================================
-- STEP 8: CREATE RLS POLICIES FOR CSRC
-- ============================================================================

DROP POLICY IF EXISTS "Admins can see their CSRC members" ON public.csrc;
DROP POLICY IF EXISTS "CSRC can see their own profile" ON public.csrc;
DROP POLICY IF EXISTS "Anyone can query CSRC by email" ON public.csrc;

CREATE POLICY "Admins can see their CSRC members"
ON public.csrc FOR SELECT
USING (admin_id = auth.uid());

CREATE POLICY "CSRC can see their own profile"
ON public.csrc FOR SELECT
USING (id = auth.uid()::text::uuid);

CREATE POLICY "Anyone can query CSRC by email"
ON public.csrc FOR SELECT
USING (true);

-- ============================================================================
-- STEP 9: CREATE RLS POLICIES FOR CSP
-- ============================================================================

DROP POLICY IF EXISTS "Admins can see their CSP members" ON public.csp;
DROP POLICY IF EXISTS "CSP can see their own profile" ON public.csp;
DROP POLICY IF EXISTS "Anyone can query CSP by email" ON public.csp;

CREATE POLICY "Admins can see their CSP members"
ON public.csp FOR SELECT
USING (admin_id = auth.uid());

CREATE POLICY "CSP can see their own profile"
ON public.csp FOR SELECT
USING (id = auth.uid()::text::uuid);

CREATE POLICY "Anyone can query CSP by email"
ON public.csp FOR SELECT
USING (true);

-- ============================================================================
-- STEP 10: INSERT SAMPLE DATA - 6 USERS OF EACH ROLE PER ADMIN
-- ============================================================================

-- ISRC MEMBERS (6 per admin, 36 total)
INSERT INTO public.isrc (name, email, password, admin_id, campus, status)
SELECT 
  'ISRC Member ' || number || ' - Campus 1' as name,
  'isrc_campus1_' || number || '@sgld.com' as email,
  '123456789' as password,
  (SELECT id FROM public.users WHERE email = 'admin@sgld.com') as admin_id,
  'Campus 1' as campus,
  'active' as status
FROM generate_series(1, 6) as number
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.isrc (name, email, password, admin_id, campus, status)
SELECT 
  'ISRC Member ' || number || ' - Campus 2' as name,
  'isrc_campus2_' || number || '@sgld.com' as email,
  '123456789' as password,
  (SELECT id FROM public.users WHERE email = 'admin1@sgld.com') as admin_id,
  'Campus 2' as campus,
  'active' as status
FROM generate_series(1, 6) as number
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.isrc (name, email, password, admin_id, campus, status)
SELECT 
  'ISRC Member ' || number || ' - Campus 3' as name,
  'isrc_campus3_' || number || '@sgld.com' as email,
  '123456789' as password,
  (SELECT id FROM public.users WHERE email = 'admin3@sgld.com') as admin_id,
  'Campus 3' as campus,
  'active' as status
FROM generate_series(1, 6) as number
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.isrc (name, email, password, admin_id, campus, status)
SELECT 
  'ISRC Member ' || number || ' - Campus 4' as name,
  'isrc_campus4_' || number || '@sgld.com' as email,
  '123456789' as password,
  (SELECT id FROM public.users WHERE email = 'admin4@sgld.com') as admin_id,
  'Campus 4' as campus,
  'active' as status
FROM generate_series(1, 6) as number
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.isrc (name, email, password, admin_id, campus, status)
SELECT 
  'ISRC Member ' || number || ' - Campus 5' as name,
  'isrc_campus5_' || number || '@sgld.com' as email,
  '123456789' as password,
  (SELECT id FROM public.users WHERE email = 'admin5@sgld.com') as admin_id,
  'Campus 5' as campus,
  'active' as status
FROM generate_series(1, 6) as number
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.isrc (name, email, password, admin_id, campus, status)
SELECT 
  'ISRC Member ' || number || ' - Campus 6' as name,
  'isrc_campus6_' || number || '@sgld.com' as email,
  '123456789' as password,
  (SELECT id FROM public.users WHERE email = 'admin6@sgld.com') as admin_id,
  'Campus 6' as campus,
  'active' as status
FROM generate_series(1, 6) as number
ON CONFLICT (email) DO NOTHING;

-- ISP MEMBERS (6 per admin, 36 total)
INSERT INTO public.isp (name, email, password, admin_id, campus, status)
SELECT 
  'ISP Member ' || number || ' - Campus 1' as name,
  'isp_campus1_' || number || '@sgld.com' as email,
  '123456789' as password,
  (SELECT id FROM public.users WHERE email = 'admin@sgld.com') as admin_id,
  'Campus 1' as campus,
  'active' as status
FROM generate_series(1, 6) as number
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.isp (name, email, password, admin_id, campus, status)
SELECT 
  'ISP Member ' || number || ' - Campus 2' as name,
  'isp_campus2_' || number || '@sgld.com' as email,
  '123456789' as password,
  (SELECT id FROM public.users WHERE email = 'admin1@sgld.com') as admin_id,
  'Campus 2' as campus,
  'active' as status
FROM generate_series(1, 6) as number
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.isp (name, email, password, admin_id, campus, status)
SELECT 
  'ISP Member ' || number || ' - Campus 3' as name,
  'isp_campus3_' || number || '@sgld.com' as email,
  '123456789' as password,
  (SELECT id FROM public.users WHERE email = 'admin3@sgld.com') as admin_id,
  'Campus 3' as campus,
  'active' as status
FROM generate_series(1, 6) as number
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.isp (name, email, password, admin_id, campus, status)
SELECT 
  'ISP Member ' || number || ' - Campus 4' as name,
  'isp_campus4_' || number || '@sgld.com' as email,
  '123456789' as password,
  (SELECT id FROM public.users WHERE email = 'admin4@sgld.com') as admin_id,
  'Campus 4' as campus,
  'active' as status
FROM generate_series(1, 6) as number
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.isp (name, email, password, admin_id, campus, status)
SELECT 
  'ISP Member ' || number || ' - Campus 5' as name,
  'isp_campus5_' || number || '@sgld.com' as email,
  '123456789' as password,
  (SELECT id FROM public.users WHERE email = 'admin5@sgld.com') as admin_id,
  'Campus 5' as campus,
  'active' as status
FROM generate_series(1, 6) as number
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.isp (name, email, password, admin_id, campus, status)
SELECT 
  'ISP Member ' || number || ' - Campus 6' as name,
  'isp_campus6_' || number || '@sgld.com' as email,
  '123456789' as password,
  (SELECT id FROM public.users WHERE email = 'admin6@sgld.com') as admin_id,
  'Campus 6' as campus,
  'active' as status
FROM generate_series(1, 6) as number
ON CONFLICT (email) DO NOTHING;

-- CSRC MEMBERS (6 per admin, 36 total)
INSERT INTO public.csrc (name, email, password, admin_id, campus, status)
SELECT 
  'CSRC Member ' || number || ' - Campus 1' as name,
  'csrc_campus1_' || number || '@sgld.com' as email,
  '123456789' as password,
  (SELECT id FROM public.users WHERE email = 'admin@sgld.com') as admin_id,
  'Campus 1' as campus,
  'active' as status
FROM generate_series(1, 6) as number
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.csrc (name, email, password, admin_id, campus, status)
SELECT 
  'CSRC Member ' || number || ' - Campus 2' as name,
  'csrc_campus2_' || number || '@sgld.com' as email,
  '123456789' as password,
  (SELECT id FROM public.users WHERE email = 'admin1@sgld.com') as admin_id,
  'Campus 2' as campus,
  'active' as status
FROM generate_series(1, 6) as number
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.csrc (name, email, password, admin_id, campus, status)
SELECT 
  'CSRC Member ' || number || ' - Campus 3' as name,
  'csrc_campus3_' || number || '@sgld.com' as email,
  '123456789' as password,
  (SELECT id FROM public.users WHERE email = 'admin3@sgld.com') as admin_id,
  'Campus 3' as campus,
  'active' as status
FROM generate_series(1, 6) as number
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.csrc (name, email, password, admin_id, campus, status)
SELECT 
  'CSRC Member ' || number || ' - Campus 4' as name,
  'csrc_campus4_' || number || '@sgld.com' as email,
  '123456789' as password,
  (SELECT id FROM public.users WHERE email = 'admin4@sgld.com') as admin_id,
  'Campus 4' as campus,
  'active' as status
FROM generate_series(1, 6) as number
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.csrc (name, email, password, admin_id, campus, status)
SELECT 
  'CSRC Member ' || number || ' - Campus 5' as name,
  'csrc_campus5_' || number || '@sgld.com' as email,
  '123456789' as password,
  (SELECT id FROM public.users WHERE email = 'admin5@sgld.com') as admin_id,
  'Campus 5' as campus,
  'active' as status
FROM generate_series(1, 6) as number
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.csrc (name, email, password, admin_id, campus, status)
SELECT 
  'CSRC Member ' || number || ' - Campus 6' as name,
  'csrc_campus6_' || number || '@sgld.com' as email,
  '123456789' as password,
  (SELECT id FROM public.users WHERE email = 'admin6@sgld.com') as admin_id,
  'Campus 6' as campus,
  'active' as status
FROM generate_series(1, 6) as number
ON CONFLICT (email) DO NOTHING;

-- CSP MEMBERS (6 per admin, 36 total)
INSERT INTO public.csp (name, email, password, admin_id, campus, status)
SELECT 
  'CSP Member ' || number || ' - Campus 1' as name,
  'csp_campus1_' || number || '@sgld.com' as email,
  '123456789' as password,
  (SELECT id FROM public.users WHERE email = 'admin@sgld.com') as admin_id,
  'Campus 1' as campus,
  'active' as status
FROM generate_series(1, 6) as number
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.csp (name, email, password, admin_id, campus, status)
SELECT 
  'CSP Member ' || number || ' - Campus 2' as name,
  'csp_campus2_' || number || '@sgld.com' as email,
  '123456789' as password,
  (SELECT id FROM public.users WHERE email = 'admin1@sgld.com') as admin_id,
  'Campus 2' as campus,
  'active' as status
FROM generate_series(1, 6) as number
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.csp (name, email, password, admin_id, campus, status)
SELECT 
  'CSP Member ' || number || ' - Campus 3' as name,
  'csp_campus3_' || number || '@sgld.com' as email,
  '123456789' as password,
  (SELECT id FROM public.users WHERE email = 'admin3@sgld.com') as admin_id,
  'Campus 3' as campus,
  'active' as status
FROM generate_series(1, 6) as number
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.csp (name, email, password, admin_id, campus, status)
SELECT 
  'CSP Member ' || number || ' - Campus 4' as name,
  'csp_campus4_' || number || '@sgld.com' as email,
  '123456789' as password,
  (SELECT id FROM public.users WHERE email = 'admin4@sgld.com') as admin_id,
  'Campus 4' as campus,
  'active' as status
FROM generate_series(1, 6) as number
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.csp (name, email, password, admin_id, campus, status)
SELECT 
  'CSP Member ' || number || ' - Campus 5' as name,
  'csp_campus5_' || number || '@sgld.com' as email,
  '123456789' as password,
  (SELECT id FROM public.users WHERE email = 'admin5@sgld.com') as admin_id,
  'Campus 5' as campus,
  'active' as status
FROM generate_series(1, 6) as number
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.csp (name, email, password, admin_id, campus, status)
SELECT 
  'CSP Member ' || number || ' - Campus 6' as name,
  'csp_campus6_' || number || '@sgld.com' as email,
  '123456789' as password,
  (SELECT id FROM public.users WHERE email = 'admin6@sgld.com') as admin_id,
  'Campus 6' as campus,
  'active' as status
FROM generate_series(1, 6) as number
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- STEP 11: VERIFICATION QUERIES
-- ============================================================================

-- Count all institutional members by type
SELECT 
  'ISRC' as role, COUNT(*) as total_count FROM public.isrc
UNION
SELECT 
  'ISP' as role, COUNT(*) as total_count FROM public.isp
UNION
SELECT 
  'CSRC' as role, COUNT(*) as total_count FROM public.csrc
UNION
SELECT 
  'CSP' as role, COUNT(*) as total_count FROM public.csp;

-- Show sample data
SELECT * FROM public.isrc LIMIT 5;
SELECT * FROM public.isp LIMIT 5;
SELECT * FROM public.csrc LIMIT 5;
SELECT * FROM public.csp LIMIT 5;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- ✅ Created 4 new institutional structure tables:
--    - isrc (Institutional Representative Council)
--    - isp (Institutional Student Parliament)
--    - csrc (Campus SRC)
--    - csp (Campus Student Parliament)
--
-- ✅ Inserted 144 sample users total:
--    - 36 ISRC members (6 per admin)
--    - 36 ISP members (6 per admin)
--    - 36 CSRC members (6 per admin)
--    - 36 CSP members (6 per admin)
--
-- ✅ All users have password: 123456789
-- ✅ All users linked to their respective admin
-- ✅ All users assigned to their campus
--
-- NEXT: Create dashboard components for each role
-- ============================================================================
