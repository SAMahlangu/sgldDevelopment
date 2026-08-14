-- SRC Communication System Setup
-- Includes messaging, document management, and notifications

-- Step 1: Create messages table for SRC-Admin communication
CREATE TABLE IF NOT EXISTS src_admin_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  src_id UUID NOT NULL REFERENCES srcs(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL, -- Can be src_id or admin_id
  sender_type VARCHAR(10) NOT NULL, -- 'src' or 'admin'
  message TEXT NOT NULL,
  read_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_src_admin_messages_src_id ON src_admin_messages(src_id);
CREATE INDEX IF NOT EXISTS idx_src_admin_messages_admin_id ON src_admin_messages(admin_id);
CREATE INDEX IF NOT EXISTS idx_src_admin_messages_sender_id ON src_admin_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_src_admin_messages_created_at ON src_admin_messages(created_at DESC);

-- Step 2: Create documents table for tracking uploads
CREATE TABLE IF NOT EXISTS src_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  src_id UUID NOT NULL REFERENCES srcs(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL, -- Path in storage bucket
  file_size INTEGER,
  file_type VARCHAR(50), -- MIME type
  uploaded_by_id UUID NOT NULL, -- src_id or admin_id
  uploaded_by_type VARCHAR(10) NOT NULL, -- 'src' or 'admin'
  description TEXT,
  status VARCHAR(50) DEFAULT 'active', -- active, archived, deleted
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_src_documents_src_id ON src_documents(src_id);
CREATE INDEX IF NOT EXISTS idx_src_documents_admin_id ON src_documents(admin_id);
CREATE INDEX IF NOT EXISTS idx_src_documents_created_at ON src_documents(created_at DESC);

-- Step 3: Enable RLS on both tables
ALTER TABLE src_admin_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE src_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for src_admin_messages
-- SRCs can see messages with their assigned admin
CREATE POLICY "SRCs can see their messages"
ON src_admin_messages FOR SELECT
USING (
  src_id IN (
    SELECT id FROM srcs WHERE id = auth.uid()::text::uuid
  )
);

-- Admins can see messages from their assigned SRCs
CREATE POLICY "Admins can see their SRC messages"
ON src_admin_messages FOR SELECT
USING (
  admin_id = auth.uid()
);

-- Both can insert messages - Allow authenticated users
CREATE POLICY "Anyone authenticated can send messages"
ON src_admin_messages FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for src_documents
-- SRCs can see documents from their admin
CREATE POLICY "SRCs can see their documents"
ON src_documents FOR SELECT
USING (
  src_id IN (
    SELECT id FROM srcs WHERE id = auth.uid()::text::uuid
  )
);

-- Admins can see documents from their SRCs
CREATE POLICY "Admins can see their SRC documents"
ON src_documents FOR SELECT
USING (
  admin_id = auth.uid()
);

-- Both can upload documents - Allow authenticated users
CREATE POLICY "Anyone authenticated can upload documents"
ON src_documents FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Both can update documents - Allow authenticated users
CREATE POLICY "Anyone authenticated can update documents"
ON src_documents FOR UPDATE
WITH CHECK (auth.role() = 'authenticated');

-- Both can delete documents - Allow authenticated users
CREATE POLICY "Anyone authenticated can delete documents"
ON src_documents FOR DELETE
USING (auth.role() = 'authenticated');

-- Step 4: Create storage bucket for documents (if not exists, do manually in Supabase)
-- Bucket name: src-documents
-- Set the following RLS policies in Supabase Storage:

-- 1. Public Read - Allow anyone to download (optional)
-- Storage path: src-documents (all objects)
-- Allow: SELECT
-- USING: true

-- 2. Authenticated Upload - Allow authenticated users to upload
-- Storage path: src-documents (all objects)  
-- Allow: INSERT
-- USING: auth.role() = 'authenticated'

-- 3. User Delete - Allow uploads to delete their own files
-- Storage path: src-documents (all objects)
-- Allow: DELETE
-- USING: (storage.foldername(name))[1] = auth.uid()::text OR true -- Allow all for now

-- 4. User Update
-- Storage path: src-documents (all objects)
-- Allow: UPDATE
-- USING: auth.role() = 'authenticated'
