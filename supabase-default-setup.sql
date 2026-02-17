-- Default Folders and Tags Setup
-- Run this after the main schema to create starter folders and tags

-- Note: Replace 'YOUR_USER_ID' with your actual user ID from auth.users table
-- You can get it by running: SELECT id FROM auth.users WHERE email = 'your@email.com';

-- Example default folders (update user_id after getting it)
-- INSERT INTO folders (user_id, name, description, color, icon) VALUES
-- ('YOUR_USER_ID', 'Journal', 'Personal reflections and thoughts', '#6366f1', '📔'),
-- ('YOUR_USER_ID', 'Curriculum', 'Learning and educational content', '#8b5cf6', '📚'),
-- ('YOUR_USER_ID', 'Work', 'Professional development and work-related', '#ec4899', '💼'),
-- ('YOUR_USER_ID', 'Reading List', 'Books and long-form articles to read', '#f59e0b', '📖'),
-- ('YOUR_USER_ID', 'Inspiration', 'Creative ideas and inspiration', '#10b981', '✨'),
-- ('YOUR_USER_ID', 'Research', 'In-depth research topics', '#06b6d4', '🔬'),
-- ('YOUR_USER_ID', 'Quick Reads', 'Short articles and quick content', '#ef4444', '⚡'),
-- ('YOUR_USER_ID', 'Watch Later', 'Videos and visual content', '#f97316', '🎥');

-- Example default tags (update user_id after getting it)
-- INSERT INTO tags (user_id, name, color) VALUES
-- ('YOUR_USER_ID', 'productivity', '#6366f1'),
-- ('YOUR_USER_ID', 'learning', '#8b5cf6'),
-- ('YOUR_USER_ID', 'coding', '#ec4899'),
-- ('YOUR_USER_ID', 'design', '#f59e0b'),
-- ('YOUR_USER_ID', 'business', '#10b981'),
-- ('YOUR_USER_ID', 'ai', '#06b6d4'),
-- ('YOUR_USER_ID', 'tutorial', '#ef4444'),
-- ('YOUR_USER_ID', 'deep dive', '#f97316'),
-- ('YOUR_USER_ID', 'must read', '#84cc16'),
-- ('YOUR_USER_ID', 'reference', '#14b8a6');

-- Function to automatically create default folders for new users
CREATE OR REPLACE FUNCTION create_default_folders_for_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default folders for the new user
  INSERT INTO folders (user_id, name, description, color, icon) VALUES
  (NEW.id, 'Journal', 'Personal reflections and thoughts', '#6366f1', '📔'),
  (NEW.id, 'Curriculum', 'Learning and educational content', '#8b5cf6', '📚'),
  (NEW.id, 'Work', 'Professional development', '#ec4899', '💼'),
  (NEW.id, 'Reading List', 'Books and long-form articles', '#f59e0b', '📖'),
  (NEW.id, 'Watch Later', 'Videos and visual content', '#f97316', '🎥');
  
  -- Create default tags for the new user
  INSERT INTO tags (user_id, name, color) VALUES
  (NEW.id, 'productivity', '#6366f1'),
  (NEW.id, 'learning', '#8b5cf6'),
  (NEW.id, 'coding', '#ec4899'),
  (NEW.id, 'must read', '#84cc16');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default folders/tags when a new user signs up
CREATE TRIGGER on_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_folders_for_user();

-- If you want to add default folders/tags to existing users, run:
-- SELECT create_default_folders_for_user() FROM auth.users;
