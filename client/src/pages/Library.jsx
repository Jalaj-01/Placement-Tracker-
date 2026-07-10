import { useState } from 'react'
import { FolderOpen, FileUp, FileText, ImageIcon, Search, Trash2, ExternalLink, Loader2, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useLibrary } from '@/hooks/useLibrary'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { storage } from '@/config/firebase'
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { cn } from '@/lib/utils'

export default function Library() {
  const { user } = useAuth()
  const { libraryDocs, loading, addDoc, deleteDoc } = useLibrary(user?.uid)

  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  
  // Dialog state
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState(null)

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
      reader.readAsDataURL(file)
    })
  }

  const uploadFilesList = async (files) => {
    setUploading(true)
    setError('')
    setUploadProgress(0)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Under 1MB: Store as Base64 in Firestore directly (zero setup, works offline/instantly!)
        if (file.size <= 1024 * 1024) {
          setUploadProgress(30)
          const base64Url = await readFileAsBase64(file)
          setUploadProgress(70)
          await addDoc(file.name, base64Url, file.type, file.size)
          setUploadProgress(100)
        } else {
          // Fallback to Firebase Storage bucket if enabled
          const path = `users/${user?.uid || 'anonymous'}/library/${Date.now()}_${file.name}`
          const sRef = storageRef(storage, path)
          const uploadTask = uploadBytesResumable(sRef, file)
          
          await new Promise((resolve, reject) => {
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                setUploadProgress(Math.round(progress))
              },
              (err) => {
                reject(err)
              },
              () => {
                resolve()
              }
            )
          })

          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref)
          await addDoc(file.name, downloadUrl, file.type, file.size)
        }
      }
    } catch (err) {
      setError('Upload failed: ' + err.message + ' (For files > 1MB, verify Firebase Storage is activated in console)')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleFileUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    await uploadFilesList(files)
    e.target.value = '' // Clear file value so same file can be selected again
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (!files || files.length === 0) return
    await uploadFilesList(files)
  }

  const formatSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDate = (ts) => {
    if (!ts) return ''
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const filteredDocs = libraryDocs.filter((doc) =>
    doc.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
          <FolderOpen className="h-5 w-5 text-accent-light" />
        </div>
        <div>
          <h1 className="text-page font-bold text-text-primary">Resource Library</h1>
          <p className="text-secondary text-text-secondary font-medium">Store and review your preparation sheets, syllabus PDFs, and note screenshots</p>
        </div>
      </div>

      {/* Upload Zone */}
      <Card
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border border-dashed border-border-subtle bg-card transition-all cursor-pointer select-none",
          isDragging ? "border-accent bg-accent/5 scale-[1.01]" : "hover:border-border-hover"
        )}
      >
        <CardContent className="p-6">
          <label className="flex flex-col items-center justify-center gap-2 cursor-pointer py-6 w-full">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface border border-border-subtle">
              {uploading ? (
                <Loader2 className="h-6 w-6 text-accent-light animate-spin" />
              ) : (
                <FileUp className="h-6 w-6 text-accent-light" />
              )}
            </div>
            <div className="text-center">
              {uploading ? (
                <span className="text-body font-semibold text-accent-light">
                  Uploading: {uploadProgress}%
                </span>
              ) : (
                <span className="text-body font-semibold text-accent-light">
                  {isDragging ? 'Drop files here!' : 'Click or Drag files to upload'}
                </span>
              )}
              <p className="text-micro text-text-muted mt-1">Accepts multiple images or PDF study guides</p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </CardContent>
      </Card>

      {error && <p className="text-xs text-semantic-red font-medium">{error}</p>}

      {/* Library Inventory */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            placeholder="Search resources by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-xs"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-accent animate-spin" />
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-card border border-border-subtle">
            <p className="text-secondary text-text-secondary text-xs">No resources uploaded yet. Drag files above to build your prep repository.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredDocs.map((docItem) => {
              const isImage = docItem.type?.startsWith('image/')
              return (
                <Card key={docItem.id} className="bg-card border border-border-subtle hover:border-border-hover transition-all flex flex-col group overflow-hidden">
                  {/* File Preview Thumbnail */}
                  <div className="h-32 bg-surface flex items-center justify-center border-b border-border-subtle relative overflow-hidden shrink-0">
                    {isImage ? (
                      <img
                        src={docItem.url}
                        alt={docItem.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5">
                        <FileText className="h-10 w-10 text-semantic-red" />
                        <span className="text-[10px] font-bold text-semantic-red bg-semantic-red/10 px-2 py-0.5 rounded uppercase">PDF Doc</span>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <CardContent className="p-3.5 flex-1 flex flex-col justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-text-primary truncate" title={docItem.name}>
                        {docItem.name}
                      </h4>
                      <p className="text-[10px] text-text-muted mt-1">
                        {formatSize(docItem.size)} • {formatDate(docItem.createdAt)}
                      </p>
                    </div>

                    <div className="flex gap-1.5 justify-end">
                      <a href={docItem.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-text-muted hover:text-text-primary hover:bg-hover">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirmDoc(docItem)}
                        className="h-7 w-7 text-text-muted hover:text-semantic-red hover:bg-hover"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!deleteConfirmDoc} onOpenChange={() => setDeleteConfirmDoc(null)}>
        <DialogContent className="sm:max-w-[425px] bg-card border border-border-subtle">
          <DialogHeader>
            <DialogTitle className="text-body font-bold text-text-primary">Delete Document</DialogTitle>
            <DialogDescription className="text-xs text-text-secondary">
              Are you sure you want to delete &quot;{deleteConfirmDoc?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4 text-xs">
            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmDoc(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                if (deleteConfirmDoc) {
                  await deleteDoc(deleteConfirmDoc.id)
                }
                setDeleteConfirmDoc(null)
              }}
            >
              Delete File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
