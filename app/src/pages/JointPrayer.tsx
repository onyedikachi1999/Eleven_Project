import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router'
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
import { Radio, Users, Lock, Globe, Plus, HandHeart, Flame, Briefcase, UserPlus, Church, Sparkles, Clock } from 'lucide-react'


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
  const { isAuthenticated, user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [duration, setDuration] = useState('30')
  const [isLive, setIsLive] = useState(false)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const isPremium = isAdmin || user?.subscription_plan === 'premium'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please sign in first')
      return
    }
    if (!isPremium) {
      toast.error('Only Premium members can schedule live prayer sessions.')
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

        {!isAuthenticated ? (
          <div className="py-6 text-center space-y-4">
            <p className="text-sm text-stone-600">Please sign in to schedule or host live prayer sessions.</p>
            <Button className="rounded-lg text-white" style={{ background: 'var(--eleven-accent)' }} onClick={() => { setOpen(false); navigate('/login'); }}>
              Sign In
            </Button>
          </div>
        ) : !isPremium ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-2xl shadow-sm">
              👑
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-lg font-bold text-stone-800">Premium Feature</h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                Scheduling and hosting live prayer sessions is exclusively reserved for <strong>Premium</strong> members.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Button className="w-full rounded-lg text-white font-semibold" style={{ background: 'var(--eleven-accent)' }} onClick={() => { setOpen(false); navigate('/pricing'); }}>
                Upgrade to Premium
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="text-xs text-stone-500">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
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
            <Button type="submit" className="w-full rounded-lg font-semibold text-white" style={{ background: 'var(--eleven-accent)' }} disabled={submitting}>
              {submitting ? 'Creating...' : 'Schedule Session'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

function CreateCircleModal({ onSuccess }: { onSuccess: () => void }) {
  const { isAuthenticated, user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('general')
  const [isPublic, setIsPublic] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const canCreateCircle = isAdmin || user?.subscription_plan === 'regular' || user?.subscription_plan === 'premium'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please sign in first')
      return
    }
    if (!canCreateCircle) {
      toast.error('Only Regular and Premium members can create prayer circles.')
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

        {!isAuthenticated ? (
          <div className="py-6 text-center space-y-4">
            <p className="text-sm text-stone-600">Please sign in to create and manage prayer circles.</p>
            <Button className="rounded-lg text-white" style={{ background: 'var(--eleven-accent)' }} onClick={() => { setOpen(false); navigate('/login'); }}>
              Sign In
            </Button>
          </div>
        ) : !canCreateCircle ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto text-2xl shadow-sm">
              ✨
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-lg font-bold text-stone-800">Regular & Premium Feature</h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                Creating and leading prayer circles is available to <strong>Regular</strong> and <strong>Premium</strong> members.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Button className="w-full rounded-lg text-white font-semibold" style={{ background: 'var(--eleven-accent)' }} onClick={() => { setOpen(false); navigate('/pricing'); }}>
                Upgrade to Regular
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="text-xs text-stone-500">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
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
            <Button type="submit" className="w-full rounded-lg font-semibold text-white" style={{ background: 'var(--eleven-accent)' }} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Circle'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function JointPrayer() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [schedules, setSchedules] = useState<any[]>([])
  const [pastSchedules, setPastSchedules] = useState<any[]>([])
  const [circles, setCircles] = useState<any[]>([])
  const [liveSession, setLiveSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadSchedules = () => {
    scheduleApi.upcoming().then(r => setSchedules(r ? (Array.isArray(r) ? r : (r.results ?? [])) : [])).catch(() => {})
    scheduleApi.live().then(r => setLiveSession(r)).catch(() => {})
    scheduleApi.past().then(r => setPastSchedules(r ? (Array.isArray(r) ? r : (r.results ?? [])) : [])).catch(() => {})
  }

  const loadCircles = () => {
    circleApi.list().then(r => { setCircles(r ? (Array.isArray(r) ? r : (r.results ?? [])) : []) }).catch(() => {})
  }

  useEffect(() => {
    setLoading(true)
    const p1 = scheduleApi.upcoming().then(r => setSchedules(r ? (Array.isArray(r) ? r : (r.results ?? [])) : [])).catch(() => {})
    const p2 = scheduleApi.live().then(r => setLiveSession(r)).catch(() => {})
    const p3 = circleApi.list().then(r => setCircles(r ? (Array.isArray(r) ? r : (r.results ?? [])) : [])).catch(() => {})
    const p4 = scheduleApi.past().then(r => setPastSchedules(r ? (Array.isArray(r) ? r : (r.results ?? [])) : [])).catch(() => {})
    
    Promise.all([p1, p2, p3, p4]).finally(() => setLoading(false))
  }, [])

  const handleJoinSession = (sessionData: any) => {
    const sessionObj = typeof sessionData === 'string'
      ? { id: 's1', title: sessionData }
      : sessionData
    navigate(`/live-room/${sessionObj.id || 's1'}`)
  };

  const handleScheduleAction = (s: any) => {
    navigate(`/live-room/${s.id || 's1'}`)
  };

  const handleSetReminder = (e: React.MouseEvent, title: string) => {
    e.stopPropagation()
    toast.success(`Reminder set for: ${title}`)
  }

  const defaultSampleSessions = [
    { id: 's1', title: 'Morning Grace Prayer Watch', description: 'Starting the day in worship, intercession, and personal prayer.', scheduled_at: new Date().toISOString(), duration: 30, participant_count: 42, is_live: true, host_name: 'Pastor David' },
    { id: 's2', title: 'Healing & Deliverance Fellowship', description: 'Gathering to pray for the sick, brokenhearted, and needy.', scheduled_at: new Date(Date.now() + 3600000).toISOString(), duration: 45, participant_count: 28, is_live: true, host_name: 'Sister Sarah' },
    { id: 's3', title: 'Midnight Breakthrough Vigil', description: 'Late-night prayer watch standing in agreement for miracles.', scheduled_at: new Date(Date.now() + 14400000).toISOString(), duration: 60, participant_count: 65, is_live: false, host_name: 'Brother John' },
  ]

  const displaySchedules = (Array.isArray(schedules) && schedules.length > 0) ? schedules : defaultSampleSessions

  return (
    <div>
      <div className="py-10 px-4 sm:px-6" style={{ background: 'var(--eleven-bg)' }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--eleven-text)' }}>Joint Prayer</h1>
          <p className="text-sm sm:text-base" style={{ color: 'var(--eleven-text-secondary)' }}>Pray together in real-time. Join scheduled live sessions or create your own prayer circle.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        {/* Active Live Session Banner */}
        <section>
          <div className="flex items-center gap-2 mb-4"><Radio size={18} className="text-red-500 animate-pulse" /><h2 className="font-display text-xl font-semibold" style={{ color: 'var(--eleven-text)' }}>Live Audio Prayer Watch</h2></div>
          <div className="rounded-2xl p-6 text-white shadow-xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider mb-2 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> BROADCASTING NOW
                </div>
                <h3 className="font-display text-xl font-bold mb-1">{liveSession?.title || 'Global Live Prayer & Intercession Room'}</h3>
                <p className="text-sm text-stone-300 max-w-xl">{liveSession?.description || 'Believers gathered live across the world praying in agreement for healing, peace, and breakthroughs.'}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-stone-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold"><Users size={13} /> {liveSession?.participant_count || 142} praying live</span>
                </div>
              </div>
              <Button
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs h-10 px-6 rounded-full shadow-lg hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                onClick={() => handleJoinSession(liveSession || 'Global Live Prayer Room')}
              >
                <Radio size={15} className="animate-pulse" /> Join Live Audio Room
              </Button>
            </div>
          </div>
        </section>

        {/* Scheduled Sessions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold mb-0" style={{ color: 'var(--eleven-text)' }}>Scheduled Live Sessions</h2>
            <CreateSessionModal onSuccess={loadSchedules} />
          </div>
          {loading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displaySchedules.map(s => (
                <div key={s.id} className="bg-white rounded-xl p-5 transition-all hover:shadow-md border border-stone-200 flex flex-col justify-between" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full" style={{ background: s.is_live ? '#fee2e2' : 'var(--eleven-surface-elevated)', color: s.is_live ? '#dc2626' : 'var(--eleven-text-secondary)' }}>
                        {s.is_live ? '● LIVE NOW' : formatDate(s.scheduled_at)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-400">
                        <span className="flex items-center gap-1 font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100"><Clock size={11} /> {s.duration || 30}m</span>
                        <span>{formatTime(s.scheduled_at)}</span>
                      </div>
                    </div>
                    <h3 className="font-display text-base font-semibold mb-1" style={{ color: 'var(--eleven-text)' }}>{s.title}</h3>
                    <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--eleven-text-secondary)' }}>{s.description}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between pt-3 border-t border-stone-100 mb-3">
                      <span className="text-xs flex items-center gap-1 text-stone-400"><Users size={12} /> {s.participant_count || 12} joining</span>
                      {!s.is_live && (
                        <button onClick={e => handleSetReminder(e, s.title)} className="text-[11px] font-medium text-stone-500 hover:text-stone-800 underline cursor-pointer">
                          Remind Me
                        </button>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="w-full rounded-lg text-xs h-8 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      onClick={() => handleScheduleAction(s)}
                    >
                      <Radio size={13} className="animate-pulse" /> Join Live Room
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Past Sessions */}
        {pastSchedules.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-xl font-semibold mb-4" style={{ color: 'var(--eleven-text)' }}>Past Live Sessions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
              {pastSchedules.slice(0, 6).map(s => (
                <div key={s.id} className="bg-stone-50 rounded-xl p-5 border border-stone-200 flex flex-col justify-between" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-600">
                        FINISHED
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-400">
                        <span className="flex items-center gap-1 font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md"><Clock size={11} /> {s.duration || 30}m</span>
                        <span>{formatTime(s.scheduled_at)}</span>
                      </div>
                    </div>
                    <h3 className="font-display text-base font-semibold mb-1 text-stone-700">{s.title}</h3>
                    <p className="text-xs line-clamp-2 mb-3 text-stone-500">{s.description}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between pt-3 border-t border-stone-200 mb-1">
                      <span className="text-xs flex items-center gap-1 text-stone-400"><Users size={12} /> {s.participant_count || 0} participants</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
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
