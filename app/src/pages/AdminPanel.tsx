import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { adminApi, testimonyApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Shield, Users, BookOpen, HandHeart, CheckCircle, XCircle, Clock, Flame, Briefcase, UserPlus, Church, Sparkles } from 'lucide-react'

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
  const [activeTab, setActiveTab] = useState<'testimonies' | 'users'>('testimonies')
  const [stats, setStats] = useState<any>(null)
  const [pendingList, setPendingList] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    if (user?.role !== 'admin') return
    setLoading(true)
    adminApi.stats().then(setStats).catch(() => {})
    testimonyApi.pending().then(r => { setPendingList(r); setLoading(false) }).catch(() => setLoading(false))
    adminApi.users().then(setAllUsers).catch(() => {})
  }

  useEffect(() => { load() }, [user])

  const handleApprove = async (id: number) => {
    try { await testimonyApi.approve(id); toast('Approved!'); load() } catch (err: any) { toast.error(err.message) }
  }
  const handleDecline = async (id: number) => {
    try { await testimonyApi.decline(id); toast('Declined.'); load() } catch (err: any) { toast.error(err.message) }
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
          {[{ key: 'testimonies' as const, label: 'Pending Testimonies', icon: BookOpen }, { key: 'users' as const, label: 'Users', icon: Users }].map(tab =>
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
                <thead><tr className="border-b" style={{ borderColor: 'var(--eleven-border)' }}>{['User', 'Role', 'Joined', 'Last Active'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--eleven-text-muted)' }}>{h}</th>)}</tr></thead>
                <tbody>{allUsers.map(u => <tr key={u.id} className="border-b hover:bg-gray-50/50 transition-colors" style={{ borderColor: 'var(--eleven-border)' }}>
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: 'var(--eleven-accent-light)', color: 'var(--eleven-accent-dark)' }}>{(u.name ?? 'U').charAt(0).toUpperCase()}</div><div><p className="font-medium" style={{ color: 'var(--eleven-text)' }}>{u.name ?? 'Anonymous'}</p><p className="text-xs" style={{ color: 'var(--eleven-text-muted)' }}>{u.email ?? ''}</p></div></div></td>
                  <td className="px-4 py-3"><span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span></td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--eleven-text-secondary)' }}>{timeAgo(u.created_at)}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--eleven-text-secondary)' }}>{timeAgo(u.last_sign_in_at)}</td>
                </tr>)}</tbody>
              </table>
            </div>
          </div> : <div className="text-center py-16"><Users size={32} className="mx-auto mb-3" style={{ color: 'var(--eleven-text-muted)' }} /><p className="text-lg font-medium" style={{ color: 'var(--eleven-text)' }}>No users found</p></div>
        )}
      </div>
    </div>
  )
}
