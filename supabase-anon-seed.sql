-- Seed data for anonymous demo mode (no auth required)
-- Run this after you've relaxed schema constraints and RLS policies

-- Insert default folders (user_id = NULL for anonymous mode)
INSERT INTO folders (user_id, name, description, color, icon) VALUES
(NULL, 'Journal', 'Personal reflections and thoughts', '#6366f1', '📔'),
(NULL, 'Curriculum', 'Learning and educational content', '#8b5cf6', '📚'),
(NULL, 'Work', 'Professional development', '#ec4899', '💼'),
(NULL, 'Reading List', 'Books and long-form articles', '#f59e0b', '📖'),
(NULL, 'Watch Later', 'Videos and visual content', '#f97316', '🎥');

-- Insert default tags (user_id = NULL for anonymous mode)
INSERT INTO tags (user_id, name, color) VALUES
(NULL, 'productivity', '#6366f1'),
(NULL, 'learning', '#8b5cf6'),
(NULL, 'coding', '#ec4899'),
(NULL, 'must read', '#84cc16'),
(NULL, 'important', '#ef4444'),
(NULL, 'research', '#3b82f6'),
(NULL, 'tutorial', '#10b981'),
(NULL, 'reference', '#f59e0b');

-- Optional: Insert some sample content items to demonstrate the app
INSERT INTO content_items (
  user_id, 
  title, 
  url, 
  content_type, 
  status, 
  description, 
  author, 
  thumbnail_url, 
  domain, 
  estimated_time, 
  folder_id, 
  progress_percentage,
  added_via
) VALUES 
-- Sample articles
(NULL, 
 'Getting Started with React Hooks', 
 'https://react.dev/learn', 
 'article', 
 'to_read', 
 'A comprehensive guide to React Hooks and how to use them effectively in your applications.', 
 'React Team', 
 'https://react.dev/logo-og.png', 
 'react.dev', 
 15, 
 (SELECT id FROM folders WHERE name = 'Curriculum' LIMIT 1), 
 0, 
 'web'),
(NULL, 
 'The Pragmatic Programmer', 
 'https://pragprog.com/titles/tpp20/the-pragmatic-programmer/', 
 'book', 
 'to_read', 
 'Your journey to mastery. Designed as a series of self-contained sections and filled with classic and fresh anecdotes, thoughtful examples, and interesting analogies.', 
 'David Thomas, Andrew Hunt', 
 'https://images-na.ssl-images-amazon.com/images/I/51ZJEAntn8L._SX331_BO1,204,203,200_.jpg', 
 'pragprog.com', 
 480, 
 (SELECT id FROM folders WHERE name = 'Reading List' LIMIT 1), 
 0, 
 'web'),
-- Sample video
(NULL, 
 'Clean Code - Uncle Bob', 
 'https://www.youtube.com/watch?v=7Embo-KQH6M', 
 'video', 
 'in_progress', 
 'Robert C. Martin (Uncle Bob) presents his talk on Clean Code at the Agile 2008 conference.', 
 'Robert C. Martin', 
 'https://img.youtube.com/vi/7Embo-KQH6M/maxresdefault.jpg', 
 'youtube.com', 
 90, 
 (SELECT id FROM folders WHERE name = 'Watch Later' LIMIT 1), 
 35, 
 'web'),
-- Sample work item
(NULL, 
 'Project Documentation Guidelines', 
 NULL, 
 'article', 
 'completed', 
 'Internal guidelines for maintaining consistent project documentation across all repositories.', 
 'Internal Team', 
 NULL, 
 NULL, 
 25, 
 (SELECT id FROM folders WHERE name = 'Work' LIMIT 1), 
 100, 
 'web');

-- Add tags to the sample content
-- Tag the React article
INSERT INTO content_tags (content_id, tag_id)
SELECT 
  ci.id, 
  t.id
FROM content_items ci, tags t
WHERE ci.title = 'Getting Started with React Hooks' 
  AND t.name IN ('learning', 'coding', 'tutorial');

-- Tag the book
INSERT INTO content_tags (content_id, tag_id)
SELECT 
  ci.id, 
  t.id
FROM content_items ci, tags t
WHERE ci.title = 'The Pragmatic Programmer' 
  AND t.name IN ('must read', 'important', 'learning');

-- Tag the video
INSERT INTO content_tags (content_id, tag_id)
SELECT 
  ci.id, 
  t.id
FROM content_items ci, tags t
WHERE ci.title = 'Clean Code - Uncle Bob' 
  AND t.name IN ('coding', 'tutorial', 'important');

-- Tag the work item
INSERT INTO content_tags (content_id, tag_id)
SELECT 
  ci.id, 
  t.id
FROM content_items ci, tags t
WHERE ci.title = 'Project Documentation Guidelines' 
  AND t.name IN ('work', 'important');

-- Add a journal entry
INSERT INTO content_items (
  user_id, 
  title, 
  content_type, 
  status, 
  description, 
  folder_id, 
  progress_percentage,
  added_via
) VALUES 
(NULL, 
 'Daily Reflection - Learning React Hooks', 
 'article', 
 'completed', 
 'Today I spent time learning about React Hooks. The useState and useEffect hooks are particularly useful for managing component state and side effects. I can see how this will make our code much cleaner than class components.', 
 (SELECT id FROM folders WHERE name = 'Journal' LIMIT 1), 
 100, 
 'web');

-- Tag the journal entry
INSERT INTO content_tags (content_id, tag_id)
SELECT 
  ci.id, 
  t.id
FROM content_items ci, tags t
WHERE ci.title = 'Daily Reflection - Learning React Hooks' 
  AND t.name IN ('learning', 'productivity');

COMMIT;
