import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { testimonyApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Search, PenLine, Play, HandHeart, Flame, Briefcase, UserPlus, Church, Sparkles } from 'lucide-react'
import { TestimonyCard, TestimonyDetailModal, categoryIcons, categoryColors } from '@/components/TestimonyCardShared'

const categories = ['all', 'healing', 'finance', 'family', 'career', 'deliverance', 'general']
const sorts = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Viewed' },
  { value: 'mostPrayed', label: 'Most Prayed' },
]



function SubmitTestimonyModal({ onSuccess }: { onSuccess: () => void }) {
  const { isAuthenticated } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')
  const [type, setType] = useState('text')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) { toast('Please sign in first'); return }
    if (!title.trim() || !content.trim()) return
    setSubmitting(true)
    try {
      await testimonyApi.create({ title: title.trim(), content: content.trim(), category, type, is_anonymous: isAnonymous })
      setOpen(false); setTitle(''); setContent(''); setCategory('general'); setType('text'); setIsAnonymous(false)
      toast('Testimony submitted! It will be reviewed shortly.')
      onSuccess()
    } catch (err: any) { toast.error(err.message) }
    setSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-full font-medium text-xs" style={{ background: 'var(--eleven-accent)' }}><PenLine size={14} className="mr-1.5" />Share Yours</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-display text-xl">Share Your Testimony</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Give your testimony a title" required minLength={3} className="mt-1" /></div>
          <div><Label>Category</Label><Select value={category} onValueChange={setCategory}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{categories.filter(c => c !== 'all').map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Type</Label><div className="flex gap-2 mt-1">{['text', 'video', 'audio'].map(t => <button key={t} type="button" onClick={() => setType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${type === t ? 'text-white' : 'bg-gray-100 hover:bg-gray-200'}`} style={type === t ? { background: 'var(--eleven-accent)' } : {}}>{t}</button>)}</div></div>
          <div><Label>Your Story</Label><Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Share what God has done in your life..." required minLength={10} rows={5} className="mt-1 resize-y" /></div>
          <div className="flex items-center gap-2"><Checkbox id="anon" checked={isAnonymous} onCheckedChange={v => setIsAnonymous(v as boolean)} /><Label htmlFor="anon" className="text-sm font-normal cursor-pointer">Post anonymously</Label></div>
          <Button type="submit" className="w-full rounded-lg font-semibold" style={{ background: 'var(--eleven-accent)' }} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit for Review'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function TestimonyHub() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeSort, setActiveSort] = useState('recent')
  const [search, setSearch] = useState('')
  const [testimonies, setTestimonies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTestimony, setSelectedTestimony] = useState<any>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const load = () => {
    setIsLoading(true)
    const params: Record<string, string> = { sort: activeSort, limit: '20' }
    if (activeCategory !== 'all') params.category = activeCategory
    testimonyApi.list(params).then(r => {
      const results = r.results ?? r
      setTestimonies(results)
      setIsLoading(false)
      if (selectedTestimony) {
        const updated = results.find((item: any) => item.id === selectedTestimony.id)
        if (updated) setSelectedTestimony(updated)
      }
    }).catch(() => setIsLoading(false))
  }

  const loadWithoutSpinner = () => {
    const params: Record<string, string> = { sort: activeSort, limit: '20' }
    if (activeCategory !== 'all') params.category = activeCategory
    testimonyApi.list(params).then(r => {
      const results = r.results ?? r
      setTestimonies(results)
      if (selectedTestimony) {
        const updated = results.find((item: any) => item.id === selectedTestimony.id)
        if (updated) setSelectedTestimony(updated)
      }
    }).catch(() => {})
  }

  const handleToggleReaction = async (testimonyId: number) => {
    if (!isAuthenticated) {
      toast.error('Please sign in first to react')
      return
    }

    let previousTestimony: any = null
    setTestimonies(prev => prev.map(t => {
      if (t.id === testimonyId) {
        previousTestimony = { ...t }
        const nextReacted = !t.has_reacted
        return {
          ...t,
          has_reacted: nextReacted,
          amen_count: nextReacted ? t.amen_count + 1 : Math.max(0, t.amen_count - 1)
        }
      }
      return t
    }))

    setSelectedTestimony(prev => {
      if (prev && prev.id === testimonyId) {
        const nextReacted = !prev.has_reacted
        return {
          ...prev,
          has_reacted: nextReacted,
          amen_count: nextReacted ? prev.amen_count + 1 : Math.max(0, prev.amen_count - 1)
        }
      }
      return prev
    })

    try {
      const res = await testimonyApi.amen(testimonyId)
      if (res) {
        setTestimonies(prev => prev.map(t => {
          if (t.id === testimonyId) {
            return {
              ...t,
              has_reacted: res.reacted,
              amen_count: res.amen_count
            }
          }
          return t
        }))
        setSelectedTestimony(prev => {
          if (prev && prev.id === testimonyId) {
            return {
              ...prev,
              has_reacted: res.reacted,
              amen_count: res.amen_count
            }
          }
          return prev
        })
      }
    } catch (err) {
      if (previousTestimony) {
        setTestimonies(prev => prev.map(t => t.id === testimonyId ? previousTestimony : t))
        setSelectedTestimony(prev => (prev && prev.id === testimonyId) ? previousTestimony : prev)
      }
      toast.error('Failed to update reaction')
    }
  }

  useEffect(() => { load() }, [activeCategory, activeSort])

  const filtered = testimonies.filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.content.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="py-10 px-4 sm:px-6 animate-page-transition" style={{ background: 'var(--eleven-surface-elevated)' }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--eleven-text)' }}>Testimony Hub</h1>
          <p className="text-sm sm:text-base" style={{ color: 'var(--eleven-text-secondary)' }}>Read, watch, and share stories of faith, breakthrough, and transformation.</p>
        </div>
      </div>
      <div className="sticky top-16 z-30 bg-white border-b px-4 sm:px-6 py-3" style={{ borderColor: 'var(--eleven-border)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {categories.map(cat => <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors ${activeCategory === cat ? 'text-white' : 'hover:bg-gray-100'}`} style={activeCategory === cat ? { background: 'var(--eleven-accent)' } : { color: 'var(--eleven-text-secondary)' }}>{cat}</button>)}
          </div>
          <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--eleven-text-muted)' }} /><Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs rounded-full w-full sm:w-48" /></div>
            <Select value={activeSort} onValueChange={setActiveSort}><SelectTrigger className="h-8 text-xs rounded-full w-32"><SelectValue /></SelectTrigger><SelectContent>{sorts.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select>
            <SubmitTestimonyModal onSuccess={load} />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {isLoading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-72 rounded-xl" />)}</div> :
          filtered.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{filtered.map(t => <TestimonyCard key={t.id} t={t} onSelect={() => { setSelectedTestimony(t); setDetailOpen(true) }} onAmen={handleToggleReaction} />)}</div> :
          <div className="text-center py-20"><p className="text-lg font-medium mb-2" style={{ color: 'var(--eleven-text)' }}>No testimonies found</p><p className="text-sm" style={{ color: 'var(--eleven-text-secondary)' }}>{search ? 'Try a different search term' : 'Be the first to share your story!'}</p></div>}
      </div>

      {selectedTestimony && (
        <TestimonyDetailModal
          t={selectedTestimony}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onUpdate={(id) => id ? handleToggleReaction(id) : loadWithoutSpinner()}
        />
      )}
    </div>
  )
}
