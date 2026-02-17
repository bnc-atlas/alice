'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { ContentWithDetails } from '@/lib/supabase'
import {
  ExternalLink,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Archive,
  BookOpen,
  Video,
  Headphones,
  FileText,
  Bookmark,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { deleteContentItem } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

interface ContentCardProps {
  content: ContentWithDetails
  viewMode: 'grid' | 'list' // Dashboard always passes "list" now
  style?: React.CSSProperties
  onUpdate: () => void
  onOpenDetails?: (item: ContentWithDetails) => void
  onEdit?: (item: ContentWithDetails) => void
}

export default function ContentCard({
  content,
  viewMode,
  style,
  onUpdate,
  onOpenDetails,
  onEdit,
}: ContentCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showStatusSelector, setShowStatusSelector] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const menuRef = useRef<HTMLDivElement>(null)

  // Close status selector and menu when the mouse leaves the card
  useEffect(() => {
    if (!showStatusSelector && !showMenu) return

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowStatusSelector(false)
        setShowMenu(false)
      }
    }

    window.addEventListener('keydown', handleEsc)
    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [showStatusSelector, showMenu])

  const handleEdit = () => {
    // Open edit dialog with the content item
    onEdit?.(content)
    setShowMenu(false)
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('content_items')
        .update({ status: newStatus })
        .eq('id', content.id)
      
      if (error) {
        console.error('Error updating status:', error)
      } else {
        setShowStatusSelector(false)
        onUpdate()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteContentItem(content.id)
      setShowMenu(false)
      onUpdate()
    } catch (error) {
      console.error('Error deleting content:', error)
    }
  }

  const getTypeIcon = () => {
    const iconClass = 'w-5 h-5'
    switch (content.content_type) {
      case 'article':
        return <FileText className={iconClass} />
      case 'video':
        return <Video className={iconClass} />
      case 'book':
        return <BookOpen className={iconClass} />
      case 'podcast':
        return <Headphones className={iconClass} />
      default:
        return <Bookmark className={iconClass} />
    }
  }

  const getStatusBadge = () => {
    const statusConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; className: string }> = {
      to_read: { icon: Circle, label: 'To Read', className: 'status-to-read' },
      completed: { icon: CheckCircle2, label: 'Done', className: 'status-completed' },
      archived: { icon: Archive, label: 'Archived', className: 'status-archived' },
    }

    const config = statusConfig[content.status]
    if (!config) return null
    
    const Icon = config.icon

    return (
      <div className="relative z-20">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setShowStatusSelector((v) => !v)
            setShowMenu(false)
          }}
          className={`${config.className} cursor-pointer hover:opacity-80 transition-opacity`}
          title="Click to change status"
        >
          <Icon className="w-3.5 h-3.5" />
          {config.label}
        </button>

        {showStatusSelector && (
          <div className="absolute top-full right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-30 p-2 min-w-32">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleStatusChange('to_read')
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent transition-colors rounded"
            >
              <Circle className="w-4 h-4" />
              To Read
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleStatusChange('completed')
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent transition-colors rounded"
            >
              <CheckCircle2 className="w-4 h-4" />
              Completed
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleStatusChange('archived')
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent transition-colors rounded"
            >
              <Archive className="w-4 h-4" />
              Archived
            </button>
          </div>
        )}
      </div>
    )
  }

  // LIST VIEW ONLY – no images
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={style}
      className="flex items-center gap-4 p-4 rounded-xl border border-border/50 
                 bg-card/50 backdrop-blur-sm hover:bg-card hover:border-primary/30 
                 transition-all duration-200 cursor-pointer relative group"
      onClick={() => {
        onEdit?.(content)
      }}
    >
      {/* Content Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate mb-1">{content.title}</h3>
            {content.description && (
              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                {content.description}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {content.author && <span>{content.author}</span>}
              {content.domain && <span>• {content.domain}</span>}
              {content.estimated_time && (
                <span>• {content.estimated_time} min read</span>
              )}
              <span>
                • {formatDistanceToNow(new Date(content.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {content.url && (
              <a
                href={content.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-accent rounded-lg transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Tags */}
        {content.tag_names && content.tag_names.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {content.tag_names.slice(0, 4).map((tag, i) => (
              <span key={i} className="tag-chip">
                #{tag}
              </span>
            ))}
            {content.tag_names.length > 4 && (
              <span className="tag-chip">
                +{content.tag_names.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions Menu */}
      <div className="absolute top-2 right-2 z-50" ref={menuRef}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            const rect = e.currentTarget.getBoundingClientRect()
            setMenuPosition({
              top: rect.bottom + window.scrollY + 4,
              left: rect.right + window.scrollX - 192 // 192px is the width of the dropdown
            })
            setShowMenu((v) => !v)
            setShowStatusSelector(false)
          }}
          className="p-2 hover:bg-accent rounded-lg transition-colors bg-background/90 backdrop-blur-sm border border-border/50"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Portal Dropdown Menu */}
      {showMenu && createPortal(
        <div
          className="fixed w-48 bg-card border border-border rounded-lg shadow-2xl z-[9999] overflow-hidden"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleEdit}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent transition-colors"
          >
            <Edit className="w-4 h-4 text-muted-foreground" />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent transition-colors text-destructive border-t border-border"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>,
        document.body
      )}
    </motion.div>
  )
}