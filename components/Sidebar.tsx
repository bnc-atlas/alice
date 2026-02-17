'use client'

import { useState, useRef, useEffect } from 'react'
import { type Folder, type Tag, createFolder, createTag, deleteFolder, deleteTag, updateFolder, updateTag } from '@/lib/supabase'
import { 
  Folder as FolderIcon,
  Tag as TagIcon,
  Plus,
  Settings,
  Clock,
  X,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  GripVertical,
  Palette
} from 'lucide-react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'

interface SidebarProps {
  folders: Folder[]
  tags: Tag[]
  selectedFolder: string | null
  selectedTags: string[]
  onFolderSelect: (folderId: string | null) => void
  onTagsSelect: (tagIds: string[]) => void
  onRefresh: () => void
}

export default function Sidebar({
  folders,
  tags,
  selectedFolder,
  selectedTags,
  onFolderSelect,
  onTagsSelect,
  onRefresh
}: SidebarProps) {
  const [foldersExpanded, setFoldersExpanded] = useState(true)
  const [tagsExpanded, setTagsExpanded] = useState(true)
  const [newFolderName, setNewFolderName] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [showNewTagDialog, setShowNewTagDialog] = useState(false)
  const [editMode, setEditMode] = useState<'folders' | 'tags' | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [orderedFolders, setOrderedFolders] = useState<Folder[]>(folders)
  const [orderedTags, setOrderedTags] = useState<Tag[]>(tags)
  const [showColorPicker, setShowColorPicker] = useState<{ type: 'folder' | 'tag'; id: string; color: string } | null>(null)

  // Predefined color palette
  const colorPalette = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', 
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#64748b'
  ]

  // Update ordered lists when props change
  useEffect(() => {
    setOrderedFolders(folders)
  }, [folders])
  
  useEffect(() => {
    setOrderedTags(tags)
  }, [tags])

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsSelect(selectedTags.filter(id => id !== tagId))
    } else {
      onTagsSelect([...selectedTags, tagId])
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    
    try {
      await createFolder({
        name: newFolderName.trim(),
        color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
        description: ''
      })
      setNewFolderName('')
      setShowNewFolderDialog(false)
      onRefresh()
    } catch (error) {
      console.error('Error creating folder:', error)
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    
    try {
      await createTag({
        name: newTagName.trim(),
        color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
      })
      setNewTagName('')
      setShowNewTagDialog(false)
      onRefresh()
    } catch (error) {
      console.error('Error creating tag:', error)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return
    
    try {
      if (editMode === 'folders') {
        for (const folderId of selectedItems) {
          await deleteFolder(folderId)
        }
      } else if (editMode === 'tags') {
        for (const tagId of selectedItems) {
          await deleteTag(tagId)
        }
      }
      
      setSelectedItems([])
      setEditMode(null)
      onRefresh()
    } catch (error) {
      console.error('Error deleting items:', error)
    }
  }

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleReorderFolders = (newOrder: Folder[]) => {
    setOrderedFolders(newOrder)
    // TODO: Save new order to database
  }

  const handleReorderTags = (newOrder: Tag[]) => {
    setOrderedTags(newOrder)
    // TODO: Save new order to database
  }

  const handleColorChange = async (type: 'folder' | 'tag', id: string, color: string) => {
    try {
      if (type === 'folder') {
        await updateFolder(id, { color })
      } else {
        await updateTag(id, { color })
      }
      setShowColorPicker(null)
      onRefresh()
    } catch (error) {
      console.error('Error updating color:', error)
    }
  }

  return (
    <aside className="w-72 border-r border-border/50 bg-card/30 backdrop-blur-xl flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="font-bold text-lg">alice</h2>
            <p className="text-xs text-muted-foreground">down the rabbit hole</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1 mb-6">
        </div>

        {/* Folders Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between px-3 py-2 mb-2">
            <button
              onClick={() => setFoldersExpanded(!foldersExpanded)}
              className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
            >
              {foldersExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <FolderIcon className="w-4 h-4" />
              <span>Folders</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">{folders.length}</span>
              <button
                onClick={() => {
                  setEditMode(editMode === 'folders' ? null : 'folders')
                  setSelectedItems([])
                }}
                className={`p-1 rounded transition-colors ${
                  editMode === 'folders' ? 'bg-accent text-foreground' : 'hover:bg-accent/50 text-muted-foreground'
                }`}
                title="Edit folders"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {editMode === 'folders' && selectedItems.length > 0 && (
            <div className="px-3 py-2 mb-2 bg-accent/50 rounded-lg flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {selectedItems.length} selected
              </span>
              <button
                onClick={handleDeleteSelected}
                className="text-xs text-destructive hover:underline"
              >
                Delete
              </button>
            </div>
          )}

          <AnimatePresence>
            {foldersExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-1 overflow-hidden"
              >
                {editMode === 'folders' ? (
                  <Reorder.Group axis="y" values={orderedFolders} onReorder={handleReorderFolders}>
                    {orderedFolders.map((folder) => (
                      <Reorder.Item key={folder.id} value={folder} className="group">
                        <button
                          onClick={() => toggleItemSelection(folder.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                            selectedItems.includes(folder.id)
                              ? 'bg-accent text-foreground'
                              : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowColorPicker({ type: 'folder', id: folder.id, color: folder.color })
                            }}
                            className="w-3 h-3 rounded-full flex-shrink-0 hover:scale-110 transition-transform cursor-pointer"
                            style={{ backgroundColor: folder.color }}
                            title="Change color"
                          />
                          <span className="flex-1 text-left text-sm font-medium truncate">
                            {folder.name}
                          </span>
                          <div className={`w-4 h-4 rounded border-2 transition-colors ${
                            selectedItems.includes(folder.id)
                              ? 'bg-primary border-primary'
                              : 'border-border'
                          }`} />
                        </button>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                ) : (
                  folders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => onFolderSelect(
                        selectedFolder === folder.id ? null : folder.id
                      )}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg 
                                 transition-all duration-200 group ${
                        selectedFolder === folder.id
                          ? 'bg-accent text-foreground'
                          : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: folder.color }}
                      />
                      <span className="flex-1 text-left text-sm font-medium truncate">
                        {folder.name}
                      </span>
                    </button>
                  ))
                )}
                
                <button 
                  onClick={() => setShowNewFolderDialog(true)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg 
                                 hover:bg-accent/50 text-muted-foreground hover:text-foreground
                                 transition-all duration-200 border border-dashed border-border">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">New Folder</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tags Section */}
        <div>
          <div className="flex items-center justify-between px-3 py-2 mb-2">
            <button
              onClick={() => setTagsExpanded(!tagsExpanded)}
              className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
            >
              {tagsExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <TagIcon className="w-4 h-4" />
              <span>Tags</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">{tags.length}</span>
              <button
                onClick={() => {
                  setEditMode(editMode === 'tags' ? null : 'tags')
                  setSelectedItems([])
                }}
                className={`p-1 rounded transition-colors ${
                  editMode === 'tags' ? 'bg-accent text-foreground' : 'hover:bg-accent/50 text-muted-foreground'
                }`}
                title="Edit tags"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {editMode === 'tags' && selectedItems.length > 0 && (
            <div className="px-3 py-2 mb-2 bg-accent/50 rounded-lg flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {selectedItems.length} selected
              </span>
              <button
                onClick={handleDeleteSelected}
                className="text-xs text-destructive hover:underline"
              >
                Delete
              </button>
            </div>
          )}

          <AnimatePresence>
            {tagsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-1 overflow-hidden"
              >
                {editMode === 'tags' ? (
                  <Reorder.Group axis="y" values={orderedTags} onReorder={handleReorderTags}>
                    {orderedTags.slice(0, 10).map((tag) => (
                      <Reorder.Item key={tag.id} value={tag} className="group">
                        <button
                          onClick={() => toggleItemSelection(tag.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                            selectedItems.includes(tag.id)
                              ? 'bg-accent text-foreground'
                              : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowColorPicker({ type: 'tag', id: tag.id, color: tag.color })
                            }}
                            className="w-2 h-2 rounded-full flex-shrink-0 hover:scale-110 transition-transform cursor-pointer"
                            style={{ backgroundColor: tag.color }}
                            title="Change color"
                          />
                          <span className="flex-1 text-left text-sm truncate">
                            #{tag.name}
                          </span>
                          <div className={`w-4 h-4 rounded border-2 transition-colors ${
                            selectedItems.includes(tag.id)
                              ? 'bg-primary border-primary'
                              : 'border-border'
                          }`} />
                        </button>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                ) : (
                  tags.slice(0, 10).map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg 
                                 transition-all duration-200 group ${
                        selectedTags.includes(tag.id)
                          ? 'bg-accent text-foreground'
                          : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="flex-1 text-left text-sm truncate">
                        #{tag.name}
                      </span>
                      {selectedTags.includes(tag.id) && (
                        <X className="w-3 h-3 opacity-50" />
                      )}
                    </button>
                  ))
                )}
                
                {tags.length > 10 && (
                  <button className="w-full px-3 py-2 text-xs text-muted-foreground 
                                   hover:text-foreground transition-colors text-left">
                    + {tags.length - 10} more tags
                  </button>
                )}
                
                <button 
                  onClick={() => setShowNewTagDialog(true)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg 
                                 hover:bg-accent/50 text-muted-foreground hover:text-foreground
                                 transition-all duration-200 border border-dashed border-border">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">New Tag</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Selected Tags Display */}
        {selectedTags.length > 0 && (
          <div className="mt-6 p-3 bg-accent/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground">
                ACTIVE FILTERS
              </span>
              <button
                onClick={() => onTagsSelect([])}
                className="text-xs text-primary hover:underline"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedTags.map((tagId) => {
                const tag = tags.find(t => t.id === tagId)
                if (!tag) return null
                return (
                  <span
                    key={tag.id}
                    className="tag-chip"
                    style={{ borderColor: tag.color }}
                  >
                    #{tag.name}
                    <button
                      onClick={() => toggleTag(tag.id)}
                      className="ml-1 hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* New Folder Dialog */}
      {showNewFolderDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl 
                     shadow-primary/10 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h3 className="text-lg font-semibold">Create New Folder</h3>
              <button
                onClick={() => setShowNewFolderDialog(false)}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name..."
                className="input w-full mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewFolderDialog(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="btn-primary flex-1"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Tag Dialog */}
      {showNewTagDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl 
                     shadow-primary/10 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h3 className="text-lg font-semibold">Create New Tag</h3>
              <button
                onClick={() => setShowNewTagDialog(false)}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Tag name..."
                className="input w-full mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewTagDialog(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim()}
                  className="btn-primary flex-1"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Footer */}
      <div className="p-4 border-t border-border/50">
        <button 
          onClick={() => {
            // TODO: Implement settings
            console.log('Settings clicked')
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg 
                         hover:bg-accent text-muted-foreground hover:text-foreground
                         transition-all duration-200">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
      </div>

      {/* Color Picker Modal */}
      {showColorPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h3 className="text-lg font-semibold">Change Color</h3>
              <button
                onClick={() => setShowColorPicker(null)}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-6 gap-2 mb-4">
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(showColorPicker.type, showColorPicker.id, color)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                      showColorPicker.color === color ? 'border-primary' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={showColorPicker.color}
                  onChange={(e) => handleColorChange(showColorPicker.type, showColorPicker.id, e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                />
                <span className="text-xs text-muted-foreground font-mono">
                  {showColorPicker.color}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
