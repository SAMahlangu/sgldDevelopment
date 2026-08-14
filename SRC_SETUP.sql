-- SRC Management System Setup
-- Run this script in Supabase SQL Editor

-- Step 1: Alter users table to add campus field (for admin assignment)
-- NOTE: Skip this if campus column already exists
-- ALTER TABLE users ADD COLUMN campus VARCHAR(50);

-- Step 2: Create SRC table
-- NOTE: Skip this if srcs table already exists
-- CREATE TABLE srcs (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   name VARCHAR(255) NOT NULL,
--   email VARCHAR(255) NOT NULL UNIQUE,
--   password VARCHAR(255),
--   admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--   campus VARCHAR(50) NOT NULL,
--   status VARCHAR(50) DEFAULT 'active',
--   created_at TIMESTAMP DEFAULT NOW(),
--   updated_at TIMESTAMP DEFAULT NOW()
-- );

-- Create indexes for performance
-- CREATE INDEX idx_srcs_admin_id ON srcs(admin_id);
-- CREATE INDEX idx_srcs_campus ON srcs(campus);
-- CREATE INDEX idx_srcs_email ON srcs(email);

-- Step 3: Enable RLS on srcs table
-- ALTER TABLE srcs ENABLE ROW LEVEL SECURITY;

-- Allow admins to see only their assigned SRCs
-- CREATE POLICY "Admins can see their SRCs"
-- ON srcs FOR SELECT
-- USING (admin_id = auth.uid());

-- Allow SRCs to see their own profile
-- CREATE POLICY "SRCs can see their own profile"
-- ON srcs FOR SELECT
-- USING (auth.uid()::text = id::text OR id = auth.uid());

-- Allow admins to create SRCs
-- CREATE POLICY "Admins can create SRCs"
-- ON srcs FOR INSERT
-- WITH CHECK (admin_id = auth.uid());

-- Allow admins to update their SRCs
-- CREATE POLICY "Admins can update their SRCs"
-- ON srcs FOR UPDATE
-- USING (admin_id = auth.uid())
-- WITH CHECK (admin_id = auth.uid());

-- Allow admins to delete their SRCs
-- CREATE POLICY "Admins can delete their SRCs"
-- ON srcs FOR DELETE
-- USING (admin_id = auth.uid());

-- Step 4: Assign campuses to existing admins
UPDATE users 
SET campus = 'Campus 1' 
WHERE email = 'admin@sgld.com';

UPDATE users 
SET campus = 'Campus 2' 
WHERE email = 'admin1@sgld.com';

-- Step 5: Create 6 SRC members (3 per campus, 1 per admin)
INSERT INTO srcs (name, email, password, admin_id, campus) VALUES
-- Campus 1 SRCs (assigned to admin@sgld.com)
('John Doe', 'src1@sgld.com', 'src1pass', '3dcbf96b-0962-41b2-a4ac-9e0651450a7b', 'Campus 1'),
('Jane Smith', 'src2@sgld.com', 'src2pass', '3dcbf96b-0962-41b2-a4ac-9e0651450a7b', 'Campus 1'),
('Mike Johnson', 'src3@sgld.com', 'src3pass', '3dcbf96b-0962-41b2-a4ac-9e0651450a7b', 'Campus 1'),
-- Campus 2 SRCs (assigned to admin1@sgld.com)
('Sarah Williams', 'src4@sgld.com', 'src4pass', '0e98b2f1-024f-4ab5-bf3d-fbfdfbd9bbcc', 'Campus 2'),
('Tom Brown', 'src5@sgld.com', 'src5pass', '0e98b2f1-024f-4ab5-bf3d-fbfdfbd9bbcc', 'Campus 2'),
('Lisa Garcia', 'src6@sgld.com', 'src6pass', '0e98b2f1-024f-4ab5-bf3d-fbfdfbd9bbcc', 'Campus 2');
