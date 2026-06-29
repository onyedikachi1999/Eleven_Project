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
import { Heart, MessageCircle, Bookmark, Share2, Search, PenLine, Play, HandHeart, Flame, Briefcase, UserPlus, Church, Sparkles } from 'lucide-react'

const categoryIcons: Record<string, typeof Heart> = {
  healing: HandHeart, finance: Briefcase, family: UserPlus,
  career: Sparkles, deliverance: Flame, general: Church,
}
const categoryColors: Record<string, { bg: string; text: string }> = {
  healing: { bg: '#E8D5C0', text: '#8B6914' },
  finance: { bg: '#D4E0CC', text: '#4A6B3A' },
  family: { bg: '#D4E0F0', text: '#2E5A8B' },
  career: { bg: '#E8D5E0', text: '#6B3A5A' },
  deliverance: { bg: '#F0E8D4', text: '#8B6B14' },
  general: { bg: '#E8E4DE', text: '#6B6560' },
}
const categories = ['all', 'healing', 'finance', 'family', 'career', 'deliverance', 'general']
const sorts = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Viewed' },
  { value: 'mostPrayed', label: 'Most Prayed' },
]

function timeAgo(date: string) {
  const d = new Date(date), now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return d.toLocaleDateString()
}

function TestimonyCard({ t }: { t: any }) {
  const CatIcon = categoryIcons[t.category] ?? Heart
  const catColor = categoryColors[t.category] ?? categoryColors.general
  const handleAmen = () => { testimonyApi.amen(t.id).catch(() => {}) }
  return (
    <div className="group bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderLeft: `3px solid ${catColor.bg}` }}>
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
          <button onClick={handleAmen} className="flex items-center gap-1 text-xs font-medium transition-colors hover:text-red-500" style={{ color: 'var(--eleven-text-muted)' }}><Heart size={14} /> {t.amen_count}</button>
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--eleven-text-muted)' }}><MessageCircle size={14} /> {t.prayer_count}</span>
          <span className="ml-auto flex items-center gap-3"><Bookmark size={14} style={{ color: 'var(--eleven-text-muted)' }} className="cursor-pointer hover:text-foreground" /><Share2 size={14} style={{ color: 'var(--eleven-text-muted)' }} className="cursor-pointer hover:text-foreground" /></span>
        </div>
      </div>
    </div>
  )
}

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

  const load = () => {
    setIsLoading(true)
    const params: Record<string, string> = { sort: activeSort, limit: '20' }
    if (activeCategory !== 'all') params.category = activeCategory
    testimonyApi.list(params).then(r => { setTestimonies(r.results ?? r); setIsLoading(false) }).catch(() => setIsLoading(false))
  }

  useEffect(() => { load() }, [activeCategory, activeSort])

  const filtered = testimonies.filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.content.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="py-10 px-4 sm:px-6" style={{ background: '#F5F0EB' }}>
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
          filtered.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{filtered.map(t => <TestimonyCard key={t.id} t={t} />)}</div> :
          <div className="text-center py-20"><p className="text-lg font-medium mb-2" style={{ color: 'var(--eleven-text)' }}>No testimonies found</p><p className="text-sm" style={{ color: 'var(--eleven-text-secondary)' }}>{search ? 'Try a different search term' : 'Be the first to share your story!'}</p></div>}
      </div>
    </div>
  )
}
