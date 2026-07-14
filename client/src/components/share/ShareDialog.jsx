import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { shareItem } from '@/services/firestoreService'
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react'

export default function ShareDialog({ open, onOpenChange, itemType, itemData, senderUid, senderEmail }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleShare = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Create clean clone of itemData to remove any potential firestore timestamps or un-clonable fields
      const cleanData = JSON.parse(JSON.stringify(itemData))
      // Remove local ID so receiver can generate their own
      if (cleanData.id) delete cleanData.id

      await shareItem(senderUid, senderEmail, email.trim(), itemType, cleanData)
      setSuccess(true)
      setEmail('')
      setTimeout(() => {
        onOpenChange(false)
        setSuccess(false)
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to share item')
    } finally {
      setLoading(false)
    }
  }

  const getItemTypeName = () => {
    switch (itemType) {
      case 'course': return 'Course'
      case 'bookmark': return 'Bookmark'
      case 'problem': return 'Problem'
      case 'library': return 'Resource Document'
      case 'playground': return 'Playground File'
      default: return 'Item'
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!loading) {
        onOpenChange(val)
        setError('')
        setSuccess(false)
      }
    }}>
      <DialogContent className="sm:max-w-[420px] bg-card border border-border-subtle">
        <DialogHeader>
          <DialogTitle className="text-body font-bold text-text-primary">
            Share {getItemTypeName()}
          </DialogTitle>
          <DialogDescription className="text-xs text-text-secondary">
            Enter the email address of the user you want to share "{itemData?.name || itemData?.title || 'this item'}" with.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleShare} className="space-y-4 pt-3">
          <div className="space-y-1.5">
            <label className="text-micro text-text-secondary font-semibold uppercase">Recipient Email</label>
            <Input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || success}
              className="bg-base border border-border-subtle focus:border-accent text-xs"
            />
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-semantic-red font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-1.5 text-xs text-semantic-green font-medium">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Shared successfully!</span>
            </div>
          )}

          <DialogFooter className="flex justify-end gap-2 text-xs pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || success || !email.trim()}
              className="flex items-center gap-1.5"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              {loading ? 'Sharing...' : 'Share Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
