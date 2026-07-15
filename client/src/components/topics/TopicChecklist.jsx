import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Plus, Trash2, GripVertical, Pencil, Check, X } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import TopicCard from './TopicCard'

export default function TopicChecklist({
  title,
  topics,
  onUpdate,
  onAdd,
  onDelete,
  onDeleteCategory,
  onRenameCategory,
  onDragHandleMouseDown,
  onDragHandleMouseUp,
  onDragHandleTouchStart,
  onDragHandleTouchEnd
}) {
  const [open, setOpen] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')

  // Inline edit state for section title
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(title)
  const editRef = useRef(null)

  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus()
      editRef.current.select()
    }
  }, [editing])

  const done = topics.filter((t) => t.status === 'Done').length
  const pct = topics.length ? Math.round((done / topics.length) * 100) : 0

  const handleAdd = async () => {
    if (!newName.trim()) return
    await onAdd(newName.trim())
    setNewName('')
    setAdding(false)
  }

  const handleRenameConfirm = async () => {
    const trimmed = editValue.trim()
    if (!trimmed || trimmed === title) {
      setEditValue(title)
      setEditing(false)
      return
    }
    if (onRenameCategory) await onRenameCategory(title, trimmed)
    setEditing(false)
  }

  const handleRenameCancel = () => {
    setEditValue(title)
    setEditing(false)
  }

  return (
    <div className="rounded-card border border-border-subtle bg-card overflow-hidden">
      <div className="w-full flex items-center justify-between p-4 hover:bg-hover/30 transition-colors">
        {/* Left side */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            onMouseDown={onDragHandleMouseDown}
            onMouseUp={onDragHandleMouseUp}
            onTouchStart={onDragHandleTouchStart}
            onTouchEnd={onDragHandleTouchEnd}
            onClick={(e) => e.stopPropagation()}
            className="touch-none cursor-grab active:cursor-grabbing p-1 rounded text-text-muted hover:text-text-primary hover:bg-hover transition-colors shrink-0"
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          <button onClick={() => setOpen(!open)} className="shrink-0">
            <ChevronDown className={cn('h-4 w-4 text-text-muted transition-transform', !open && '-rotate-90')} />
          </button>

          {/* Inline editable title */}
          {editing ? (
            <div className="flex items-center gap-1.5 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
              <Input
                ref={editRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameConfirm()
                  if (e.key === 'Escape') handleRenameCancel()
                }}
                className="h-7 text-sm font-medium bg-surface border border-accent/50 focus-visible:ring-1 focus-visible:ring-accent px-2 rounded-md"
              />
              <button
                onClick={handleRenameConfirm}
                className="p-1 rounded text-semantic-green hover:bg-semantic-green/10 transition-colors shrink-0"
                title="Save"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleRenameCancel}
                className="p-1 rounded text-text-muted hover:bg-hover transition-colors shrink-0"
                title="Cancel"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 min-w-0 group/title">
              <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 min-w-0">
                <span className="text-card-title font-medium text-text-primary truncate">{title}</span>
                <span className="text-micro text-text-muted shrink-0">{done}/{topics.length} done</span>
              </button>
              {onRenameCategory && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditValue(title)
                    setEditing(true)
                  }}
                  className="p-1 rounded text-text-muted opacity-0 group-hover/title:opacity-100 hover:text-accent-light hover:bg-hover transition-all shrink-0"
                  title="Rename section"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0 ml-2">
          <div className="w-24 hidden sm:block">
            <Progress value={pct} />
          </div>
          {onDeleteCategory && !editing && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                onDeleteCategory(title)
              }}
              className="p-1 rounded text-text-muted hover:text-semantic-red hover:bg-hover transition-colors cursor-pointer"
              title="Delete section"
            >
              <Trash2 className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>

      {open && (
        <div className="border-t border-border-subtle px-1 pb-2">
          {topics.map((t) => (
            <TopicCard key={t.id} topic={t} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
          {adding ? (
            <div className="flex gap-2 px-3 py-2">
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Topic name" className="flex-1" onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
              <Button size="sm" onClick={handleAdd}>Add</Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-3 py-2 text-secondary text-text-muted hover:text-accent-light transition-colors">
              <Plus className="h-4 w-4" /> Add custom topic
            </button>
          )}
        </div>
      )}
    </div>
  )
}
