import { useState, useEffect } from 'react'
import { testimonyApi, scheduleApi } from '@/lib/api'
import { Play, Radio, Users, Clock, Eye } from 'lucide-react'

const channelTabs = ['all', 'testimonies', 'live', 'interviews', 'prayer', 'inspirational']

function timeAgo(date: string) {
  const d = new Date(date), now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return d.toLocaleDateString()
}

export default function ElevenTV() {
  const [activeTab, setActiveTab] = useState('all')
  const [videos, setVideos] = useState<any[]>([])
  const [liveSession, setLiveSession] = useState<any>(null)

  useEffect(() => {
    const params: Record<string, string> = { limit: '20' }
    if (activeTab !== 'testimonies' && activeTab !== 'all') params.type = 'text'
    testimonyApi.list(params)
      .then((r: any) => setVideos((r.results ?? r).filter((v: any) => v.thumbnail_url)))
      .catch(() => {})
    scheduleApi.live().then(r => setLiveSession(r)).catch(() => {})
  }, [activeTab])

  return (
    <div>
      <div className="py-10 px-4 sm:px-6" style={{ background: 'var(--eleven-dark)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2"><Play size={28} fill="var(--eleven-accent)" style={{ color: 'var(--eleven-accent)' }} /><h1 className="font-display text-3xl sm:text-4xl font-bold text-white">ELEVEN TV</h1></div>
          <p className="text-sm sm:text-base" style={{ color: 'var(--eleven-text-muted)' }}>Watch testimonies, live broadcasts, and inspirational content.</p>
        </div>
      </div>
      {videos.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="relative aspect-video max-h-[480px] rounded-2xl overflow-hidden group cursor-pointer">
            <img src={videos[0].thumbnail_url} alt={videos[0].title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center"><div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform"><Play size={28} fill="var(--eleven-accent)" style={{ color: 'var(--eleven-accent)' }} /></div></div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white mb-1">{videos[0].title}</h2>
              <div className="flex items-center gap-4 text-xs text-white/70"><span className="flex items-center gap-1"><Eye size={12} /> {videos[0].view_count.toLocaleString()} views</span><span className="flex items-center gap-1"><Clock size={12} /> {timeAgo(videos[0].created_at)}</span></div>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {channelTabs.map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-white text-black' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>{tab === 'all' ? 'All Videos' : tab === 'career_forum' ? 'Career' : tab}</button>)}
        </div>
      </div>
      {liveSession && activeTab === 'live' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="bg-white rounded-xl p-4 flex items-center gap-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="relative w-32 aspect-video rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center"><Radio size={20} className="text-red-500 animate-pulse" /></div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1"><span className="flex items-center gap-1 text-[10px] font-bold text-red-500"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE</span></div>
              <h3 className="font-display text-base font-semibold">{liveSession.title}</h3>
              <p className="text-xs text-muted-foreground">{liveSession.description}</p>
              <div className="flex items-center gap-3 mt-2"><span className="text-xs flex items-center gap-1 text-muted-foreground"><Users size={12} /> {liveSession.participant_count} watching</span></div>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {videos.length > 1 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.slice(1).map(v => (
              <div key={v.id} className="group cursor-pointer">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-2">
                  <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center"><Play size={16} fill="var(--eleven-accent)" style={{ color: 'var(--eleven-accent)' }} /></div></div>
                  <span className="absolute bottom-2 right-2 text-[10px] font-medium bg-black/70 text-white px-1.5 py-0.5 rounded">8:24</span>
                </div>
                <h3 className="font-semibold text-sm line-clamp-2" style={{ color: 'var(--eleven-text)' }}>{v.title}</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--eleven-text-muted)' }}>{v.view_count.toLocaleString()} views &middot; {timeAgo(v.created_at)}</p>
              </div>
            ))}
          </div>
        ) : <div className="text-center py-20"><p className="text-lg font-medium" style={{ color: 'var(--eleven-text)' }}>No videos yet</p></div>}
      </div>
    </div>
  )
}
