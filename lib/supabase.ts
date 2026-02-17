import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

export type ContentType = 'article' | 'video' | 'book' | 'podcast' | 'tweet' | 'other'
export type ContentStatus = 'to_read' | 'in_progress' | 'completed' | 'archived'

export interface Folder {
  id: string
  user_id: string
  name: string
  description?: string
  color: string
  icon?: string
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface ContentItem {
  id: string
  user_id: string
  title: string
  url?: string
  content_type: ContentType
  status: ContentStatus
  description?: string
  author?: string
  thumbnail_url?: string
  domain?: string
  estimated_time?: number
  folder_id?: string
  progress_percentage: number
  started_at?: string
  completed_at?: string
  notes?: string
  rating?: number
  created_at: string
  updated_at: string
  added_via: string
}

export interface ContentWithDetails extends ContentItem {
  folder_name?: string
  folder_color?: string
  tag_names?: string[]
  tag_ids?: string[]
}

// Helper functions
export async function fetchMetadata(url: string) {
  try {
    const response = await fetch('/api/metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
    return await response.json()
  } catch (error) {
    console.error('Error fetching metadata:', error)
    return null
  }
}

export async function createContentItem(data: Partial<ContentItem>) {
  // For anonymous users, set user_id to null
  const dataWithUser = {
    ...data,
    user_id: null, // Anonymous user
  }
  
  const { data: content, error } = await supabase
    .from('content_items')
    .insert([dataWithUser])
    .select()
    .single()
  
  if (error) throw error
  return content
}

export async function updateContentItem(id: string, data: Partial<ContentItem>) {
  const { data: content, error } = await supabase
    .from('content_items')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return content
}

export async function deleteContentItem(id: string) {
  const { error } = await supabase
    .from('content_items')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function addTagsToContent(contentId: string, tagIds: string[]) {
  const relations = tagIds.map(tagId => ({
    content_id: contentId,
    tag_id: tagId,
  }))
  
  const { error } = await supabase
    .from('content_tags')
    .insert(relations)
  
  if (error) throw error
}

export async function removeTagFromContent(contentId: string, tagId: string) {
  const { error } = await supabase
    .from('content_tags')
    .delete()
    .eq('content_id', contentId)
    .eq('tag_id', tagId)
  
  if (error) throw error
}

// Helper functions for creating folders and tags (for anonymous users)
export async function createFolder(data: Partial<Folder>) {
  const dataWithUser = {
    ...data,
    user_id: null, // Anonymous user
  }
  
  const { data: folder, error } = await supabase
    .from('folders')
    .insert([dataWithUser])
    .select()
    .single()
  
  if (error) throw error
  return folder
}

export async function createTag(data: Partial<Tag>) {
  const dataWithUser = {
    ...data,
    user_id: null, // Anonymous user
  }
  
  const { data: tag, error } = await supabase
    .from('tags')
    .insert([dataWithUser])
    .select()
    .single()
  
  if (error) throw error
  return tag
}

export async function deleteTag(tagId: string) {
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', tagId)
  
  if (error) throw error
}

export async function deleteFolder(folderId: string) {
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', folderId)
  
  if (error) throw error
}

export async function updateFolder(folderId: string, data: Partial<Folder>) {
  const { data: folder, error } = await supabase
    .from('folders')
    .update(data)
    .eq('id', folderId)
    .select()
    .single()
  
  if (error) throw error
  return folder
}

export async function updateTag(tagId: string, data: Partial<Tag>) {
  const { data: tag, error } = await supabase
    .from('tags')
    .update(data)
    .eq('id', tagId)
    .select()
    .single()
  
  if (error) throw error
  return tag
}
