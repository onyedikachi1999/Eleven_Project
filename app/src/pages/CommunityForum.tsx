import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { forumApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Church, Heart, UserPlus, Briefcase, HandHeart, Sparkles, MessageSquare, Eye, Clock, Pin, Plus } from 'lucide-react'

const forumCategories = [
  { value: 'all', label: 'All Topics', icon: Sparkles, color: '#6B6560' },
  { value: 'faith', label: 'Faith & Encouragement', icon: Church, color: '#C4956A' },
  { value: 'life', label: 'Life Challenges', icon: Heart, color: '#7B8B6F' },
  { value: 'relationships', label: 'Relationships', icon: UserPlus, color: '#8B7BB5' },
  { value: 'career_forum', label: 'Career & Purpose', icon: Briefcase, color: '#5B9BC7' },
  { value: 'prayer', label: 'Prayer Requests', icon: HandHeart, color: '#C75B5B' },
  { value: 'general', label: 'General', icon: Sparkles, color: '#6B6560' },
]

function timeAgo(date: string) {
  const d = new Date(date), now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return d.toLocaleDateString()
}

function TopicRow({ topic }: { topic: any }) {
  const cat = forumCategories.find(c => c.value === topic.category) ?? forumCategories[0]
  const Icon = cat.icon
  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 transition-all hover:shadow-md cursor-pointer flex gap-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${cat.color}15` }}><Icon size={18} style={{ color: cat.color }} /></div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {topic.is_pinned && <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded"><Pin size={8} /> PINNED</span>}
          <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--eleven-text)' }}>{topic.title}</h3>
        </div>
        <p className="text-xs line-clamp-2 mb-2" style={{ color: 'var(--eleven-text-secondary)' }}>{topic.content}</p>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--eleven-text-muted)' }}>
          <span>{topic.author_name ?? 'User'}</span>
          <span className="flex items-center gap-1"><MessageSquare size={10} /> {topic.reply_count}</span>
          <span className="flex items-center gap-1"><Eye size={10} /> {topic.view_count}</span>
          <span className="flex items-center gap-1"><Clock size={10} /> {timeAgo(topic.created_at)}</span>
        </div>
      </div>
    </div>
  )
}

function NewTopicDialog({ onSuccess }: { onSuccess: () => void }) {
  const { isAuthenticated } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) { toast('Please sign in first'); return }
    if (!title.trim() || !content.trim()) return
    setSubmitting(true)
    try {
      await forumApi.createTopic({ title: title.trim(), content: content.trim(), category })
      setOpen(false); setTitle(''); setContent(''); setCategory('general')
      toast('Topic created!')
      onSuccess()
    } catch (err: any) { toast.error(err.message) }
    setSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-full font-medium text-xs" style={{ background: 'var(--eleven-accent)' }}><Plus size={14} className="mr-1.5" />New Discussion</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle className="font-display text-xl">Start a Discussion</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="What's on your mind?" required minLength={3} className="mt-1" /></div>
          <div><Label>Category</Label><Select value={category} onValueChange={setCategory}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{forumCategories.filter(c => c.value !== 'all').map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Content</Label><Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Share your thoughts..." required minLength={5} rows={5} className="mt-1 resize-y" /></div>
          <Button type="submit" className="w-full rounded-lg font-semibold" style={{ background: 'var(--eleven-accent)' }} disabled={submitting}>{submitting ? 'Posting...' : 'Post Discussion'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function CommunityForum() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [topics, setTopics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = () => {
    setIsLoading(true)
    const params: Record<string, string> = { limit: '30' }
    if (activeCategory !== 'all') params.category = activeCategory
    forumApi.list(params).then(r => { setTopics(r.results ?? r); setIsLoading(false) }).catch(() => setIsLoading(false))
  }

  useEffect(() => { load() }, [activeCategory])

  return (
    <div>
      <div className="py-10 px-4 sm:px-6" style={{ background: 'var(--eleven-bg)' }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--eleven-text)' }}>Community</h1>
          <p className="text-sm sm:text-base" style={{ color: 'var(--eleven-text-secondary)' }}>Discuss faith, life, and everything in between.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64 flex-shrink-0">
            <div className="space-y-1">
              {forumCategories.map(cat => {
                const Icon = cat.icon
                return <button key={cat.value} onClick={() => setActiveCategory(cat.value)} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeCategory === cat.value ? 'text-white' : 'hover:bg-black/5'}`} style={activeCategory === cat.value ? { background: 'var(--eleven-accent)' } : { color: 'var(--eleven-text-secondary)' }}><Icon size={16} />{cat.label}</button>
              })}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--eleven-text)' }}>{forumCategories.find(c => c.value === activeCategory)?.label ?? 'All Topics'}</h2>
              <NewTopicDialog onSuccess={load} />
            </div>
            <div className="space-y-3">{isLoading ? [1,2,3,4,5].map(i => <Skeleton key={i} className="h-24 rounded-xl" />) : topics.length > 0 ? topics.map(t => <TopicRow key={t.id} topic={t} />) : <div className="text-center py-16"><p className="text-lg font-medium" style={{ color: 'var(--eleven-text)' }}>No discussions yet</p></div>}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
