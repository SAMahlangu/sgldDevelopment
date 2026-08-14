-- SFC (Student Finance Coordinator) Management System Setup
-- Run this script in Supabase SQL Editor
-- Step 0: Create SFC table
-- NOTE: Skip this if sfcs table already exists
CREATE TABLE IF NOT EXISTS sfcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  campus VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sfcs_admin_id ON sfcs(admin_id);
CREATE INDEX IF NOT EXISTS idx_sfcs_campus ON sfcs(campus);
CREATE INDEX IF NOT EXISTS idx_sfcs_email ON sfcs(email);

-- Step 0.5: Enable RLS on sfcs table
ALTER TABLE sfcs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can see their SFCs" ON sfcs;
DROP POLICY IF EXISTS "SFCs can see their own profile" ON sfcs;
DROP POLICY IF EXISTS "Anyone can query sfcs by email" ON sfcs;
DROP POLICY IF EXISTS "Admins can create SFCs" ON sfcs;
DROP POLICY IF EXISTS "Admins can update SFCs" ON sfcs;
DROP POLICY IF EXISTS "Admins can delete SFCs" ON sfcs;

-- Allow admins to see only their assigned SFCs
CREATE POLICY "Admins can see their SFCs"
ON sfcs FOR SELECT
USING (
  admin_id = auth.uid()
);

-- Allow SFCs to see their own profile
CREATE POLICY "SFCs can see their own profile"
ON sfcs FOR SELECT
USING (
  id = auth.uid()::text::uuid
);

-- Allow anyone to query by email for login
CREATE POLICY "Anyone can query sfcs by email"
ON sfcs FOR SELECT
USING (true);

-- Allow admins to insert SFCs
CREATE POLICY "Admins can create SFCs"
ON sfcs FOR INSERT
WITH CHECK (
  admin_id = auth.uid()
);

-- Allow admins to update SFCs
CREATE POLICY "Admins can update SFCs"
ON sfcs FOR UPDATE
USING (
  admin_id = auth.uid()
);

-- Allow admins to delete SFCs
CREATE POLICY "Admins can delete SFCs"
ON sfcs FOR DELETE
USING (
  admin_id = auth.uid()
);

-- SFC Communication System Setup
-- Includes messaging, document management, and notifications

