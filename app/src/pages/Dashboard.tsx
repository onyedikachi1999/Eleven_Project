import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { testimonyApi, prayerApi, authApi } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, HandHeart, Heart, MessageCircle, Clock, BookMarked, Users, Camera, Edit } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'


const categoryColors: Record<string, { bg: string; text: string }> = {
  healing: { bg: '#E8D5C0', text: '#8B6914' }, finance: { bg: '#D4E0CC', text: '#4A6B3A' },
  family: { bg: '#D4E0F0', text: '#2E5A8B' }, career: { bg: '#E8D5E0', text: '#6B3A5A' },
  deliverance: { bg: '#F0E8D4', text: '#8B6B14' }, general: { bg: '#E8E4DE', text: '#6B6560' },
}

function timeAgo(date: string) {
  const d = new Date(date), now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return d.toLocaleDateString()
}

function StatCard({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-xl p-4 flex items-center gap-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--eleven-accent-light)' }}><Icon size={18} style={{ color: 'var(--eleven-accent)' }} /></div>
      <div><p className="font-display text-lg font-bold" style={{ color: 'var(--eleven-text)' }}>{value}</p><p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--eleven-text-muted)' }}>{label}</p></div>
    </div>
  )
}

export default function Dashboard() {
  const { user, isLoading: authLoading, refresh } = useAuth()
  const [testimonies, setTestimonies] = useState<any[]>([])
  const [prayers, setPrayers] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [tLoading, setTLoading] = useState(true)
  const [pLoading, setPLoading] = useState(true)

  // Profile Edit states
  const [editOpen, setEditOpen] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [profileBio, setProfileBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '')
      setLastName(user.last_name || '')
      setProfileBio(user.bio || '')
      setAvatarUrl(user.avatar || '')
    }
  }, [user, editOpen])

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const res = await authApi.uploadAvatar(file)
      setAvatarUrl(res.url)
      toast.success('Avatar uploaded successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Avatar upload failed')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await authApi.updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        bio: profileBio.trim(),
        avatar: avatarUrl.trim()
      })
      toast.success('Profile updated successfully!')
      setEditOpen(false)
      refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  useEffect(() => {
    testimonyApi.list({ limit: '50' }).then(r => { setTestimonies(r.results ?? r); setTLoading(false) }).catch(() => setTLoading(false))
    prayerApi.list({ limit: '50' }).then(r => { setPrayers(r.results ?? r); setPLoading(false) }).catch(() => setPLoading(false))
    prayerApi.stats().then(setStats).catch(() => {})
  }, [])

  if (authLoading) return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12"><Skeleton className="h-40 rounded-xl mb-8" /><div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div></div>
  if (!user) return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center"><p className="text-lg font-medium" style={{ color: 'var(--eleven-text)' }}>Please sign in to view your dashboard.</p><Link to="/login" className="text-sm underline" style={{ color: 'var(--eleven-accent)' }}>Sign In</Link></div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="rounded-2xl p-6 sm:p-8 mb-8" style={{ background: 'var(--eleven-surface-elevated)' }}>
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={user.avatar ?? undefined} />
            <AvatarFallback className="text-2xl font-display font-bold" style={{ background: 'var(--eleven-accent-light)', color: 'var(--eleven-accent-dark)' }}>{(user.name ?? 'U').charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: 'var(--eleven-text)' }}>{user.name ?? 'User'}</h1>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border capitalize" style={{ color: 'var(--eleven-text-secondary)' }}>
                  {user.subscription_plan || 'free'} Plan
                </span>
              </div>
              <p className="text-sm mb-2" style={{ color: 'var(--eleven-text-secondary)' }}>{user.email ?? ''}</p>
              {user.bio && <p className="text-sm max-w-xl" style={{ color: 'var(--eleven-text-secondary)' }}>{user.bio}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                onClick={() => setEditOpen(true)}
                variant="outline"
                className="rounded-full px-5 text-xs h-9 font-semibold border-stone-300 hover:bg-stone-50 cursor-pointer"
              >
                <Edit size={13} className="mr-1.5" /> Edit Profile
              </Button>
              <Link to="/pricing">
                <Button className="rounded-full px-5 text-xs h-9 text-white font-semibold cursor-pointer" style={{ background: 'var(--eleven-accent)' }}>
                  Manage Subscription
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <StatCard icon={BookOpen} label="Testimonies" value={testimonies.length} />
          <StatCard icon={HandHeart} label="Prayers Offered" value={stats?.total ?? 0} />
          <StatCard icon={Heart} label="Prayers Received" value={stats?.active ?? 0} />
          <StatCard icon={Users} label="Circles" value={4} />
        </div>
      </div>
      <Tabs defaultValue="testimonies">
        <TabsList className="mb-6">
          <TabsTrigger value="testimonies" className="text-xs"><BookOpen size={13} className="mr-1.5" /> My Testimonies</TabsTrigger>
          <TabsTrigger value="prayers" className="text-xs"><HandHeart size={13} className="mr-1.5" /> My Prayers</TabsTrigger>
          <TabsTrigger value="saved" className="text-xs"><BookMarked size={13} className="mr-1.5" /> Saved</TabsTrigger>
        </TabsList>
        <TabsContent value="testimonies">
          {tLoading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div> :
            testimonies.length > 0 ? <div className="space-y-3">{testimonies.map(t => {
              const catColor = categoryColors[t.category] ?? categoryColors.general
              return <div key={t.id} className="bg-white rounded-xl p-4 flex gap-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderLeft: `3px solid ${catColor.bg}` }}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: catColor.bg, color: catColor.text }}>{t.category}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${t.status === 'approved' ? 'bg-green-50 text-green-700' : t.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>{t.status}</span>
                  </div>
                  <h3 className="font-display text-sm font-semibold">{t.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: 'var(--eleven-text-muted)' }}><span className="flex items-center gap-1"><Heart size={10} /> {t.amen_count}</span><span className="flex items-center gap-1"><MessageCircle size={10} /> {t.prayer_count}</span><span className="flex items-center gap-1"><Clock size={10} /> {timeAgo(t.created_at)}</span></div>
                </div>
              </div>
            })}</div> : <div className="text-center py-16"><p className="text-lg font-medium" style={{ color: 'var(--eleven-text)' }}>No testimonies yet</p><p className="text-sm" style={{ color: 'var(--eleven-text-secondary)' }}><Link to="/testimonies" className="underline" style={{ color: 'var(--eleven-accent)' }}>Share your first testimony</Link></p></div>}
        </TabsContent>
        <TabsContent value="prayers">
          {pLoading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div> :
            prayers.length > 0 ? <div className="space-y-3">{prayers.map(p => <div key={p.id} className="bg-white rounded-xl p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderLeft: `3px solid var(--eleven-prayer)` }}>
              <div className="flex items-center gap-2 mb-1"><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${p.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>{p.status}</span></div>
              <p className="text-sm" style={{ color: 'var(--eleven-text)' }}>{p.content}</p>
              <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: 'var(--eleven-text-muted)' }}><span className="flex items-center gap-1"><HandHeart size={10} /> {p.prayer_count} prayers</span><span className="flex items-center gap-1"><Clock size={10} /> {timeAgo(p.created_at)}</span></div>
            </div>)}</div> : <div className="text-center py-16"><p className="text-lg font-medium" style={{ color: 'var(--eleven-text)' }}>No prayers yet</p><p className="text-sm" style={{ color: 'var(--eleven-text-secondary)' }}><Link to="/prayer-room" className="underline" style={{ color: 'var(--eleven-accent)' }}>Submit your first prayer</Link></p></div>}
        </TabsContent>
        <TabsContent value="saved">
          <div className="text-center py-16"><BookMarked size={32} className="mx-auto mb-3" style={{ color: 'var(--eleven-text-muted)' }} /><p className="text-lg font-medium" style={{ color: 'var(--eleven-text)' }}>No saved items</p><p className="text-sm" style={{ color: 'var(--eleven-text-secondary)' }}>Bookmark testimonies and prayers to find them here.</p></div>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveProfile} className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Avatar Selector Column */}
              <div className="flex flex-col items-center gap-4">
                <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Avatar Image</Label>
                <div className="relative group w-28 h-28 rounded-full overflow-hidden border-2 border-stone-200">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={avatarUrl ?? undefined} />
                    <AvatarFallback className="text-3xl font-display font-bold" style={{ background: 'var(--eleven-accent-light)', color: 'var(--eleven-accent-dark)' }}>
                      {firstName ? firstName.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera size={20} />
                    <span className="text-[10px] font-semibold mt-1">Upload File</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarFileChange} 
                      disabled={uploadingAvatar}
                    />
                  </label>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-[#c4956a] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                
                {/* External URL alternative */}
                <div className="w-full space-y-1">
                  <Label htmlFor="avatar-url" className="text-[10px] text-stone-500 font-semibold uppercase">Or Image URL</Label>
                  <Input 
                    id="avatar-url"
                    placeholder="https://example.com/avatar.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="rounded-xl text-xs h-8"
                  />
                </div>
              </div>
              
              {/* Fields Column */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="first-name" className="text-xs font-semibold text-stone-700">First Name</Label>
                    <Input
                      id="first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                      className="rounded-xl text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="last-name" className="text-xs font-semibold text-stone-700">Last Name</Label>
                    <Input
                      id="last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                      className="rounded-xl text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bio" className="text-xs font-semibold text-stone-700">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    placeholder="Share a brief testimony or bio about yourself..."
                    className="rounded-xl text-sm min-h-[100px] leading-relaxed"
                  />
                </div>
              </div>

            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="rounded-full font-semibold text-xs h-9 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingProfile || uploadingAvatar}
                className="rounded-full font-semibold text-xs h-9 text-white bg-gradient-to-r from-[#c4956a] to-[#d4b28c] hover:brightness-105 transition-all shadow-md cursor-pointer"
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
