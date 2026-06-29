import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { prayerApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { HandHeart, Check, Radio, TrendingUp } from 'lucide-react'

const categoryColors: Record<string, { bg: string; text: string }> = {
  healing: { bg: '#E8D5C0', text: '#8B6914' }, finance: { bg: '#D4E0CC', text: '#4A6B3A' },
  family: { bg: '#D4E0F0', text: '#2E5A8B' }, career: { bg: '#E8D5E0', text: '#6B3A5A' },
  deliverance: { bg: '#F0E8D4', text: '#8B6B14' }, general: { bg: '#E8E4DE', text: '#6B6560' },
}
const urgencyColors: Record<string, { dot: string; label: string }> = {
  low: { dot: '#A39E98', label: 'Low' }, medium: { dot: '#D4A843', label: 'Medium' }, high: { dot: '#C75B5B', label: 'High' },
}

function timeAgo(date: string) {
  const d = new Date(date), now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return d.toLocaleDateString()
}

function PrayerCard({ p, onUpdate }: { p: any; onUpdate: () => void }) {
  const { isAuthenticated } = useAuth()
  const [hasPrayed, setHasPrayed] = useState(false)
  const catColor = categoryColors[p.category] ?? categoryColors.general
  const urgency = urgencyColors[p.urgency] ?? urgencyColors.low

  useEffect(() => {
    if (isAuthenticated) prayerApi.checkPrayed(p.id).then(setHasPrayed).catch(() => {})
  }, [isAuthenticated, p.id])

  const handlePray = async () => {
    if (!isAuthenticated) { toast('Please sign in to pray'); return }
    try {
      const res = await prayerApi.prayFor(p.id)
      if (res.success) { setHasPrayed(true); onUpdate() }
      toast(res.message)
    } catch (err: any) { toast.error(err.message) }
  }

  return (
    <div className="bg-white rounded-xl p-5 transition-all duration-300 hover:shadow-md" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderLeft: `3px solid var(--eleven-prayer)` }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: 'var(--eleven-surface-elevated)', color: 'var(--eleven-text-secondary)' }}>{p.is_anonymous ? 'Anonymous' : (p.author_name ?? 'User')}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: catColor.bg, color: catColor.text }}>{p.category}</span>
        <span className="ml-auto flex items-center gap-1 text-[10px] font-medium" style={{ color: urgency.dot }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: urgency.dot }} />{urgency.label}</span>
      </div>
      <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--eleven-text)' }}>{p.content}</p>
      <div className="flex items-center justify-between">
        <Button
          variant={hasPrayed ? "default" : "outline"}
          size="sm"
          className="rounded-full text-xs font-semibold h-8"
          style={hasPrayed ? { background: 'var(--eleven-prayer)', color: 'white' } : { borderColor: 'var(--eleven-prayer)', color: 'var(--eleven-prayer)' }}
          onClick={handlePray}
        >
          {hasPrayed ? <Check size={13} className="mr-1" /> : <HandHeart size={13} className="mr-1" />}
          {hasPrayed ? 'Prayed' : 'I Prayed'} ({p.prayer_count})
        </Button>
        <span className="text-xs" style={{ color: 'var(--eleven-text-muted)' }}>{timeAgo(p.created_at)}</span>
      </div>
    </div>
  )
}

function SubmitPrayerForm({ onSuccess }: { onSuccess: () => void }) {
  const { isAuthenticated } = useAuth()
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')
  const [urgency, setUrgency] = useState('low')
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) { toast('Please sign in first'); return }
    if (!content.trim()) return
    setSubmitting(true)
    try {
      await prayerApi.create({ content: content.trim(), category, urgency, is_anonymous: isAnonymous })
      setContent(''); setCategory('general'); setUrgency('low'); setIsAnonymous(true)
      toast('Prayer request submitted!')
      onSuccess()
    } catch (err: any) { toast.error(err.message) }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea placeholder="Share your prayer request..." value={content} onChange={e => setContent(e.target.value)} required minLength={5} rows={4} className="resize-y text-sm" />
      <div className="grid grid-cols-2 gap-2">
        <Select value={category} onValueChange={setCategory}><SelectTrigger className="text-xs h-9"><SelectValue placeholder="Category" /></SelectTrigger><SelectContent>{['healing', 'finance', 'family', 'career', 'deliverance', 'general'].map(c => <SelectItem key={c} value={c} className="text-xs capitalize">{c}</SelectItem>)}</SelectContent></Select>
        <Select value={urgency} onValueChange={setUrgency}><SelectTrigger className="text-xs h-9"><SelectValue placeholder="Urgency" /></SelectTrigger><SelectContent><SelectItem value="low" className="text-xs">Low</SelectItem><SelectItem value="medium" className="text-xs">Medium</SelectItem><SelectItem value="high" className="text-xs">High</SelectItem></SelectContent></Select>
      </div>
      <div className="flex items-center gap-2"><Checkbox id="anon" checked={isAnonymous} onCheckedChange={v => setIsAnonymous(v as boolean)} /><Label htmlFor="anon" className="text-xs font-normal cursor-pointer">Post anonymously</Label></div>
      <Button type="submit" className="w-full rounded-lg text-xs font-semibold h-9" style={{ background: 'var(--eleven-prayer)' }} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Prayer Request'}</Button>
    </form>
  )
}