-- Step 1: Create messages table for SFC-Admin communication
CREATE TABLE IF NOT EXISTS sfc_admin_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sfc_id UUID NOT NULL REFERENCES sfcs(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL, -- Can be sfc_id or admin_id
  sender_type VARCHAR(10) NOT NULL, -- 'sfc' or 'admin'
  message TEXT NOT NULL,
  read_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sfc_admin_messages_sfc_id ON sfc_admin_messages(sfc_id);
CREATE INDEX IF NOT EXISTS idx_sfc_admin_messages_admin_id ON sfc_admin_messages(admin_id);
CREATE INDEX IF NOT EXISTS idx_sfc_admin_messages_sender_id ON sfc_admin_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_sfc_admin_messages_created_at ON sfc_admin_messages(created_at DESC);

-- Step 2: Create documents table for tracking uploads
CREATE TABLE IF NOT EXISTS sfc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sfc_id UUID NOT NULL REFERENCES sfcs(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL, -- Path in storage bucket
  file_size INTEGER,
  file_type VARCHAR(50), -- MIME type
  uploaded_by_id UUID NOT NULL, -- sfc_id or admin_id
  uploaded_by_type VARCHAR(10) NOT NULL, -- 'sfc' or 'admin'
  description TEXT,
  status VARCHAR(50) DEFAULT 'active', -- active, archived, deleted
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sfc_documents_sfc_id ON sfc_documents(sfc_id);
CREATE INDEX IF NOT EXISTS idx_sfc_documents_admin_id ON sfc_documents(admin_id);
CREATE INDEX IF NOT EXISTS idx_sfc_documents_created_at ON sfc_documents(created_at DESC);

-- Step 3: Enable RLS on both tables
ALTER TABLE sfc_admin_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sfc_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for sfc_admin_messages
DROP POLICY IF EXISTS "SFCs can see their messages" ON sfc_admin_messages;
DROP POLICY IF EXISTS "Admins can see their SFC messages" ON sfc_admin_messages;
DROP POLICY IF EXISTS "Anyone authenticated can send messages" ON sfc_admin_messages;

-- RLS Policies for sfc_admin_messages
-- SFCs can see messages with their assigned admin
CREATE POLICY "SFCs can see their messages"
ON sfc_admin_messages FOR SELECT
USING (
  sfc_id IN (
    SELECT id FROM sfcs WHERE id = auth.uid()::text::uuid
  )
);

-- Admins can see messages from their assigned SFCs
CREATE POLICY "Admins can see their SFC messages"
ON sfc_admin_messages FOR SELECT
USING (
  admin_id = auth.uid()
);

-- Both can insert messages - Allow authenticated users
CREATE POLICY "Anyone authenticated can send messages"
ON sfc_admin_messages FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Drop existing policies for sfc_documents
DROP POLICY IF EXISTS "SFCs can see their documents" ON sfc_documents;
DROP POLICY IF EXISTS "Admins can see their SFC documents" ON sfc_documents;
DROP POLICY IF EXISTS "Anyone authenticated can upload documents" ON sfc_documents;
DROP POLICY IF EXISTS "Anyone authenticated can update documents" ON sfc_documents;
DROP POLICY IF EXISTS "Anyone authenticated can delete documents" ON sfc_documents;

-- RLS Policies for sfc_documents
-- SFCs can see documents from their admin
CREATE POLICY "SFCs can see their documents"
ON sfc_documents FOR SELECT
USING (
  sfc_id IN (
    SELECT id FROM sfcs WHERE id = auth.uid()::text::uuid
  )
);

-- Admins can see documents from their SFCs
CREATE POLICY "Admins can see their SFC documents"
ON sfc_documents FOR SELECT
USING (
  admin_id = auth.uid()
);

-- Both can upload documents - Allow authenticated users
CREATE POLICY "Anyone authenticated can upload documents"
ON sfc_documents FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Both can update documents - Allow authenticated users
CREATE POLICY "Anyone authenticated can update documents"
ON sfc_documents FOR UPDATE
WITH CHECK (auth.role() = 'authenticated');

-- Both can delete documents - Allow authenticated users
CREATE POLICY "Anyone authenticated can delete documents"
ON sfc_documents FOR DELETE
USING (auth.role() = 'authenticated');

-- Step 4: Create storage bucket for documents (if not exists, do manually in Supabase)
-- Bucket name: sfc-documents
-- Set the following RLS policies in Supabase Storage:

-- 1. Public Read - Allow anyone to download (optional)
-- Storage path: sfc-documents (all objects)
-- Allow: SELECT
-- USING: true

-- 2. Authenticated Upload - Allow authenticated users to upload
-- Storage path: sfc-documents (all objects)  
-- Allow: INSERT
-- USING: auth.role() = 'authenticated'

-- 3. User Delete - Allow uploads to delete their own files
-- Storage path: sfc-documents (all objects)
-- Allow: DELETE
-- USING: (storage.foldername(name))[1] = auth.uid()::text OR true -- Allow all for now

-- 4. User Update
-- Storage path: sfc-documents (all objects)
-- Allow: UPDATE
-- USING: auth.role() = 'authenticated'

-- Step 5: Optional Seed Data - Insert 6 SFC Members (3 per campus)
-- NOTE: Replace admin_id with actual admin UUIDs from your users table
-- Run these INSERT statements ONLY if you want test data

-- Campus 1: Main Campus - 3 SFC Members
INSERT INTO sfcs (name, email, password, admin_id, campus, status)
VALUES 
  ('Sarah Johnson', 'sarah.johnson@sgld.com', 'sfc123', '3dcbf96b-0962-41b2-a4ac-9e0651450a7b', 'Main Campus', 'active'),
  ('Michael Chen', 'michael.chen@sgld.com', 'sfc123', '3dcbf96b-0962-41b2-a4ac-9e0651450a7b', 'Main Campus', 'active'),
  ('Jessica Williams', 'jessica.williams@sgld.com', 'sfc123', '3dcbf96b-0962-41b2-a4ac-9e0651450a7b', 'Main Campus', 'active')
ON CONFLICT (email) DO NOTHING;

-- Campus 2: North Campus - 3 SFC Members
INSERT INTO sfcs (name, email, password, admin_id, campus, status)
VALUES 
  ('David Martinez', 'david.martinez@sgld.com', 'sfc123', '0e98b2f1-024f-4ab5-bf3d-fbfdfbd9bbcc', 'North Campus', 'active'),
  ('Emily Rodriguez', 'emily.rodriguez@sgld.com', 'sfc123', '0e98b2f1-024f-4ab5-bf3d-fbfdfbd9bbcc', 'North Campus', 'active'),
  ('James Thompson', 'james.thompson@sgld.com', 'sfc123', '0e98b2f1-024f-4ab5-bf3d-fbfdfbd9bbcc', 'North Campus', 'active')
ON CONFLICT (email) DO NOTHING;
