import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { scheduleApi, circleApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Radio, Users, Lock, Globe, Plus, HandHeart, Flame, Briefcase, UserPlus, Church, Sparkles } from 'lucide-react'

const categoryIcons: Record<string, typeof Church> = {
  healing: HandHeart, finance: Briefcase, family: UserPlus,
  career: Sparkles, deliverance: Flame, general: Church,
}
const categoryColors: Record<string, { bg: string; text: string; light: string }> = {
  healing: { bg: '#E8D5C0', text: '#8B6914', light: '#F5F0EB' },
  finance: { bg: '#D4E0CC', text: '#4A6B3A', light: '#EEF3EB' },
  family: { bg: '#D4E0F0', text: '#2E5A8B', light: '#EBF0F5' },
  career: { bg: '#E8D5E0', text: '#6B3A5A', light: '#F3EBF0' },
  deliverance: { bg: '#F0E8D4', text: '#8B6B14', light: '#F5F0EB' },
  general: { bg: '#E8E4DE', text: '#6B6560', light: '#F0EEEB' },
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
function formatDate(date: string | null) {
  if (!date) return 'Soon'
  const d = new Date(date), now = new Date()
  if (d.toDateString() === now.toDateString()) return 'Today'
  if (new Date(now.getTime() + 86400000).toDateString() === d.toDateString()) return 'Tomorrow'
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function CreateSessionModal({ onSuccess }: { onSuccess: () => void }) {
  const { isAuthenticated } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [duration, setDuration] = useState('30')
  const [isLive, setIsLive] = useState(false)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please sign in first')
      return
    }
    if (!title.trim() || !scheduledAt) {
      toast.error('Title and Scheduled Time are required')
      return
    }

    setSubmitting(true)
    try {
      const isoDate = new Date(scheduledAt).toISOString()
      await scheduleApi.create({
        title: title.trim(),
        description: description.trim(),
        scheduled_at: isoDate,
        duration: parseInt(duration, 10) || 30,
        is_live: isLive
      })
      toast.success('Prayer session scheduled successfully!')
      setOpen(false)
      setTitle('')
      setDescription('')
      setScheduledAt('')
      setDuration('30')
      setIsLive(false)
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule session')
    }
    setSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full text-xs h-8 animate-fade-in" style={{ borderColor: 'var(--eleven-accent)', color: 'var(--eleven-accent)' }}>
          <Plus size={14} className="mr-1" /> Create Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Schedule a Prayer Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Morning Grace Prayer Watch" required minLength={3} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the focus or topic of this prayer watch..." rows={3} className="mt-1 resize-y" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduledAt">Start Date & Time</Label>
              <Input id="scheduledAt" type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input id="duration" type="number" min={5} max={360} value={duration} onChange={e => setDuration(e.target.value)} required className="mt-1" />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Checkbox id="isLive" checked={isLive} onCheckedChange={v => setIsLive(v as boolean)} />
            <Label htmlFor="isLive" className="text-sm font-normal cursor-pointer">Start as live session immediately</Label>
          </div>
          <Button type="submit" className="w-full rounded-lg font-semibold" style={{ background: 'var(--eleven-accent)' }} disabled={submitting}>
            {submitting ? 'Creating...' : 'Schedule Session'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CreateCircleModal({ onSuccess }: { onSuccess: () => void }) {
  const { isAuthenticated } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('general')
  const [isPublic, setIsPublic] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please sign in first')
      return
    }
    if (!name.trim()) {
      toast.error('Circle name is required')
      return
    }

    setSubmitting(true)
    try {
      await circleApi.create({
        name: name.trim(),
        description: description.trim(),
        category,
        is_public: isPublic
      })
      toast.success('Prayer circle created successfully!')
      setOpen(false)
      setName('')
      setDescription('')
      setCategory('general')
      setIsPublic(true)
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Failed to create prayer circle')
    }
    setSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full text-xs h-8" style={{ borderColor: 'var(--eleven-accent)', color: 'var(--eleven-accent)' }}>
          <Plus size={14} className="mr-1" /> Create Circle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Create a Prayer Circle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="circle-name">Circle Name</Label>
            <Input id="circle-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Daily Intercessors" required minLength={3} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="circle-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="circle-category" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['general', 'healing', 'finance', 'family', 'career', 'deliverance'].map(cat => (
                  <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="circle-description">Description</Label>
            <Textarea id="circle-description" value={description} onChange={e => setDescription(e.target.value)} placeholder="What is the purpose or focus of this circle?" rows={3} className="mt-1 resize-y" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Checkbox id="circle-public" checked={isPublic} onCheckedChange={v => setIsPublic(v as boolean)} />
            <Label htmlFor="circle-public" className="text-sm font-normal cursor-pointer">Make this circle public (anyone can view and join)</Label>
          </div>
          <Button type="submit" className="w-full rounded-lg font-semibold" style={{ background: 'var(--eleven-accent)' }} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Circle'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function JointPrayer() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [schedules, setSchedules] = useState<any[]>([])
  const [circles, setCircles] = useState<any[]>([])
  const [liveSession, setLiveSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadSchedules = () => {
    scheduleApi.upcoming().then(r => setSchedules(r ? (Array.isArray(r) ? r : (r.results ?? [])) : [])).catch(() => {})
    scheduleApi.live().then(r => setLiveSession(r)).catch(() => {})
  }

  const loadCircles = () => {
    circleApi.list().then(r => { setCircles(r ? (Array.isArray(r) ? r : (r.results ?? [])) : []) }).catch(() => {})
  }

  useEffect(() => {
    setLoading(true)
    const p1 = scheduleApi.upcoming().then(r => setSchedules(r ? (Array.isArray(r) ? r : (r.results ?? [])) : [])).catch(() => {})
    const p2 = scheduleApi.live().then(r => setLiveSession(r)).catch(() => {})
    const p3 = circleApi.list().then(r => setCircles(r ? (Array.isArray(r) ? r : (r.results ?? [])) : [])).catch(() => {})
    
    Promise.all([p1, p2, p3]).finally(() => setLoading(false))
  }, [])

  const handleJoinSession = (title: string) => {
    if (!isAuthenticated) {
      toast('Please sign in to join');
      navigate('/login');
      return;
    }
    toast.success(`Joined live session: ${title}`);
  };

  const handleScheduleAction = (s: any) => {
    if (!isAuthenticated) {
      toast('Please sign in first');
      navigate('/login');
      return;
    }
    if (s.is_live) {
      toast.success(`Joined session: ${s.title}`);
    } else {
      toast.success(`Reminder set for: ${s.title}`);
    }
  };

  const handleJoin = async (id: number) => {
    if (!isAuthenticated) {
      toast('Please sign in to join');
      navigate('/login');
      return;
    }
    try {
      await circleApi.join(id);
      toast('Joined circle!');
      loadCircles();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="py-10 px-4 sm:px-6" style={{ background: 'var(--eleven-bg)' }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--eleven-text)' }}>Joint Prayer</h1>
          <p className="text-sm sm:text-base" style={{ color: 'var(--eleven-text-secondary)' }}>Pray together in real-time. Join scheduled sessions or create your own prayer circle.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        {liveSession && (
          <section>
            <div className="flex items-center gap-2 mb-4"><Radio size={18} className="text-red-500 animate-pulse" /><h2 className="font-display text-xl font-semibold" style={{ color: 'var(--eleven-text)' }}>Live Now</h2></div>
            <div className="rounded-xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #7B8B6F 0%, #8B9B7F 100%)' }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-bold mb-1">{liveSession.title}</h3>
                  <p className="text-sm text-white/80">{liveSession.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-white/70"><span className="flex items-center gap-1"><Users size={12} /> {liveSession.participant_count} praying</span></div>
                </div>
                <Button className="bg-white hover:bg-white/90 font-semibold text-xs" style={{ color: '#7B8B6F' }} onClick={() => handleJoinSession(liveSession.title)}>Join Session</Button>
              </div>
            </div>
          </section>
        )}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold mb-0" style={{ color: 'var(--eleven-text)' }}>Scheduled Sessions</h2>
            <CreateSessionModal onSuccess={loadSchedules} />
          </div>
          {loading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div> :
            (Array.isArray(schedules) && schedules.length > 0) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {schedules.map(s => (
                  <div key={s.id} className="bg-white rounded-xl p-5 transition-all hover:shadow-md" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded" style={{ background: s.is_live ? '#C75B5B15' : 'var(--eleven-surface-elevated)', color: s.is_live ? 'var(--eleven-live)' : 'var(--eleven-text-secondary)' }}>{s.is_live ? 'LIVE' : formatDate(s.scheduled_at)}</div>
                      <span className="text-xs" style={{ color: 'var(--eleven-text-muted)' }}>{formatTime(s.scheduled_at)}</span>
                    </div>
                    <h3 className="font-display text-base font-semibold mb-1" style={{ color: 'var(--eleven-text)' }}>{s.title}</h3>
                    <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--eleven-text-secondary)' }}>{s.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs flex items-center gap-1" style={{ color: 'var(--eleven-text-muted)' }}><Users size={12} /> {s.participant_count} joining</span>
                      <Button variant="outline" size="sm" className="rounded-full text-xs h-7 px-3" style={{ borderColor: 'var(--eleven-prayer)', color: 'var(--eleven-prayer)' }} onClick={() => handleScheduleAction(s)}>{s.is_live ? 'Join' : 'Remind Me'}</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm" style={{ color: 'var(--eleven-text-muted)' }}>No upcoming sessions.</p>}
        </section>
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--eleven-text)' }}>Prayer Circles</h2>
            <CreateCircleModal onSuccess={loadCircles} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.isArray(circles) && circles.map(circle => {
              const CatIcon = categoryIcons[circle.category] ?? Church
              const catColor = categoryColors[circle.category] ?? categoryColors.general
              return (
                <div key={circle.id} className="bg-white rounded-xl p-5 transition-all hover:shadow-md border flex flex-col justify-between" style={{ borderColor: 'var(--eleven-border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: catColor.light }}><CatIcon size={18} style={{ color: catColor.text }} /></div>
                    <h3 className="font-display text-base font-semibold mb-1" style={{ color: 'var(--eleven-text)' }}>{circle.name}</h3>
                    <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--eleven-text-secondary)' }}>{circle.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs flex items-center gap-1" style={{ color: 'var(--eleven-text-muted)' }}><Users size={12} /> {circle.member_count} members</span>
                      <span className="flex items-center gap-1 text-[10px]" style={{ color: circle.is_public ? 'var(--eleven-success)' : 'var(--eleven-text-muted)' }}>{circle.is_public ? <Globe size={10} /> : <Lock size={10} />}{circle.is_public ? 'Public' : 'Private'}</span>
                    </div>
                  </div>
                  <Link to={`/prayer-circle/${circle.id}`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full rounded-lg text-xs h-8 transition-all hover:bg-stone-50" style={{ borderColor: 'var(--eleven-prayer)', color: 'var(--eleven-prayer)' }}>
                      View Group
                    </Button>
                  </Link>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