export default function PrayerRoom() {
  const [activeTab, setActiveTab] = useState<'active' | 'answered'>('active')
  const [activeCategory, setActiveCategory] = useState('all')
  const [prayers, setPrayers] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const load = () => {
    setIsLoading(true)
    if (activeTab === 'active') {
      const params: Record<string, string> = { limit: '20' }
      if (activeCategory !== 'all') params.category = activeCategory
      prayerApi.list(params).then(r => { setPrayers(r.results ?? r); setIsLoading(false) }).catch(() => setIsLoading(false))
    } else {
      prayerApi.answered().then(r => { setPrayers(r); setIsLoading(false) }).catch(() => setIsLoading(false))
    }
    prayerApi.stats().then(setStats).catch(() => {})
  }

  useEffect(() => { load() }, [activeTab, activeCategory])

  return (
    <div>
      <div className="py-12 px-4 sm:px-6 text-white" style={{ background: 'linear-gradient(135deg, #7B8B6F 0%, #8B9B7F 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">Prayer Room</h1>
          <p className="text-sm sm:text-base text-white/80 mb-6">Submit requests, join others in prayer, and mark miracles as answered.</p>
          <div className="flex flex-wrap gap-6">
            {[{ label: 'Active Requests', value: stats?.active ?? 0, icon: Radio }, { label: 'Prayers Offered', value: (stats?.total ?? 0) * 12 + 391, icon: HandHeart }, { label: 'Answered', value: stats?.answered ?? 0, icon: TrendingUp }].map(s => (
              <div key={s.label} className="flex items-center gap-2"><s.icon size={18} className="text-white/70" /><div><p className="font-display text-xl font-bold">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</p><p className="text-[10px] uppercase tracking-wider text-white/60">{s.label}</p></div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-4">
              {(['active', 'answered'] as const).map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-xs font-medium capitalize transition-colors ${activeTab === tab ? 'text-white' : 'hover:bg-gray-100'}`} style={activeTab === tab ? { background: 'var(--eleven-prayer)' } : { color: 'var(--eleven-text-secondary)' }}>{tab}</button>)}
              <div className="ml-auto flex gap-1">
                {['all', 'healing', 'finance', 'family', 'career', 'deliverance'].map(cat => <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-2.5 py-1 rounded-full text-[10px] font-medium capitalize transition-colors ${activeCategory === cat ? 'text-white' : 'hover:bg-gray-100'}`} style={activeCategory === cat ? { background: 'var(--eleven-accent)' } : { color: 'var(--eleven-text-muted)' }}>{cat}</button>)}
              </div>
            </div>
            <div className="space-y-4">{isLoading ? [1,2,3,4].map(i => <Skeleton key={i} className="h-36 rounded-xl" />) : prayers.length > 0 ? prayers.map(p => <PrayerCard key={p.id} p={p} onUpdate={load} />) : <div className="text-center py-16"><p className="text-lg font-medium" style={{ color: 'var(--eleven-text)' }}>No {activeTab} prayers yet</p></div>}</div>
          </div>
          <div className="lg:w-80 space-y-6">
            <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h3 className="font-display text-lg font-semibold mb-3" style={{ color: 'var(--eleven-text)' }}>Submit Prayer Request</h3>
              <SubmitPrayerForm onSuccess={load} />
            </div>
            <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h3 className="font-display text-base font-semibold mb-3" style={{ color: 'var(--eleven-text)' }}>This Week</h3>
              <div className="space-y-3">
                {[{ label: 'New requests', value: `+${stats?.active ?? 0}` }, { label: 'Prayers offered', value: `+${(stats?.total ?? 0) * 12 + 391}` }, { label: 'Answered', value: `+${stats?.answered ?? 0}`, color: 'var(--eleven-success)' }].map(s => (
                  <div key={s.label} className="flex justify-between items-center"><span className="text-xs" style={{ color: 'var(--eleven-text-secondary)' }}>{s.label}</span><span className="text-sm font-semibold" style={{ color: (s as any).color ?? 'var(--eleven-text)' }}>{s.value}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
