'use client'

import { useState, useEffect } from 'react'
import type { ContentWithDetails, Folder, Tag } from '@/lib/supabase'
import { X, Save, ExternalLink } from 'lucide-react'
import { updateContentItem, removeTagFromContent, supabase } from '@/lib/supabase'

interface EditContentDialogProps {
  content: ContentWithDetails | null
  folders: Folder[]
  tags: Tag[]
  onClose: () => void
  onSuccess: () => void
}

export default function EditContentDialog({
  content,
  folders,
  tags,
  onClose,
  onSuccess,
}: EditContentDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<'to_read' | 'in_progress' | 'completed' | 'archived'>('to_read')
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>(undefined)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (content) {
      setTitle(content.title || '')
      setDescription(content.description || '')
      setAuthor(content.author || '')
      setUrl(content.url || '')
      setStatus(content.status || 'to_read')
      setSelectedFolder(content.folder_id || undefined)
      setSelectedTags(content.tag_ids || [])
    }
  }, [content])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content) return

    setLoading(true)
    try {
      // 1. Update the main content row
      // Ensure folder_id is null if the string is empty to avoid UUID errors
      await updateContentItem(content.id, {
        title,
        description,
        author,
        url,
        status,
        folder_id: selectedFolder || undefined,
      })

      // 2. Sync Tags
      const originalTagIds = content.tag_ids || []
      const tagsToRemove = originalTagIds.filter(id => !selectedTags.includes(id))
      const tagsToAdd = selectedTags.filter(id => !originalTagIds.includes(id))

      // Remove deselected tags
      for (const tagId of tagsToRemove) {
        await removeTagFromContent(content.id, tagId)
      }

      // Add newly selected tags
      if (tagsToAdd.length > 0) {
        const { error: tagError } = await supabase
          .from('content_tags')
          .insert(tagsToAdd.map(tagId => ({
            content_id: content.id,
            tag_id: tagId
          })))
        if (tagError) throw tagError
      }

      onSuccess() // Triggers parent re-fetch
      onClose()
    } catch (error) {
      console.error('Error updating content:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId))
    } else {
      setSelectedTags([...selectedTags, tagId])
    }
  }

  if (!content) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Edit Content</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input w-full"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input w-full min-h-[100px] resize-none"
              rows={3}
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium mb-2">Author</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="input w-full"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium mb-2">URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="input flex-1"
              />
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="input w-full"
            >
              <option value="to_read">To Read</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Folder */}
          <div>
            <label className="block text-sm font-medium mb-2">Folder</label>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="input w-full"
            >
              <option value="">No folder</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent hover:bg-accent/80'
                  }`}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
