import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { adminApi, testimonyApi, slideApi } from '@/lib/api'
import { getMediaUrl } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { LazyImage } from '@/components/LazyImage'
import {
  Shield, Users, BookOpen, HandHeart, CheckCircle, XCircle, Clock,
  Flame, Briefcase, UserPlus, Church, Sparkles, Plus, Trash2, Film,
  Image as ImageIcon, Video, Volume2, Music, Eye, Play, Heart, MessageCircle
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
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [previewTestimony, setPreviewTestimony] = useState<any | null>(null)

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

  // File Upload states
  const [mediaSource, setMediaSource] = useState<'file' | 'url'>('file')
  const [uploadingFile, setUploadingFile] = useState(false)

  const load = () => {
    if (user?.role !== 'admin' && !(user as any)?.is_staff && !(user as any)?.is_superuser) return
    setLoading(true)
    adminApi.stats().then(setStats).catch(() => {})
    testimonyApi.pending().then(r => { setPendingList(Array.isArray(r) ? r : (r.results || [])); setLoading(false) }).catch(() => setLoading(false))
    adminApi.users().then(setAllUsers).catch(() => {})
    slideApi.list().then(r => setSlides(r ? (r.results ?? r) : [])).catch(() => {})
  }

  useEffect(() => { load() }, [user])

  const handleApprove = async (id: number) => {
    setProcessingId(id)
    try {
      await testimonyApi.approve(id)
      toast.success('Testimony approved successfully! It is now live on Testimony Hub.')
      load()
      if (previewTestimony?.id === id) setPreviewTestimony(null)
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve testimony')
    } finally {
      setProcessingId(null)
    }
  }

  const handleDecline = async (id: number) => {
    setProcessingId(id)
    try {
      await testimonyApi.decline(id)
      toast.success('Testimony declined.')
      load()
      if (previewTestimony?.id === id) setPreviewTestimony(null)
    } catch (err: any) {
      toast.error(err.message || 'Failed to decline testimony')
    } finally {
      setProcessingId(null)
    }
  }

  const handlePlanChange = async (userId: number, newPlan: 'free' | 'regular' | 'premium') => {
    try {
      await adminApi.updateUserPlan(userId, newPlan)
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, subscription_plan: newPlan } : u))
      toast.success(`User subscription updated to ${newPlan}!`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update plan')
    }
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    try {
      const res = await adminApi.upload(file)
      setSlideMediaUrl(res.url)
      
      // Auto detect media type from extension
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      if (['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(ext)) {
        setSlideMediaType('video')
      } else {
        setSlideMediaType('image')
      }
      toast.success('Media file uploaded successfully!')
    } catch (err: any) {
      toast.error(err.message || 'File upload failed')
    } finally {
      setUploadingFile(false)
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
            pendingList.length > 0 ? (
              <div className="space-y-4">
                {pendingList.map(t => {
                  const CatIcon = categoryIcons[t.category] ?? Church
                  const isProcessing = processingId === t.id
                  const mediaUrl = getMediaUrl(t.media_url)
                  const thumbUrl = getMediaUrl(t.thumbnail_url)
                  const isVideo = t.type === 'video' || (mediaUrl && ['.mp4', '.mov', '.webm', '.mkv'].some(ext => mediaUrl.toLowerCase().endsWith(ext)))
                  const isAudio = t.type === 'audio' || (mediaUrl && ['.mp3', '.wav', '.m4a', '.ogg', '.aac'].some(ext => mediaUrl.toLowerCase().endsWith(ext)))
                  const isImage = t.type === 'image' || (mediaUrl && ['.jpg', '.jpeg', '.png', '.gif', '.webp'].some(ext => mediaUrl.toLowerCase().endsWith(ext))) || (thumbUrl && !isVideo && !isAudio)

                  return (
                    <div key={t.id} className="bg-white rounded-xl p-5 border transition-all hover:shadow-md" style={{ borderColor: 'var(--eleven-border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                      <div className="flex flex-col md:flex-row items-start justify-between gap-5">
                        <div className="flex-1 min-w-0">
                          {/* Badges Row */}
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                              <Clock size={10} /> Pending Review
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 bg-stone-100 text-stone-700">
                              <CatIcon size={10} /> {t.category}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200">
                              {isVideo && <><Video size={10} /> Video Testimony</>}
                              {isAudio && <><Volume2 size={10} /> Audio Testimony</>}
                              {isImage && <><ImageIcon size={10} /> Photo Testimony</>}
                              {!isVideo && !isAudio && !isImage && <><BookOpen size={10} /> Written Story</>}
                            </span>
                            <span className="text-xs text-stone-400">
                              By {t.is_anonymous ? 'Anonymous Member' : (t.author_name ?? 'User')} &middot; {timeAgo(t.created_at)}
                            </span>
                          </div>

                          {/* Title & Description */}
                          <h3 className="font-display text-lg font-bold text-stone-900 mb-1.5">{t.title}</h3>
                          <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">{t.content}</p>

                          {/* ── Media Previews (Image, Video, Audio) ── */}
                          {isVideo && mediaUrl && (
                            <div className="mt-4 max-w-lg rounded-xl overflow-hidden bg-black border border-stone-800 shadow-sm">
                              <div className="p-2 bg-stone-900 text-white text-[11px] font-semibold flex items-center gap-1.5 border-b border-stone-800">
                                <Video size={13} className="text-red-400" />
                                <span>Attached Video Preview</span>
                              </div>
                              <video
                                src={mediaUrl}
                                poster={thumbUrl || undefined}
                                controls
                                playsInline
                                className="w-full max-h-64 object-contain"
                              />
                            </div>
                          )}

                          {isAudio && mediaUrl && (
                            <div className="mt-4 max-w-lg p-3 rounded-xl bg-amber-50/50 border border-amber-200 shadow-sm flex flex-col gap-2">
                              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                                <Volume2 size={15} className="text-amber-600" />
                                <span>Attached Audio Testimony</span>
                              </div>
                              {thumbUrl && (
                                <LazyImage src={thumbUrl} alt="Thumbnail" className="w-full max-h-40 object-cover rounded-lg border border-amber-200" containerClassName="w-full max-h-40" />
                              )}
                              <audio src={mediaUrl} controls className="w-full mt-1" />
                            </div>
                          )}

                          {isImage && (mediaUrl || thumbUrl) && (
                            <div className="mt-4 max-w-md">
                              <div className="text-[11px] font-semibold text-stone-500 mb-1 flex items-center gap-1">
                                <ImageIcon size={12} /> Attached Photo Preview:
                              </div>
                              <LazyImage
                                src={mediaUrl || thumbUrl}
                                alt={t.title}
                                className="max-h-64 rounded-xl border border-stone-200 object-contain bg-stone-50 cursor-pointer hover:opacity-95 transition-opacity shadow-sm"
                                onClick={() => setPreviewTestimony(t)}
                              />
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex md:flex-col items-center gap-2.5 flex-shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0">
                          <Button
                            size="sm"
                            className="rounded-xl text-xs h-9 px-4 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex-1 md:flex-none flex items-center justify-center gap-1.5 cursor-pointer"
                            disabled={isProcessing}
                            onClick={() => handleApprove(t.id)}
                          >
                            <CheckCircle size={14} />
                            <span>{isProcessing ? 'Approving...' : 'Approve'}</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl text-xs h-9 px-4 font-semibold text-red-600 border-red-200 hover:bg-red-50 flex-1 md:flex-none flex items-center justify-center gap-1.5 cursor-pointer"
                            disabled={isProcessing}
                            onClick={() => handleDecline(t.id)}
                          >
                            <XCircle size={14} />
                            <span>Decline</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-xl text-xs h-8 px-3 text-stone-500 hover:text-stone-800 flex items-center gap-1"
                            onClick={() => setPreviewTestimony(t)}
                          >
                            <Eye size={13} /> Full Preview
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed" style={{ borderColor: 'var(--eleven-border)' }}>
                <CheckCircle size={36} className="mx-auto mb-3 text-emerald-600" />
                <p className="text-lg font-bold text-stone-800">All caught up!</p>
                <p className="text-xs text-stone-500 mt-1">No pending testimonies to review at this moment.</p>
              </div>
            )
        )}
        
        {activeTab === 'users' && (
          allUsers.length > 0 ? (
            <div className="bg-white rounded-xl overflow-hidden border" style={{ borderColor: 'var(--eleven-border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-stone-50/50" style={{ borderColor: 'var(--eleven-border)' }}>
                      {['User', 'Role', 'Plan / Status', 'Change Plan', 'Joined', 'Last Active'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--eleven-text-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map(u => {
                      const planBadgeClass = u.subscription_plan === 'premium'
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                        : u.subscription_plan === 'regular'
                        ? 'bg-blue-50 text-blue-800 border-blue-200 font-semibold'
                        : 'bg-stone-100 text-stone-600 border-stone-200'

                      return (
                        <tr key={u.id} className="border-b hover:bg-stone-50/60 transition-colors" style={{ borderColor: 'var(--eleven-border)' }}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: 'var(--eleven-accent-light)', color: 'var(--eleven-accent-dark)' }}>
                                {(u.name ?? u.username ?? 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-xs text-stone-900">{u.name || u.username || 'Anonymous'}</p>
                                <p className="text-[11px] text-stone-400">@{u.username || u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-gray-100 text-gray-600'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border capitalize ${planBadgeClass}`}>
                              {u.subscription_plan || 'free'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Select
                              value={u.subscription_plan || 'free'}
                              onValueChange={(val: 'free' | 'regular' | 'premium') => handlePlanChange(u.id, val)}
                            >
                              <SelectTrigger className="h-7 text-xs w-28 bg-white border-stone-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="free" className="text-xs">Free</SelectItem>
                                <SelectItem value="regular" className="text-xs">Regular</SelectItem>
                                <SelectItem value="premium" className="text-xs font-bold text-amber-700">Premium ⭐</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: 'var(--eleven-text-secondary)' }}>{timeAgo(u.created_at)}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: 'var(--eleven-text-secondary)' }}>{timeAgo(u.last_sign_in_at)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <Users size={32} className="mx-auto mb-3" style={{ color: 'var(--eleven-text-muted)' }} />
              <p className="text-lg font-medium" style={{ color: 'var(--eleven-text)' }}>No users found</p>
            </div>
          )
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
                
                {/* Media Source & Picker */}
                <div className="space-y-2">
                  <Label className="text-xs">Media Source *</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMediaSource('file')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        mediaSource === 'file'
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      File Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaSource('url')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        mediaSource === 'url'
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      External URL
                    </button>
                  </div>

                  {mediaSource === 'file' ? (
                    <div className="space-y-2 pt-1">
                      <div className="border border-dashed border-stone-300 rounded-lg p-4 text-center cursor-pointer hover:bg-stone-50 relative">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={uploadingFile}
                        />
                        <div className="space-y-1 text-stone-500">
                          {uploadingFile ? (
                            <p className="text-xs animate-pulse font-medium">Uploading file...</p>
                          ) : slideMediaUrl ? (
                            <p className="text-xs text-green-600 font-semibold">✓ Upload Successful</p>
                          ) : (
                            <>
                              <p className="text-xs font-semibold">Choose image or video file</p>
                              <p className="text-[10px] text-stone-400">Supports JPG, PNG, GIF, MP4, MOV</p>
                            </>
                          )}
                        </div>
                      </div>
                      {slideMediaUrl && (
                        <div className="text-[10px] text-stone-400 truncate bg-stone-50 p-2 rounded max-w-full">
                          Uploaded: {slideMediaUrl}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="pt-1">
                      <Input
                        id="slide-media-url"
                        value={slideMediaUrl}
                        onChange={e => setSlideMediaUrl(e.target.value)}
                        placeholder="https://..."
                        required
                        className="text-xs"
                      />
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full text-white font-semibold text-xs h-9 rounded-lg mt-3" style={{ background: 'var(--eleven-accent)' }} disabled={submittingSlide || uploadingFile}>
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
                                <LazyImage src={slide.media_url} alt="" className="w-full h-full object-cover" containerClassName="w-full h-full" />
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

      {/* Full Preview Modal for Pending Testimony Review */}
      {previewTestimony && (
        <Dialog open={Boolean(previewTestimony)} onOpenChange={(open) => !open && setPreviewTestimony(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-white rounded-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <Clock size={10} /> Pending Review
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
                  {previewTestimony.category}
                </span>
                <span className="text-xs text-stone-400">
                  {timeAgo(previewTestimony.created_at)}
                </span>
              </div>
              <DialogTitle className="font-display text-xl font-bold text-stone-900 leading-tight">
                {previewTestimony.title}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-stone-100 text-xs text-stone-600">
                <span>Author: <strong className="text-stone-900">{previewTestimony.is_anonymous ? 'Anonymous Member' : (previewTestimony.author_name ?? 'User')}</strong></span>
              </div>
            </DialogHeader>

            <div className="my-4 space-y-4">
              {/* Media Preview in Modal */}
              {(previewTestimony.type === 'video' || (previewTestimony.media_url && ['.mp4', '.mov', '.webm', '.mkv'].some((ext: string) => previewTestimony.media_url.toLowerCase().endsWith(ext)))) && previewTestimony.media_url ? (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-stone-800">
                  <video
                    src={getMediaUrl(previewTestimony.media_url)}
                    poster={getMediaUrl(previewTestimony.thumbnail_url) || undefined}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (previewTestimony.type === 'audio' || (previewTestimony.media_url && ['.mp3', '.wav', '.m4a', '.ogg', '.aac'].some((ext: string) => previewTestimony.media_url.toLowerCase().endsWith(ext)))) && previewTestimony.media_url ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-2">
                    <Volume2 size={16} className="text-amber-600" />
                    <span>Voice Testimony Player</span>
                  </div>
                  {previewTestimony.thumbnail_url && (
                    <LazyImage src={getMediaUrl(previewTestimony.thumbnail_url)} alt="" className="w-full max-h-48 object-cover rounded-lg mb-3" containerClassName="w-full max-h-48" />
                  )}
                  <audio src={getMediaUrl(previewTestimony.media_url)} controls className="w-full" />
                </div>
              ) : previewTestimony.media_url || previewTestimony.thumbnail_url ? (
                <div className="rounded-xl overflow-hidden border border-stone-200 max-h-80 bg-stone-50 flex items-center justify-center">
                  <LazyImage
                    src={getMediaUrl(previewTestimony.media_url || previewTestimony.thumbnail_url)}
                    alt={previewTestimony.title}
                    className="max-h-80 w-auto object-contain"
                  />
                </div>
              ) : null}

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Story Content</h4>
                <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-wrap">{previewTestimony.content}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
              <Button
                variant="outline"
                className="rounded-xl text-xs h-9 px-4 font-semibold text-stone-600"
                onClick={() => setPreviewTestimony(null)}
              >
                Close
              </Button>
              <Button
                variant="outline"
                className="rounded-xl text-xs h-9 px-4 font-semibold text-red-600 border-red-200 hover:bg-red-50"
                disabled={processingId === previewTestimony.id}
                onClick={() => handleDecline(previewTestimony.id)}
              >
                <XCircle size={14} className="mr-1.5" /> Decline
              </Button>
              <Button
                className="rounded-xl text-xs h-9 px-5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                disabled={processingId === previewTestimony.id}
                onClick={() => handleApprove(previewTestimony.id)}
              >
                <CheckCircle size={14} className="mr-1.5" />
                {processingId === previewTestimony.id ? 'Approving...' : 'Approve Testimony'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
