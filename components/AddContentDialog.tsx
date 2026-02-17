'use client'

import { useState } from 'react'
import { type Folder, type Tag, createContentItem, fetchMetadata, addTagsToContent } from '@/lib/supabase'
import { X, Link, Sparkles, Loader2, BookOpen, Video, Headphones, FileText, Circle, Clock, CheckCircle2, Archive } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AddContentDialogProps {
  folders: Folder[]
  tags: Tag[]
  onClose: () => void
  onSuccess: () => void
}

export default function AddContentDialog({ folders, tags, onClose, onSuccess }: AddContentDialogProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'url' | 'details'>('url')
  
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [contentType, setContentType] = useState<'article' | 'video' | 'book' | 'podcast' | 'other'>('article')
  const [selectedFolder, setSelectedFolder] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [estimatedTime, setEstimatedTime] = useState<number | undefined>()
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [status, setStatus] = useState<'to_read' | 'in_progress' | 'completed' | 'archived'>('to_read')

  const handleFetchMetadata = async () => {
    if (!url) return
    
    setLoading(true)
    try {
      const metadata = await fetchMetadata(url)
      if (metadata) {
        setTitle(metadata.title || '')
        setDescription(metadata.description || '')
        setThumbnailUrl(metadata.image || '')
        
        // Auto-detect content type
        if (url.includes('youtube.com') || url.includes('vimeo.com')) {
          setContentType('video')
        } else if (url.includes('spotify.com') || url.includes('podcast')) {
          setContentType('podcast')
        } else {
          setContentType('article')
        }
      }
      setStep('details')
    } catch (error) {
      console.error('Error fetching metadata:', error)
      setStep('details')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const domain = url ? new URL(url).hostname : undefined
      
      const content = await createContentItem({
        title,
        url: url || undefined,
        content_type: contentType,
        description: description || undefined,
        thumbnail_url: thumbnailUrl || undefined,
        domain,
        estimated_time: estimatedTime,
        folder_id: selectedFolder || undefined,
        status: status,
        progress_percentage: status === 'completed' ? 100 : status === 'in_progress' ? 50 : 0,
      })

      if (selectedTags.length > 0) {
        await addTagsToContent(content.id, selectedTags)
      }

      onSuccess()
    } catch (error) {
      console.error('Error creating content:', error)
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl 
                   shadow-primary/10 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 
                            flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Add to Second Brain</h2>
              <p className="text-sm text-muted-foreground">
                Save content for later
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <AnimatePresence mode="wait">
            {step === 'url' ? (
              <motion.div
                key="url-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Paste a URL (optional)
                  </label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/article"
                      className="input pl-10 w-full"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    We'll automatically fetch the title, description, and thumbnail
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleFetchMetadata}
                    disabled={loading || !url}
                    className="btn-primary flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Auto-Fill Details
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    className="btn-secondary"
                  >
                    Manual Entry
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="details-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title"
                    className="input w-full"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description..."
                    className="input w-full min-h-[80px] resize-none"
                    rows={3}
                  />
                </div>

                {/* Content Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Content Type
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: 'article', icon: FileText, label: 'Article' },
                      { value: 'video', icon: Video, label: 'Video' },
                      { value: 'book', icon: BookOpen, label: 'Book' },
                      { value: 'podcast', icon: Headphones, label: 'Podcast' },
                    ].map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setContentType(value as 'article' | 'video' | 'book' | 'podcast' | 'other')}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border 
                                   transition-all duration-200 ${
                          contentType === value
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'border-border hover:border-primary/30 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Folder */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Folder
                  </label>
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
                  <label className="block text-sm font-medium mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border border-border/50 
                                min-h-[60px]">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`tag-chip transition-all ${
                          selectedTags.includes(tag.id)
                            ? 'bg-primary/20 border-primary text-primary'
                            : ''
                        }`}
                        style={selectedTags.includes(tag.id) ? { 
                          backgroundColor: `${tag.color}20`,
                          borderColor: tag.color,
                          color: tag.color
                        } : {}}
                      >
                        #{tag.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estimated Time */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Estimated Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={estimatedTime || ''}
                    onChange={(e) => setEstimatedTime(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="e.g., 15"
                    className="input w-full"
                    min="1"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'to_read', label: 'To Read', icon: Circle },
                      { value: 'in_progress', label: 'In Progress', icon: Clock },
                      { value: 'completed', label: 'Completed', icon: CheckCircle2 },
                      { value: 'archived', label: 'Archived', icon: Archive },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setStatus(value as 'to_read' | 'in_progress' | 'completed' | 'archived')}
                        className={`flex items-center gap-2 p-3 rounded-lg border 
                                   transition-all duration-200 ${
                          status === value
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'border-border hover:border-primary/30 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          {step === 'details' && (
            <div className="flex gap-3 pt-4 border-t border-border/50">
              <button
                type="button"
                onClick={() => setStep('url')}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !title}
                className="btn-primary flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Add to Brain
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  )
}
