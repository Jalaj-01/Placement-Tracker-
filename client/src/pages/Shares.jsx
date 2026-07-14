import { useState, useEffect } from 'react'
import { Share2, Trash2, Download, Loader2, Youtube, Bookmark, FileText, Code2, AlertCircle, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { subscribeShares, deleteShare, addCourseDoc, addBookmarkDoc, addLibraryDoc, addProblem, savePlaygroundFile } from '@/services/firestoreService'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Shares() {
  const { user } = useAuth()
  const [shares, setShares] = useState([])
  const [loading, setLoading] = useState(true)
  const [importingId, setImportingId] = useState(null)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (!user?.uid) return
    const unsubscribe = subscribeShares(user.uid, (data) => {
      setShares(data)
      setLoading(false)
    })
    return unsubscribe
  }, [user])

  const handleImport = async (share) => {
    setImportingId(share.id)
    setError('')
    setSuccessMsg('')
    try {
      const data = share.itemData
      if (share.itemType === 'course') {
        await addCourseDoc(user.uid, data.name, data.url, data.embedId, data.isPlaylist)
        setSuccessMsg(`Successfully imported course "${data.name}"!`)
      } else if (share.itemType === 'bookmark') {
        await addBookmarkDoc(user.uid, data.title, data.url, data.category, data.description, data.tags)
        setSuccessMsg(`Successfully imported bookmark "${data.title}"!`)
      } else if (share.itemType === 'library') {
        await addLibraryDoc(user.uid, data.name, data.url, data.type, data.size)
        setSuccessMsg(`Successfully imported document "${data.name}"!`)
      } else if (share.itemType === 'problem') {
        await addProblem(user.uid, data)
        setSuccessMsg(`Successfully imported problem "${data.title}"!`)
      } else if (share.itemType === 'playground') {
        await savePlaygroundFile(user.uid, null, data.name, data.code)
        setSuccessMsg(`Successfully imported playground file "${data.name}"!`)
      }
      
      // Auto delete the share document on import
      await deleteShare(user.uid, share.id)
    } catch (err) {
      setError('Failed to import: ' + err.message)
    } finally {
      setImportingId(null)
    }
  }

  const handleDelete = async (shareId) => {
    setError('')
    setSuccessMsg('')
    try {
      await deleteShare(user.uid, shareId)
    } catch (err) {
      setError('Failed to delete share: ' + err.message)
    }
  }

  const getShareIcon = (type) => {
    switch (type) {
      case 'course': return <Youtube className="h-5 w-5 text-semantic-red" />
      case 'bookmark': return <Bookmark className="h-5 w-5 text-semantic-blue" />
      case 'library': return <FileText className="h-5 w-5 text-accent-light" />
      case 'problem': return <Code2 className="h-5 w-5 text-semantic-green" />
      case 'playground': return <Code2 className="h-5 w-5 text-semantic-purple" />
      default: return <Share2 className="h-5 w-5 text-text-muted" />
    }
  }

  const getShareTitle = (share) => {
    const data = share.itemData
    return data.name || data.title || 'Untitled Shared Item'
  }

  const getShareSub = (share) => {
    switch (share.itemType) {
      case 'course': return share.itemData.isPlaylist ? 'Course Playlist' : 'Single Video Course'
      case 'bookmark': return `Bookmark under "${share.itemData.category || 'General'}"`
      case 'library': return `Resource Document (${share.itemData.type || 'unknown'})`
      case 'problem': return `Problem Log (${share.itemData.platform || 'LeetCode'} • ${share.itemData.difficulty || 'Medium'})`
      case 'playground': return `Playground Script (${share.itemData.name})`
      default: return 'Shared Resource'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
          <Share2 className="h-5 w-5 text-accent-light" />
        </div>
        <div>
          <h1 className="text-page font-bold text-text-primary">Shared Inbox</h1>
          <p className="text-secondary text-text-secondary">Review and import courses, problems, bookmarks, or docs shared with you by other users</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 p-3 rounded-xl bg-semantic-red/10 border border-semantic-red/25 text-xs text-semantic-red font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-1.5 p-3 rounded-xl bg-semantic-green/10 border border-semantic-green/25 text-xs text-semantic-green font-medium">
          <Sparkles className="h-4 w-4 shrink-0 text-semantic-green" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 text-accent animate-spin" />
        </div>
      ) : shares.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border-subtle max-w-xl mx-auto space-y-4 shadow-sm">
          <Share2 className="h-16 w-16 text-text-muted/65 mx-auto stroke-[1.25]" />
          <div className="space-y-1.5">
            <h3 className="text-body font-bold text-text-primary">Inbox is clean</h3>
            <p className="text-secondary text-text-secondary text-xs max-w-sm mx-auto leading-relaxed">
              Nothing shared with you yet. Give another user your logged-in email address to receive resources.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shares.map((share) => (
            <Card key={share.id} className="border border-border-subtle bg-card hover:border-border-hover transition-all">
              <CardContent className="p-4 flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface border border-border-subtle shrink-0">
                  {getShareIcon(share)}
                </div>
                
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-bold text-text-primary truncate block" title={getShareTitle(share)}>
                      {getShareTitle(share)}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-surface border border-border-subtle text-text-secondary shrink-0">
                      {share.itemType}
                    </span>
                  </div>

                  <p className="text-[10px] text-text-secondary truncate">{getShareSub(share)}</p>
                  
                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-[10px] text-text-muted">
                      Shared by <span className="font-semibold text-text-secondary">{share.senderEmail}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-text-muted hover:text-semantic-red"
                        onClick={() => handleDelete(share.id)}
                        title="Delete share"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        className="h-8 text-xs flex items-center gap-1 font-semibold"
                        onClick={() => handleImport(share)}
                        disabled={importingId === share.id}
                      >
                        {importingId === share.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                        Import
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
