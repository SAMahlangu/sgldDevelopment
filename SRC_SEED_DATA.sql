-- SRC Seed Data - Run this AFTER the initial SRC_SETUP.sql has been executed

-- Step 1: Check what admins you have and get their IDs
-- Run this query first and copy the IDs:
-- SELECT id, email, name, role FROM users WHERE role = 'admin';

-- Step 2: Assign campuses to existing admins
UPDATE users 
SET campus = 'Campus 1' 
WHERE email = 'admin@sgld.com';

UPDATE users 
SET campus = 'Campus 2' 
WHERE email = 'admin1@sgld.com';

-- Step 3: Verify campus assignments
SELECT id, email, campus FROM users WHERE role = 'admin';

-- Step 4: Create 6 SRC members
-- IMPORTANT: Replace the UUID placeholders below with the actual admin IDs from Step 1
-- Format: Replace 'PUT_ADMIN_ID_HERE' with actual UUID (e.g., 'a1b2c3d4-e5f6-7890-abcd-ef1234567890')

INSERT INTO srcs (name, email, password, admin_id, campus) VALUES
-- Campus 1 SRCs (assigned to admin@sgld.com)
('John Doe', 'src1@sgld.com', 'src1pass', 'PUT_ADMIN_ID_HERE', 'Campus 1'),
('Jane Smith', 'src2@sgld.com', 'src2pass', 'PUT_ADMIN_ID_HERE', 'Campus 1'),
('Mike Johnson', 'src3@sgld.com', 'src3pass', 'PUT_ADMIN_ID_HERE', 'Campus 1'),

-- Campus 2 SRCs (assigned to admin1@sgld.com)
('Sarah Williams', 'src4@sgld.com', 'src4pass', 'PUT_ADMIN1_ID_HERE', 'Campus 2'),
('Tom Brown', 'src5@sgld.com', 'src5pass', 'PUT_ADMIN1_ID_HERE', 'Campus 2'),
('Lisa Garcia', 'src6@sgld.com', 'src6pass', 'PUT_ADMIN1_ID_HERE', 'Campus 2');

-- Step 5: Verify SRCs were created
SELECT id, name, email, admin_id, campus, status FROM srcs ORDER BY campus, created_at;
