'use client'

import { useState, useEffect } from 'react'
import { supabase, type ContentWithDetails, type Folder, type Tag } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { 
  Plus, 
  Search, 
  BookOpen,
  Video,
  Headphones,
  FileText,
  Bookmark,
  CheckCircle2,
  Circle,
  Archive
} from 'lucide-react'
import ContentCard from '@/components/ContentCard'
import AddContentDialog from '@/components/AddContentDialog'
import EditContentDialog from '@/components/EditContentDialog'
import Sidebar from '@/components/Sidebar'

type FilterStatus = 'all' | 'to_read' | 'completed' | 'archived'

export default function Dashboard() {
  const [content, setContent] = useState<ContentWithDetails[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  
  // Remove grid/list toggle buttons
  // Remove view mode state and toggle functionality
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ContentWithDetails | null>(null)
  const [editingItem, setEditingItem] = useState<ContentWithDetails | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      
      // Fetch content with details
      const { data: contentData, error: contentError } = await supabase
        .from('content_with_details')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (contentError) throw contentError
      
      // Fetch folders
      const { data: foldersData, error: foldersError } = await supabase
        .from('folders')
        .select('*')
        .order('name')
      
      if (foldersError) throw foldersError
      
      // Fetch tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order('name')
      
      if (tagsError) throw tagsError
      
      setContent(contentData || [])
      setFolders(foldersData || [])
      setTags(tagsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: FilterStatus) {
    try {
      const { error } = await supabase
        .from('content_items')
        .update({
          status,
          progress_percentage:
            status === 'completed' ? 100 : 0,
        })
        .eq('id', id)

      if (error) throw error

      await fetchData()
      const updated = content.find((c) => c.id === id)
      if (updated) {
        setSelectedItem(updated)
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  // Filter content
  const filteredContent = content.filter(item => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (
        !item.title.toLowerCase().includes(query) &&
        !item.description?.toLowerCase().includes(query) &&
        !item.author?.toLowerCase().includes(query)
      ) {
        return false
      }
    }
    
    // Folder filter
    if (selectedFolder && item.folder_id !== selectedFolder) {
      return false
    }
    
    // Tag filter
    if (selectedTags.length > 0) {
      if (!item.tag_ids || !selectedTags.some(tag => item.tag_ids?.includes(tag))) {
        return false
      }
    }
    
    // Status filter
    if (statusFilter !== 'all' && item.status !== statusFilter) {
      return false
    }
    
    return true
  })

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        folders={folders}
        tags={tags}
        selectedFolder={selectedFolder}
        selectedTags={selectedTags}
        onFolderSelect={setSelectedFolder}
        onTagsSelect={setSelectedTags}
        onRefresh={fetchData}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 glass border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="sr-only">Contents</h1>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search your content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
              
              <button
                onClick={() => setShowAddDialog(true)}
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
              >
                <Plus className="w-5 h-5 text-foreground" />
              </button>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                className="input w-auto"
              >
                <option value="all">All Status</option>
                <option value="to_read">To Read</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Grid/List */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {loading ? (
            <div className="masonry-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton h-64 rounded-2xl" />
              ))}
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Bookmark className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No content found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || selectedFolder || selectedTags.length > 0
                  ? 'Try adjusting your filters'
                  : 'Start adding content to your second brain'}
              </p>
              {!searchQuery && !selectedFolder && selectedTags.length === 0 && (
                <button
                  onClick={() => setShowAddDialog(true)}
                  className="btn-primary"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Item
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredContent.map((item, index) => (
                <ContentCard
                  key={item.id}
                  content={item}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onUpdate={fetchData}
                  onEdit={setEditingItem}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Content Dialog */}
      {showAddDialog && (
        <AddContentDialog
          folders={folders}
          tags={tags}
          onClose={() => setShowAddDialog(false)}
          onSuccess={() => {
            setShowAddDialog(false)
            fetchData()
          }}
        />
      )}

      {/* Edit Content Dialog */}
      {editingItem && (
        <EditContentDialog
          content={editingItem}
          folders={folders}
          tags={tags}
          onClose={() => setEditingItem(null)}
          onSuccess={() => {
            setEditingItem(null)
            fetchData()
          }}
        />
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-card border border-border rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">{selectedItem.title}</h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
              {selectedItem.domain && <span>{selectedItem.domain}</span>}
              {selectedItem.estimated_time && (
                <span>• {selectedItem.estimated_time} min read</span>
              )}
              <span>
                • {formatDistanceToNow(new Date(selectedItem.created_at), { addSuffix: true })}
              </span>
            </div>

            {selectedItem.description && (
              <p className="mb-4 text-sm text-muted-foreground">
                {selectedItem.description}
              </p>
            )}

            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-2">Status</h3>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => updateStatus(selectedItem.id, 'to_read')}
                  className="btn-secondary text-xs"
                >
                  To Read
                </button>
                <button
                  onClick={() => updateStatus(selectedItem.id, 'completed')}
                  className="btn-secondary text-xs"
                >
                  Completed
                </button>
                <button
                  onClick={() => updateStatus(selectedItem.id, 'archived')}
                  className="btn-secondary text-xs"
                >
                  Archived
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
