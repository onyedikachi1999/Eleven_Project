import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { adminApi, testimonyApi, slideApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Shield, Users, BookOpen, HandHeart, CheckCircle, XCircle, Clock,
  Flame, Briefcase, UserPlus, Church, Sparkles, Plus, Trash2, Film, Image
} from 'lucide-react'

const categoryIcons: Record<string, typeof Church> = {
  healing: HandHeart, finance: Briefcase, family: UserPlus,
  career: Sparkles, deliverance: Flame, general: Church,
}

function timeAgo(date: string) {
  const d = new Date(date), now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return d.toLocaleDateString()
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: number | string; color: string }) {
  return (
    <div className="bg-white rounded-xl p-5 flex items-center gap-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}><Icon size={22} style={{ color }} /></div>
      <div><p className="font-display text-2xl font-bold" style={{ color: 'var(--eleven-text)' }}>{value}</p><p className="text-xs uppercase tracking-wider" style={{ color: 'var(--eleven-text-muted)' }}>{label}</p></div>
    </div>
  )
}

export default function AdminPanel() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'testimonies' | 'users' | 'slides'>('testimonies')
  const [stats, setStats] = useState<any>(null)
  const [pendingList, setPendingList] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [slides, setSlides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Form states for creating slide
  const [slideBadge, setSlideBadge] = useState('')
  const [slideTitle, setSlideTitle] = useState('')
  const [slideDesc, setSlideDesc] = useState('')
  const [slideLink, setSlideLink] = useState('')
  const [slideCta, setSlideCta] = useState('Learn More')
  const [slideBg, setSlideBg] = useState('linear-gradient(135deg, #111827 0%, #1e1b4b 100%)')
  const [slideMediaType, setSlideMediaType] = useState<'image' | 'video'>('image')
  const [slideMediaUrl, setSlideMediaUrl] = useState('')
  const [slideOrder, setSlideOrder] = useState('0')
  const [submittingSlide, setSubmittingSlide] = useState(false)

  const load = () => {
    if (user?.role !== 'admin') return
    setLoading(true)
    adminApi.stats().then(setStats).catch(() => {})
    testimonyApi.pending().then(r => { setPendingList(r); setLoading(false) }).catch(() => setLoading(false))
    adminApi.users().then(setAllUsers).catch(() => {})
    slideApi.list().then(r => setSlides(r ? (r.results ?? r) : [])).catch(() => {})
  }

  useEffect(() => { load() }, [user])

  const handleApprove = async (id: number) => {
    try { await testimonyApi.approve(id); toast('Approved!'); load() } catch (err: any) { toast.error(err.message) }
  }
  const handleDecline = async (id: number) => {
    try { await testimonyApi.decline(id); toast('Declined.'); load() } catch (err: any) { toast.error(err.message) }
  }

  const handleDeleteSlide = async (id: number) => {
    try {
      await slideApi.delete(id)
      toast.success('Slide removed successfully!')
      load()
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove slide')
    }
  }

  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slideTitle.trim() || !slideDesc.trim() || !slideMediaUrl.trim() || !slideLink.trim()) {
      toast.error('All required fields must be filled.')
      return
    }

    setSubmittingSlide(true)
    try {
      await slideApi.create({
        badge: slideBadge.trim(),
        title: slideTitle.trim(),
        description: slideDesc.trim(),
        link: slideLink.trim(),
        cta_text: slideCta.trim(),
        bg_color: slideBg.trim(),
        media_type: slideMediaType,
        media_url: slideMediaUrl.trim(),
        order: parseInt(slideOrder, 10) || 0
      })
      toast.success('New slideshow slide added successfully!')
      // Clear form
      setSlideBadge('')
      setSlideTitle('')
      setSlideDesc('')
      setSlideLink('')
      setSlideCta('Learn More')
      setSlideBg('linear-gradient(135deg, #111827 0%, #1e1b4b 100%)')
      setSlideMediaType('image')
      setSlideMediaUrl('')
      setSlideOrder('0')
      load()
    } catch (err: any) {
      toast.error(err.message || 'Failed to add slide')
    } finally {
      setSubmittingSlide(false)
    }
  }

  if (user?.role !== 'admin') {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center"><Shield size={40} className="mx-auto mb-4" style={{ color: 'var(--eleven-text-muted)' }} /><h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--eleven-text)' }}>Access Denied</h2><p className="text-sm" style={{ color: 'var(--eleven-text-secondary)' }}>This page is restricted to administrators.</p></div>
  }

  return (
    <div>
      <div className="py-8 px-4 sm:px-6" style={{ background: 'var(--eleven-dark)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-1"><Shield size={20} style={{ color: 'var(--eleven-accent)' }} /><span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: 'var(--eleven-accent)', color: 'white' }}>Admin</span></div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Admin Dashboard</h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {stats && <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Clock} label="Pending" value={stats.pendingTestimonies} color="#D4A843" />
          <StatCard icon={Users} label="Users" value={stats.totalUsers} color="#5B9BC7" />
          <StatCard icon={HandHeart} label="Active Prayers" value={stats.activePrayers} color="#7B8B6F" />
          <StatCard icon={BookOpen} label="Approved" value={stats.approvedTestimonies} color="#C4956A" />
        </div>}
        <div className="flex items-center gap-1 mb-6 border-b" style={{ borderColor: 'var(--eleven-border)' }}>
          {[
            { key: 'testimonies' as const, label: 'Pending Testimonies', icon: BookOpen },
            { key: 'users' as const, label: 'Users Directory', icon: Users },
            { key: 'slides' as const, label: 'Slideshow Board', icon: Film },
          ].map(tab =>
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors" style={{ borderColor: activeTab === tab.key ? 'var(--eleven-accent)' : 'transparent', color: activeTab === tab.key ? 'var(--eleven-text)' : 'var(--eleven-text-secondary)' }}><tab.icon size={14} />{tab.label}</button>
          )}
        </div>
        
        {activeTab === 'testimonies' && (
          loading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}</div> :
            pendingList.length > 0 ? <div className="space-y-3">{pendingList.map(t => {
              const CatIcon = categoryIcons[t.category] ?? Church
              return <div key={t.id} className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Pending</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: '#E8E4DE', color: '#6B6560' }}><CatIcon size={10} />{t.category}</span>
                      <span className="text-xs" style={{ color: 'var(--eleven-text-muted)' }}>{t.is_anonymous ? 'Anonymous' : (t.author_name ?? 'User')} &middot; {timeAgo(t.created_at)}</span>
                    </div>
                    <h3 className="font-display text-base font-semibold mb-1" style={{ color: 'var(--eleven-text)' }}>{t.title}</h3>
                    <p className="text-sm line-clamp-3" style={{ color: 'var(--eleven-text-secondary)' }}>{t.content}</p>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button size="sm" className="rounded-lg text-xs h-8 px-3" style={{ background: 'var(--eleven-success)' }} onClick={() => handleApprove(t.id)}><CheckCircle size={13} className="mr-1" /> Approve</Button>
                    <Button variant="outline" size="sm" className="rounded-lg text-xs h-8 px-3" style={{ borderColor: 'var(--eleven-live)', color: 'var(--eleven-live)' }} onClick={() => handleDecline(t.id)}><XCircle size={13} className="mr-1" /> Decline</Button>
                  </div>
                </div>
              </div>
            })}</div> : <div className="text-center py-16"><CheckCircle size={32} className="mx-auto mb-3" style={{ color: 'var(--eleven-success)' }} /><p className="text-lg font-medium" style={{ color: 'var(--eleven-text)' }}>All caught up!</p><p className="text-sm" style={{ color: 'var(--eleven-text-secondary)' }}>No pending testimonies to review.</p></div>
        )}
        
        {activeTab === 'users' && (
          allUsers.length > 0 ? <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b" style={{ borderColor: 'var(--eleven-border)' }}>{['User', 'Role', 'Plan', 'Joined', 'Last Active'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--eleven-text-muted)' }}>{h}</th>)}</tr></thead>
                <tbody>{allUsers.map(u => <tr key={u.id} className="border-b hover:bg-gray-50/50 transition-colors" style={{ borderColor: 'var(--eleven-border)' }}>
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: 'var(--eleven-accent-light)', color: 'var(--eleven-accent-dark)' }}>{(u.name ?? 'U').charAt(0).toUpperCase()}</div><div><p className="font-medium" style={{ color: 'var(--eleven-text)' }}>{u.name ?? 'Anonymous'}</p><p className="text-xs" style={{ color: 'var(--eleven-text-muted)' }}>{u.email ?? ''}</p></div></div></td>
                  <td className="px-4 py-3"><span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span></td>
                  <td className="px-4 py-3"><span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border capitalize text-stone-600 bg-stone-50">{u.subscription_plan || 'free'}</span></td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--eleven-text-secondary)' }}>{timeAgo(u.created_at)}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--eleven-text-secondary)' }}>{timeAgo(u.last_sign_in_at)}</td>
                </tr>)}</tbody>
              </table>
            </div>
          </div> : <div className="text-center py-16"><Users size={32} className="mx-auto mb-3" style={{ color: 'var(--eleven-text-muted)' }} /><p className="text-lg font-medium" style={{ color: 'var(--eleven-text)' }}>No users found</p></div>
        )}

        {activeTab === 'slides' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Slide Form */}
            <div className="bg-white rounded-xl p-5 border lg:col-span-1 h-fit space-y-4" style={{ borderColor: 'var(--eleven-border)' }}>
              <div className="flex items-center gap-1.5 border-b pb-3 mb-2" style={{ borderColor: 'var(--eleven-border)' }}>
                <Plus size={16} className="text-stone-500" />
                <h3 className="font-display font-bold text-sm" style={{ color: 'var(--eleven-text)' }}>Add Slideshow Slide</h3>
              </div>
              <form onSubmit={handleAddSlide} className="space-y-3.5">
                <div>
                  <Label htmlFor="slide-badge" className="text-xs">Badge Text</Label>
                  <Input id="slide-badge" value={slideBadge} onChange={e => setSlideBadge(e.target.value)} placeholder="e.g. Featured Event" className="text-xs mt-1" />
                </div>
                <div>
                  <Label htmlFor="slide-title" className="text-xs">Slide Title *</Label>
                  <Input id="slide-title" value={slideTitle} onChange={e => setSlideTitle(e.target.value)} placeholder="e.g. Youth Camp 2026" required className="text-xs mt-1" />
                </div>
                <div>
                  <Label htmlFor="slide-desc" className="text-xs">Description *</Label>
                  <Textarea id="slide-desc" value={slideDesc} onChange={e => setSlideDesc(e.target.value)} placeholder="Details or announcement content..." rows={3} required className="text-xs mt-1 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="slide-link" className="text-xs">Target Link *</Label>
                    <Input id="slide-link" value={slideLink} onChange={e => setSlideLink(e.target.value)} placeholder="e.g. /pricing" required className="text-xs mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="slide-cta" className="text-xs">CTA Button Text</Label>
                    <Input id="slide-cta" value={slideCta} onChange={e => setSlideCta(e.target.value)} placeholder="e.g. Learn More" className="text-xs mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="slide-bg" className="text-xs">Background Gradient</Label>
                  <Input id="slide-bg" value={slideBg} onChange={e => setSlideBg(e.target.value)} placeholder="linear-gradient(...)" className="text-xs mt-1 font-mono" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <Label htmlFor="slide-media-type" className="text-xs">Media Type</Label>
                    <Select value={slideMediaType} onValueChange={v => setSlideMediaType(v as 'image' | 'video')}>
                      <SelectTrigger id="slide-media-type" className="text-xs mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image" className="text-xs">Image</SelectItem>
                        <SelectItem value="video" className="text-xs">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="slide-order" className="text-xs">Order Index</Label>
                    <Input id="slide-order" type="number" value={slideOrder} onChange={e => setSlideOrder(e.target.value)} className="text-xs mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="slide-media-url" className="text-xs">Media URL (Image or Video) *</Label>
                  <Input id="slide-media-url" value={slideMediaUrl} onChange={e => setSlideMediaUrl(e.target.value)} placeholder="https://..." required className="text-xs mt-1" />
                </div>
                <Button type="submit" className="w-full text-white font-semibold text-xs h-9 rounded-lg mt-3" style={{ background: 'var(--eleven-accent)' }} disabled={submittingSlide}>
                  {submittingSlide ? 'Adding...' : 'Add to Slideshow'}
                </Button>
              </form>
            </div>

            {/* Slide List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 mb-2" style={{ borderColor: 'var(--eleven-border)' }}>
                <h3 className="font-display font-bold text-sm" style={{ color: 'var(--eleven-text)' }}>Active Slides ({slides.length})</h3>
              </div>
              {slides.length > 0 ? (
                <div className="space-y-3">
                  {slides.map(slide => {
                    const isVideo = slide.media_type === 'video'
                    return (
                      <div key={slide.id} className="bg-white rounded-xl p-4 border flex gap-4 items-center justify-between" style={{ borderColor: 'var(--eleven-border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-14 h-14 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                            {isVideo ? (
                              <>
                                <Film size={20} className="text-stone-400" />
                                <span className="absolute bottom-1 right-1 text-[8px] bg-black/60 text-white px-1 py-0.2 rounded font-semibold">Video</span>
                              </>
                            ) : (
                              <>
                                <img src={slide.media_url} alt="" className="w-full h-full object-cover" />
                                <span className="absolute bottom-1 right-1 text-[8px] bg-black/60 text-white px-1 py-0.2 rounded font-semibold">Img</span>
                              </>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {slide.badge && <span className="text-[8px] font-bold bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded uppercase tracking-wider">{slide.badge}</span>}
                              <span className="text-[8px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">Order: {slide.order}</span>
                            </div>
                            <h4 className="font-semibold text-xs text-stone-900 mt-1 truncate">{slide.title}</h4>
                            <p className="text-[10px] text-stone-400 truncate max-w-md">{slide.description}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteSlide(slide.id)}
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed" style={{ borderColor: 'var(--eleven-border)' }}>
                  <Film size={32} className="mx-auto mb-2 text-stone-400" />
                  <p className="text-xs font-semibold text-stone-500">No Custom Slides Added</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">Slideshow is currently displaying default hardcoded fallback slides.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
