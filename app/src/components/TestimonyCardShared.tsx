import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { testimonyApi, commentApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Heart, MessageCircle, Bookmark, Share2, Play, HandHeart, Flame, Briefcase, UserPlus, Church, Sparkles } from 'lucide-react'

export const categoryIcons: Record<string, typeof Heart> = {
  healing: HandHeart, finance: Briefcase, family: UserPlus,
  career: Sparkles, deliverance: Flame, general: Church,
}

export const categoryColors: Record<string, { bg: string; text: string }> = {
  healing: { bg: '#E8D5C0', text: '#8B6914' },
  finance: { bg: '#D4E0CC', text: '#4A6B3A' },
  family: { bg: '#D4E0F0', text: '#2E5A8B' },
  career: { bg: '#E8D5E0', text: '#6B3A5A' },
  deliverance: { bg: '#F0E8D4', text: '#8B6B14' },
  general: { bg: '#E8E4DE', text: '#6B6560' },
}

export function timeAgo(date: string) {
  const d = new Date(date), now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return d.toLocaleDateString()
}

interface TestimonyCardProps {
  t: any
  onSelect: () => void
  onAmen: () => void
}

export function TestimonyCard({ t, onSelect, onAmen }: TestimonyCardProps) {
  const { isAuthenticated } = useAuth()
  const CatIcon = categoryIcons[t.category] ?? Heart
  const catColor = categoryColors[t.category] ?? categoryColors.general

  const handleAmenClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.error('Please sign in first to react')
      return
    }
    testimonyApi.amen(t.id).then(onAmen).catch(() => {})
  }

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect()
  }

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div onClick={onSelect} className="group bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderLeft: `3px solid ${catColor.bg}` }}>
      {t.thumbnail_url && (
        <div className="relative aspect-video overflow-hidden">
          <img src={t.thumbnail_url} alt={t.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          {t.type === 'video' && <div className="absolute inset-0 flex items-center justify-center"><div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-md"><Play size={20} fill="var(--eleven-accent)" style={{ color: 'var(--eleven-accent)' }} /></div></div>}
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: t.is_anonymous ? '#E8E4DE' : catColor.bg, color: t.is_anonymous ? '#6B6560' : catColor.text }}>{t.is_anonymous ? 'A' : (t.author_name ?? 'U').charAt(0).toUpperCase()}</div>
          <span className="text-xs font-medium" style={{ color: 'var(--eleven-text-secondary)' }}>{t.is_anonymous ? 'Anonymous' : (t.author_name ?? 'User')}</span>
          <span className="text-xs" style={{ color: 'var(--eleven-text-muted)' }}> &middot; {timeAgo(t.created_at)}</span>
          <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: catColor.bg, color: catColor.text }}><CatIcon size={10} />{t.category}</span>
        </div>
        <h3 className="font-display text-base font-semibold mb-1.5 line-clamp-2" style={{ color: 'var(--eleven-text)' }}>{t.title}</h3>
        <p className="text-sm line-clamp-3 mb-3" style={{ color: 'var(--eleven-text-secondary)' }}>{t.content}</p>
        <div className="flex items-center gap-4 pt-2 border-t" style={{ borderColor: 'var(--eleven-border)' }}>
          <button onClick={handleAmenClick} className={`flex items-center gap-1 text-xs font-medium transition-all duration-300 ${t.has_reacted ? 'text-red-500 scale-105 font-semibold' : 'text-stone-400 hover:text-red-500'}`}><Heart size={14} fill={t.has_reacted ? 'currentColor' : 'none'} className={`transition-transform duration-300 ${t.has_reacted ? 'scale-110 text-red-500' : ''}`} /> {t.amen_count} {t.has_reacted ? 'Reacted' : 'Reaction'}</button>
          <button onClick={handleCommentClick} className="flex items-center gap-1 text-xs font-medium transition-colors hover:text-foreground" style={{ color: 'var(--eleven-text-muted)' }}><MessageCircle size={14} /> {t.prayer_count}</button>
          <span className="ml-auto flex items-center gap-3" onClick={handleActionClick}><Bookmark size={14} style={{ color: 'var(--eleven-text-muted)' }} className="cursor-pointer hover:text-foreground" /><Share2 size={14} style={{ color: 'var(--eleven-text-muted)' }} className="cursor-pointer hover:text-foreground" /></span>
        </div>
      </div>
    </div>
  )
}

