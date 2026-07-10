import { useState, useEffect } from 'react'
import { PlaySquare, Youtube, Plus, Trash2, Save, Loader2, BookOpen, Clock, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCourses } from '@/hooks/useCourses'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

export default function Courses() {
  const { user } = useAuth()
  const { courses, loading, addCourse, deleteCourse, updateNotes } = useCourses(user?.uid)

  const [activeCourse, setActiveCourse] = useState(null)
  const [listCollapsed, setListCollapsed] = useState(false)
  
  // Add course states
  const [showAdd, setShowAdd] = useState(false)
  const [courseName, setCourseName] = useState('')
  const [courseUrl, setCourseUrl] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  // Notes states
  const [localNotes, setLocalNotes] = useState('')
  const [notesSaving, setNotesSaving] = useState(false)
  const [isNotesDirty, setIsNotesDirty] = useState(false)

  // Dialog state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  // Set first course active on load if none selected
  useEffect(() => {
    if (courses.length > 0 && !activeCourse) {
      setActiveCourse(courses[0])
      setLocalNotes(courses[0].notes || '')
    }
  }, [courses, activeCourse])

  // Sync notes when switching active course
  const handleSelectCourse = (course) => {
    // If dirty, save first
    if (isNotesDirty && activeCourse) {
      updateNotes(activeCourse.id, localNotes)
    }
    setActiveCourse(course)
    setLocalNotes(course.notes || '')
    setIsNotesDirty(false)
  }

  const parseYoutubeUrl = (url) => {
    let embedId = ''
    let isPlaylist = false
    
    // Check for playlist parameter list=
    if (url.includes('list=')) {
      const match = url.match(/[?&]list=([^#\&\?]+)/)
      if (match) {
        embedId = match[1]
        isPlaylist = true
      }
    }
    
    // If not a playlist, extract video ID
    if (!isPlaylist) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
      const match = url.match(regExp)
      if (match && match[2].length === 11) {
        embedId = match[2]
      }
    }
    
    return { embedId, isPlaylist }
  }

  const handleAddCourse = async (e) => {
    e.preventDefault()
    if (!courseName.trim() || !courseUrl.trim()) return
    setAdding(true)
    setError('')

    const { embedId, isPlaylist } = parseYoutubeUrl(courseUrl.trim())
    if (!embedId) {
      setError('Invalid YouTube link. Please paste a valid video URL or playlist link.')
      setAdding(false)
      return
    }

    try {
      const newId = await addCourse(courseName.trim(), courseUrl.trim(), embedId, isPlaylist)
      setCourseName('')
      setCourseUrl('')
      setShowAdd(false)
      
      // Auto-select newly added course
      const newCourseObj = { id: newId, name: courseName.trim(), url: courseUrl.trim(), embedId, isPlaylist, notes: '' }
      setActiveCourse(newCourseObj)
      setLocalNotes('')
      setIsNotesDirty(false)
    } catch (err) {
      setError('Failed to add course: ' + err.message)
    } finally {
      setAdding(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!activeCourse) return
    setNotesSaving(true)
    try {
      await updateNotes(activeCourse.id, localNotes)
      setIsNotesDirty(false)
    } catch (err) {
      console.error('Failed to save notes', err)
    } finally {
      setNotesSaving(false)
    }
  }

  const getEmbedUrl = (course) => {
    if (!course) return ''
    return course.isPlaylist
      ? `https://www.youtube.com/embed/videoseries?list=${course.embedId}`
      : `https://www.youtube.com/embed/${course.embedId}`
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
            <Youtube className="h-5 w-5 text-semantic-red" />
          </div>
          <div>
            <h1 className="text-page font-bold text-text-primary">Course Vault</h1>
            <p className="text-secondary text-text-secondary">Study YouTube lecture playlists in a premium, distraction-free sandbox</p>
          </div>
        </div>
        <Button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 text-xs self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Add Course
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 text-accent animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-card border border-border-subtle max-w-xl mx-auto space-y-4">
          <PlaySquare className="h-12 w-12 text-text-muted mx-auto" />
          <h3 className="text-body font-semibold text-text-primary">No courses added yet</h3>
          <p className="text-secondary text-text-secondary text-xs max-w-md mx-auto">
            Create your learning hub by linking coding bootcamps, DSA series, or DBMS lectures from YouTube.
          </p>
          <Button onClick={() => setShowAdd(true)} size="sm">
            Add Your First Course
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Left Column: Course Selector Drawer List */}
          {!listCollapsed && (
            <div className="lg:col-span-1 space-y-3 animate-fade-in">
            <span className="text-micro font-semibold text-text-secondary uppercase tracking-wider block">Your Saved Courses</span>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {courses.map((course) => {
                const isActive = activeCourse?.id === course.id
                return (
                  <div
                    key={course.id}
                    onClick={() => handleSelectCourse(course)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      isActive
                        ? 'bg-accent/5 border-accent text-accent-light'
                        : 'bg-card border-border-subtle hover:border-border-hover text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <PlaySquare className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-accent-light' : 'text-text-muted'}`} />
                      <span className="text-xs font-semibold truncate leading-tight">{course.name}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteConfirmId(course.id)
                      }}
                      className="p-1 rounded text-text-muted hover:text-semantic-red hover:bg-hover transition-colors shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
          )}

          {/* Right Column: Video Player + Notes Workspace */}
          {activeCourse && (
            <div className={`space-y-6 ${listCollapsed ? 'lg:col-span-4' : 'lg:col-span-3'}`}>
              {/* Collapse/Expand Toggle Ribbon */}
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setListCollapsed(!listCollapsed)}
                  className="h-8 text-xs flex items-center gap-1.5 bg-elevated border border-border hover:bg-hover text-text-primary"
                >
                  <PlaySquare className="h-4 w-4 text-text-muted" />
                  {listCollapsed ? 'Show Course List' : 'Hide Course List'}
                </Button>
              </div>
              {/* Iframe 16:9 Video Canvas */}
              <div className="w-full aspect-video rounded-xl border border-border-subtle bg-black overflow-hidden shadow-lg relative">
                <iframe
                  src={getEmbedUrl(activeCourse)}
                  title={activeCourse.name}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Lecture Note taking Block */}
              <Card className="border border-border-subtle bg-card">
                <CardHeader className="pb-3 border-b border-border-subtle flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="h-4.5 w-4.5 text-accent-light" />
                    <CardTitle className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                      Study Notepad: {activeCourse.name}
                    </CardTitle>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleSaveNotes}
                    disabled={notesSaving || !isNotesDirty}
                    className="h-7 text-xs flex items-center gap-1.5"
                  >
                    {notesSaving ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    {isNotesDirty ? 'Save Notes *' : 'Notes Saved'}
                  </Button>
                </CardHeader>
                <CardContent className="p-4">
                  <textarea
                    value={localNotes}
                    onChange={(e) => {
                      setLocalNotes(e.target.value)
                      setIsNotesDirty(true)
                    }}
                    onBlur={handleSaveNotes}
                    className="w-full h-48 bg-base text-text-primary text-xs font-sans p-3.5 outline-none resize-y rounded-md border border-border-subtle focus:border-border-hover leading-relaxed"
                    placeholder="Type your notes, codes, and reminders here while watching the lecture... (auto-saves on blur)"
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Add Course Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-[480px] bg-card border border-border-subtle">
          <DialogHeader>
            <DialogTitle className="text-body font-bold text-text-primary">Add New Course</DialogTitle>
            <DialogDescription className="text-xs text-text-secondary">
              Link any YouTube lecture or playlist to play it in a distraction-free window.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddCourse} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <label className="text-micro text-text-secondary font-semibold uppercase">Course Name</label>
              <Input
                placeholder="e.g. Striver's A-Z DSA Playlist"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-micro text-text-secondary font-semibold uppercase">YouTube Video or Playlist URL</label>
              <Input
                placeholder="https://www.youtube.com/playlist?list=..."
                value={courseUrl}
                onChange={(e) => setCourseUrl(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-semantic-red font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <DialogFooter className="flex justify-end gap-2 text-xs pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={adding}>
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Import Course'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Course Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-[425px] bg-card border border-border-subtle">
          <DialogHeader>
            <DialogTitle className="text-body font-bold text-text-primary">Delete Course</DialogTitle>
            <DialogDescription className="text-xs text-text-secondary">
              Are you sure you want to delete this course from your vault? Your saved notes for this course will be deleted as well.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4 text-xs">
            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                if (deleteConfirmId) {
                  await deleteCourse(deleteConfirmId)
                  if (activeCourse?.id === deleteConfirmId) {
                    setActiveCourse(null)
                    setLocalNotes('')
                  }
                }
                setDeleteConfirmId(null)
              }}
            >
              Delete Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
