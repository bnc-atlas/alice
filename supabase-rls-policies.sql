-- RLS Policies for Second Brain App
-- These policies allow anonymous users to read and write their own data

-- First, enable RLS on all tables (if not already enabled)
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own content" ON content_items;
DROP POLICY IF EXISTS "Users can insert their own content" ON content_items;
DROP POLICY IF EXISTS "Users can update their own content" ON content_items;
DROP POLICY IF EXISTS "Users can delete their own content" ON content_items;

DROP POLICY IF EXISTS "Users can view their own folders" ON folders;
DROP POLICY IF EXISTS "Users can insert their own folders" ON folders;
DROP POLICY IF EXISTS "Users can update their own folders" ON folders;
DROP POLICY IF EXISTS "Users can delete their own folders" ON folders;

DROP POLICY IF EXISTS "Users can view their own tags" ON tags;
DROP POLICY IF EXISTS "Users can insert their own tags" ON tags;
DROP POLICY IF EXISTS "Users can update their own tags" ON tags;
DROP POLICY IF EXISTS "Users can delete their own tags" ON tags;

DROP POLICY IF EXISTS "Users can view their own content tag relations" ON content_tags;
DROP POLICY IF EXISTS "Users can insert their own content tag relations" ON content_tags;
DROP POLICY IF EXISTS "Users can delete their own content tag relations" ON content_tags;

-- Content Items Policies
CREATE POLICY "Users can view their own content" ON content_items
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IS NULL -- Allow anonymous users to read for now
  );

CREATE POLICY "Users can insert their own content" ON content_items
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    (auth.uid() IS NULL AND user_id IS NULL) -- Allow anonymous users to insert
  );

CREATE POLICY "Users can update their own content" ON content_items
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    (auth.uid() IS NULL AND user_id IS NULL) -- Allow anonymous users to update
  );

CREATE POLICY "Users can delete their own content" ON content_items
  FOR DELETE USING (
    auth.uid() = user_id OR 
    (auth.uid() IS NULL AND user_id IS NULL) -- Allow anonymous users to delete
  );

-- Folders Policies
CREATE POLICY "Users can view their own folders" ON folders
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IS NULL -- Allow anonymous users to read
  );

CREATE POLICY "Users can insert their own folders" ON folders
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    (auth.uid() IS NULL AND user_id IS NULL) -- Allow anonymous users to insert
  );

CREATE POLICY "Users can update their own folders" ON folders
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    (auth.uid() IS NULL AND user_id IS NULL) -- Allow anonymous users to update
  );

CREATE POLICY "Users can delete their own folders" ON folders
  FOR DELETE USING (
    auth.uid() = user_id OR 
    (auth.uid() IS NULL AND user_id IS NULL) -- Allow anonymous users to delete
  );

-- Tags Policies
CREATE POLICY "Users can view their own tags" ON tags
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IS NULL -- Allow anonymous users to read
  );

CREATE POLICY "Users can insert their own tags" ON tags
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    (auth.uid() IS NULL AND user_id IS NULL) -- Allow anonymous users to insert
  );

CREATE POLICY "Users can update their own tags" ON tags
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    (auth.uid() IS NULL AND user_id IS NULL) -- Allow anonymous users to update
  );

CREATE POLICY "Users can delete their own tags" ON tags
  FOR DELETE USING (
    auth.uid() = user_id OR 
    (auth.uid() IS NULL AND user_id IS NULL) -- Allow anonymous users to delete
  );

-- Content Tags (junction table) Policies
CREATE POLICY "Users can view their own content tag relations" ON content_tags
  FOR SELECT USING (
    -- Allow if user owns the content item
    EXISTS (
      SELECT 1 FROM content_items 
      WHERE content_items.id = content_tags.content_id 
      AND (content_items.user_id = auth.uid() OR 
           (content_items.user_id IS NULL AND auth.uid() IS NULL))
    )
  );

CREATE POLICY "Users can insert their own content tag relations" ON content_tags
  FOR INSERT WITH CHECK (
    -- Allow if user owns the content item
    EXISTS (
      SELECT 1 FROM content_items 
      WHERE content_items.id = content_tags.content_id 
      AND (content_items.user_id = auth.uid() OR 
           (content_items.user_id IS NULL AND auth.uid() IS NULL))
    )
  );

CREATE POLICY "Users can delete their own content tag relations" ON content_tags
  FOR DELETE USING (
    -- Allow if user owns the content item
    EXISTS (
      SELECT 1 FROM content_items 
      WHERE content_items.id = content_tags.content_id 
      AND (content_items.user_id = auth.uid() OR 
           (content_items.user_id IS NULL AND auth.uid() IS NULL))
    )
  );

-- For the view content_with_details, we need to create a separate policy
-- This might need to be adjusted based on your actual view definition
DROP POLICY IF EXISTS "Users can view content with details" ON content_with_details;
CREATE POLICY "Users can view content with details" ON content_with_details
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IS NULL -- Allow anonymous users to read
  );
