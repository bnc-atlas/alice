-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Content Types Enum
CREATE TYPE content_type AS ENUM ('article', 'video', 'book', 'podcast', 'tweet', 'other');

-- Status Enum
CREATE TYPE content_status AS ENUM ('to_read', 'in_progress', 'completed', 'archived');

-- Folders/Collections table
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#8b5cf6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Content items table
CREATE TABLE content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT,
  content_type content_type NOT NULL,
  status content_status DEFAULT 'to_read',
  
  -- Metadata
  description TEXT,
  author TEXT,
  thumbnail_url TEXT,
  domain TEXT,
  estimated_time INTEGER, -- in minutes
  
  -- Organization
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  
  -- Progress tracking
  progress_percentage INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Notes and highlights
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  added_via TEXT DEFAULT 'web' -- 'web', 'sms', 'email', 'extension'
);

-- Content-Tags junction table
CREATE TABLE content_tags (
  content_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (content_id, tag_id)
);

-- SMS/Text message log (for tracking content added via text)
CREATE TABLE sms_inbox (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  message_body TEXT NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  content_id UUID REFERENCES content_items(id) ON DELETE SET NULL,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Telegram message log (for tracking content added via Telegram)
CREATE TABLE telegram_inbox (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_chat_id TEXT NOT NULL,
  message_body TEXT NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  content_id UUID REFERENCES content_items(id) ON DELETE SET NULL,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Reading sessions (for tracking reading time and patterns)
CREATE TABLE reading_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  duration_seconds INTEGER NOT NULL,
  session_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_content_items_user_id ON content_items(user_id);
CREATE INDEX idx_content_items_status ON content_items(status);
CREATE INDEX idx_content_items_folder_id ON content_items(folder_id);
CREATE INDEX idx_content_items_created_at ON content_items(created_at DESC);
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_content_tags_content_id ON content_tags(content_id);
CREATE INDEX idx_content_tags_tag_id ON content_tags(tag_id);
CREATE INDEX idx_sms_inbox_user_id ON sms_inbox(user_id);
CREATE INDEX idx_telegram_inbox_user_id ON telegram_inbox(user_id);
CREATE INDEX idx_reading_sessions_user_id ON reading_sessions(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_inbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_inbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;

-- Folders policies
CREATE POLICY "Users can view their own folders" ON folders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own folders" ON folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own folders" ON folders
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own folders" ON folders
  FOR DELETE USING (auth.uid() = user_id);

-- Tags policies
CREATE POLICY "Users can view their own tags" ON tags
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tags" ON tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tags" ON tags
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tags" ON tags
  FOR DELETE USING (auth.uid() = user_id);

-- Content items policies
CREATE POLICY "Users can view their own content" ON content_items
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own content" ON content_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own content" ON content_items
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own content" ON content_items
  FOR DELETE USING (auth.uid() = user_id);

-- Content tags policies
CREATE POLICY "Users can view their content tags" ON content_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM content_items
      WHERE id = content_tags.content_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create content tags" ON content_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM content_items
      WHERE id = content_tags.content_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete content tags" ON content_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM content_items
      WHERE id = content_tags.content_id AND user_id = auth.uid()
    )
  );

-- SMS inbox policies
CREATE POLICY "Users can view their own SMS messages" ON sms_inbox
  FOR SELECT USING (auth.uid() = user_id);

-- Telegram inbox policies
CREATE POLICY "Users can view their own Telegram messages" ON telegram_inbox
  FOR SELECT USING (auth.uid() = user_id);

-- Reading sessions policies
CREATE POLICY "Users can view their own sessions" ON reading_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sessions" ON reading_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_items_updated_at BEFORE UPDATE ON content_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to extract domain from URL
CREATE OR REPLACE FUNCTION extract_domain(url TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN SUBSTRING(url FROM 'https?://([^/]+)');
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- View for content with tag and folder information
CREATE VIEW content_with_details AS
SELECT 
  ci.*,
  f.name as folder_name,
  f.color as folder_color,
  ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tag_names,
  ARRAY_AGG(DISTINCT t.id) FILTER (WHERE t.id IS NOT NULL) as tag_ids
FROM content_items ci
LEFT JOIN folders f ON ci.folder_id = f.id
LEFT JOIN content_tags ct ON ci.id = ct.content_id
LEFT JOIN tags t ON ct.tag_id = t.id
GROUP BY ci.id, f.name, f.color;