interface TestimonyDetailModalProps {
  t: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function TestimonyDetailModal({ t, open, onOpenChange, onUpdate }: TestimonyDetailModalProps) {
  const { isAuthenticated } = useAuth()
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [amenCount, setAmenCount] = useState(t.amen_count)
  const [viewCount, setViewCount] = useState(t.view_count)
  const [hasReacted, setHasReacted] = useState(t.has_reacted)

  const loadComments = () => {
    commentApi.list('testimony', t.id).then(r => {
      setComments(r.results ?? r)
    }).catch(() => {})
  }

  useEffect(() => {
    setAmenCount(t.amen_count)
    setViewCount(t.view_count)
    setHasReacted(t.has_reacted)
  }, [t.id, t.amen_count, t.view_count, t.has_reacted])

  useEffect(() => {
    if (open) {
      loadComments()
      testimonyApi.incrementView(t.id).then((res) => {
        if (res && typeof res.view_count === 'number') {
          setViewCount(res.view_count)
        } else {
          setViewCount(prev => prev + 1)
        }
        onUpdate()
      }).catch(() => {})
    }
  }, [open, t.id])

  const handleAmen = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in first to react')
      return
    }
    try {
      const res = await testimonyApi.amen(t.id)
      if (res) {
        setAmenCount(res.amen_count)
        setHasReacted(res.reacted)
      } else {
        setAmenCount(prev => hasReacted ? prev - 1 : prev + 1)
        setHasReacted(!hasReacted)
      }
      onUpdate()
    } catch (err) {
      // Ignore
    }
  }

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) { toast.error('Please sign in first'); return }
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      await commentApi.create({ target_type: 'testimony', target_id: t.id, content: commentText.trim(), is_anonymous: isAnonymous })
      setCommentText(''); setIsAnonymous(false); toast.success('Comment posted!'); loadComments(); onUpdate()
    } catch (err: any) { toast.error(err.message || 'Failed to post comment') }
    setSubmitting(false)
  }

  const CatIcon = categoryIcons[t.category] ?? Heart
  const catColor = categoryColors[t.category] ?? categoryColors.general

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: catColor.bg, color: catColor.text }}><CatIcon size={10} /> {t.category}</span>
            <span className="text-xs" style={{ color: 'var(--eleven-text-muted)' }}>{timeAgo(t.created_at)}</span>
          </div>
          <DialogTitle className="font-display text-2xl font-bold leading-tight" style={{ color: 'var(--eleven-text)' }}>{t.title}</DialogTitle>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t" style={{ borderColor: 'var(--eleven-border)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: t.is_anonymous ? '#E8E4DE' : catColor.bg, color: t.is_anonymous ? '#6B6560' : catColor.text }}>{t.is_anonymous ? 'A' : (t.author_name ?? 'U').charAt(0).toUpperCase()}</div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--eleven-text)' }}>{t.is_anonymous ? 'Anonymous' : (t.author_name ?? 'User')}</p>
              <p className="text-[10px]" style={{ color: 'var(--eleven-text-muted)' }}>Author</p>
            </div>
          </div>
        </DialogHeader>

        <div className="my-6">
          {t.thumbnail_url && (
            <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
              <img src={t.thumbnail_url} alt={t.title} className="w-full h-full object-cover" />
            </div>
          )}
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--eleven-text-secondary)' }}>{t.content}</p>
        </div>

        <div className="flex items-center gap-4 py-3 border-t border-b" style={{ borderColor: 'var(--eleven-border)' }}>
          <button onClick={handleAmen} className={`flex items-center gap-1.5 text-xs font-medium transition-all duration-300 ${hasReacted ? 'text-red-500 scale-105 font-semibold' : 'text-stone-400 hover:text-red-500'}`}><Heart size={14} fill={hasReacted ? 'currentColor' : 'none'} className={`transition-transform duration-300 ${hasReacted ? 'scale-110 text-red-500' : ''}`} /> {amenCount} {hasReacted ? 'Reacted' : 'Reaction'}</button>
          <button onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-foreground" style={{ color: 'var(--eleven-text-muted)' }}><MessageCircle size={14} /> {comments.length} Comments</button>
          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--eleven-text-muted)' }}>Viewed {viewCount} times</span>
        </div>

        <div className="mt-6 space-y-4">
          <h3 id="comments-section" className="font-display font-semibold text-base" style={{ color: 'var(--eleven-text)' }}>Comments</h3>
          {isAuthenticated ? (
            <form onSubmit={handlePostComment} className="space-y-3">
              <Textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write an encouraging word..." required rows={2} className="text-xs resize-none" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="anon-comment" checked={isAnonymous} onCheckedChange={v => setIsAnonymous(v as boolean)} />
                  <Label htmlFor="anon-comment" className="text-xs font-normal cursor-pointer">Comment anonymously</Label>
                </div>
                <Button type="submit" size="sm" className="rounded-lg text-xs" style={{ background: 'var(--eleven-accent)' }} disabled={submitting}>{submitting ? 'Posting...' : 'Post Comment'}</Button>
              </div>
            </form>
          ) : (
            <div className="p-3 bg-stone-50/50 rounded-lg text-center"><p className="text-xs" style={{ color: 'var(--eleven-text-secondary)' }}>Please <Link to="/login" className="font-semibold underline" style={{ color: 'var(--eleven-accent)' }}>Sign In</Link> to post an encouraging comment.</p></div>
          )}
          <div className="space-y-3 pt-2">
            {comments.length > 0 ? (
              comments.map(c => (
                <div key={c.id} className="p-3 rounded-lg bg-stone-50/50 border" style={{ borderColor: 'var(--eleven-border)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold" style={{ color: 'var(--eleven-text)' }}>{c.is_anonymous ? 'Anonymous' : (c.author_name ?? 'User')}</span>
                    <span className="text-[10px]" style={{ color: 'var(--eleven-text-muted)' }}>&middot; {timeAgo(c.created_at)}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--eleven-text-secondary)' }}>{c.content}</p>
                </div>
              ))
            ) : <p className="text-xs text-center py-4" style={{ color: 'var(--eleven-text-muted)' }}>No comments yet. Leave a word of encouragement!</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
