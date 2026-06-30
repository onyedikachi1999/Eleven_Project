import { useState, useEffect } from 'react'
import { testimonyApi, scheduleApi } from '@/lib/api'
import { Play, Radio, Users, Clock, Eye, Video, PlusCircle, StopCircle } from 'lucide-react'
import { TestimonyDetailModal } from '@/components/TestimonyCardShared'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Link } from 'react-router'

const channelTabs = ['all', 'live', 'healing', 'finance', 'family', 'career', 'deliverance', 'general']

function timeAgo(date: string) {
  const d = new Date(date), now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return d.toLocaleDateString()
}

export default function ElevenTV() {
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('all')
  const [videos, setVideos] = useState<any[]>([])
  const [liveSession, setLiveSession] = useState<any>(null)
  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // Go Live states
  const [promoOpen, setPromoOpen] = useState(false)
  const [goLiveOpen, setGoLiveOpen] = useState(false)
  const [streamTitle, setStreamTitle] = useState('')
  const [streamDesc, setStreamDesc] = useState('')
  const [streamUrl, setStreamUrl] = useState('')
  const [submittingStream, setSubmittingStream] = useState(false)

  const handleGoLiveClick = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to go live')
      return
    }
    if (user?.subscription_plan !== 'premium') {
      setPromoOpen(true)
    } else {
      setGoLiveOpen(true)
    }
  }

  const handleStartStream = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!streamTitle.trim() || !streamUrl.trim()) {
      toast.error('Please fill in all required fields')
      return
    }
    setSubmittingStream(true)
    try {
      await scheduleApi.create({
        title: streamTitle.trim(),
        description: streamDesc.trim(),
        stream_url: streamUrl.trim(),
        scheduled_at: new Date().toISOString(),
        duration: 120, // default 2 hours
        is_live: true
      })
      toast.success('Live stream started successfully!')
      setGoLiveOpen(false)
      setStreamTitle('')
      setStreamDesc('')
      setStreamUrl('')
      // Refresh live session
      scheduleApi.live().then(r => setLiveSession(r)).catch(() => {})
    } catch (err: any) {
      toast.error(err.message || 'Failed to start stream')
    } finally {
      setSubmittingStream(false)
    }
  }

  const handleEndStream = async (id: number) => {
    try {
      await scheduleApi.delete(id)
      toast.success('Stream ended successfully.')
      setLiveSession(null)
    } catch (err: any) {
      toast.error(err.message || 'Failed to end stream')
    }
  }

  useEffect(() => {
    const params: Record<string, string> = { limit: '20', type: 'video' }
    if (activeTab !== 'all' && activeTab !== 'testimonies' && activeTab !== 'live') {
      params.category = activeTab
    }
    testimonyApi.list(params)
      .then((r: any) => setVideos((r.results ?? r).filter((v: any) => v.thumbnail_url)))
      .catch(() => {})
    scheduleApi.live().then(r => setLiveSession(r)).catch(() => {})
  }, [activeTab])

  return (
    <div>
      <div className="py-10 px-4 sm:px-6" style={{ background: 'var(--eleven-dark)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Play size={28} fill="var(--eleven-accent)" style={{ color: 'var(--eleven-accent)' }} />
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">ELEVEN TV</h1>
            </div>
            <p className="text-sm sm:text-base" style={{ color: 'var(--eleven-text-muted)' }}>Watch testimonies, live broadcasts, and stream church activities.</p>
          </div>
          <Button 
            onClick={handleGoLiveClick}
            className="w-full sm:w-auto rounded-full font-semibold px-6 flex items-center gap-2 bg-[#C75B5B] hover:bg-[#b04f4f] text-white hover:scale-105 transition-all shadow-md cursor-pointer"
          >
            <Video size={16} />
            Go Live
          </Button>
        </div>
      </div>
      {videos.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div onClick={() => { setSelectedVideo(videos[0]); setDetailOpen(true); }} className="relative aspect-video max-h-[480px] rounded-2xl overflow-hidden group cursor-pointer">
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
      {activeTab === 'live' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {liveSession ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Player block */}
              <div className="lg:col-span-2 aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border border-stone-200">
                {liveSession.stream_url && (liveSession.stream_url.includes('youtube.com') || liveSession.stream_url.includes('youtu.be')) ? (
                  <iframe
                    src={(() => {
                      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                      const match = liveSession.stream_url.match(regExp);
                      const id = (match && match[2].length === 11) ? match[2] : '';
                      return `https://www.youtube.com/embed/${id}?autoplay=1`;
                    })()}
                    title={liveSession.title}
                    className="w-full h-full border-0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  <video
                    src={liveSession.stream_url || 'https://assets.mixkit.co/videos/preview/mixkit-pastor-preaching-at-a-church-service-41856-large.mp4'}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              
              {/* Info panel */}
              <div className="bg-white rounded-2xl p-6 border shadow-sm flex flex-col justify-between" style={{ borderColor: 'var(--eleven-border)' }}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE STREAM
                    </span>
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      <Users size={12} /> {liveSession.participant_count || 12} watching
                    </span>
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-stone-900 leading-tight mb-2">{liveSession.title}</h2>
                    <p className="text-xs text-stone-500 leading-relaxed">{liveSession.description || 'No description provided.'}</p>
                  </div>
                  <div className="pt-4 border-t border-stone-100">
                    <p className="text-[10px] uppercase font-bold text-stone-400">Broadcaster</p>
                    <p className="text-xs font-semibold text-stone-700 mt-0.5">{liveSession.host_name || 'Host'}</p>
                  </div>
                </div>

                {/* End Stream control if user is host */}
                {user && user.id === liveSession.host_id && (
                  <Button 
                    variant="destructive"
                    onClick={() => handleEndStream(liveSession.id)}
                    className="w-full rounded-xl mt-6 flex items-center justify-center gap-1.5 font-semibold text-xs h-9 cursor-pointer"
                  >
                    <StopCircle size={15} /> End Broadcast
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed" style={{ borderColor: 'var(--eleven-border)' }}>
              <Radio size={40} className="mx-auto mb-3 text-stone-300 animate-pulse" />
              <h3 className="text-sm font-bold text-stone-600">No Active Live Streams</h3>
              <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                There are currently no live events. Premium Watchers can click "Go Live" at the top to start streaming church events or activities!
              </p>
            </div>
          )}
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {videos.length > 1 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.slice(1).map(v => (
              <div key={v.id} onClick={() => { setSelectedVideo(v); setDetailOpen(true); }} className="group cursor-pointer">
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

      {selectedVideo && (
        <TestimonyDetailModal
          t={selectedVideo}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onUpdate={(id) => {
            if (id) {
              setVideos(prev => prev.map(v => {
                if (v.id === id) {
                  const nextReacted = !v.has_reacted
                  return {
                    ...v,
                    has_reacted: nextReacted,
                    amen_count: nextReacted ? v.amen_count + 1 : Math.max(0, v.amen_count - 1)
                  }
                }
                return v
              }))
              setSelectedVideo(prev => {
                if (prev && prev.id === id) {
                  const nextReacted = !prev.has_reacted
                  return {
                    ...prev,
                    has_reacted: nextReacted,
                    amen_count: nextReacted ? prev.amen_count + 1 : Math.max(0, prev.amen_count - 1)
                  }
                }
                return prev
              })
            } else {
              const params: Record<string, string> = { limit: '20', type: 'video' }
              if (activeTab !== 'all' && activeTab !== 'testimonies' && activeTab !== 'live') {
                params.category = activeTab
              }
              testimonyApi.list(params)
                .then((r: any) => {
                  const results = r.results ?? r
                  setVideos(results.filter((v: any) => v.thumbnail_url))
                  if (selectedVideo) {
                    const updated = results.find((item: any) => item.id === selectedVideo.id)
                    if (updated) setSelectedVideo(updated)
                  }
                })
                .catch(() => {})
            }
          }}
        />
      )}

      {/* Premium Upgrade Promotion Dialog */}
      <Dialog open={promoOpen} onOpenChange={setPromoOpen}>
        <DialogContent className="sm:max-w-md p-6 text-center">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-[#c4956a]/15 flex items-center justify-center mb-3">
              <Video className="text-[#8b6914] w-6 h-6 animate-pulse" />
            </div>
            <DialogTitle className="font-display text-xl font-bold text-center">
              Go Live is a Premium Feature
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-stone-500 leading-relaxed">
              Only <strong className="text-[#8b6914]">Premium Watchers</strong> can host and broadcast live streams of events, vigils, or church services to ELEVEN TV.
            </p>
            <p className="text-xs text-stone-400 mt-2">
              Upgrade your subscription to unlock streaming permissions immediately.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button 
              variant="outline" 
              onClick={() => setPromoOpen(false)}
              className="rounded-full font-semibold text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Link to="/pricing" className="w-full sm:w-auto">
              <Button 
                className="w-full rounded-full font-semibold text-xs text-white bg-gradient-to-r from-[#c4956a] to-[#d4b28c] hover:brightness-105 transition-all shadow-md cursor-pointer"
              >
                Upgrade to Premium
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* Go Live Setup Dialog */}
      <Dialog open={goLiveOpen} onOpenChange={setGoLiveOpen}>
        <DialogContent className="sm:max-w-lg p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">
              Start Live Broadcast
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleStartStream} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="stream-title" className="text-xs font-semibold text-stone-700">
                Stream Title *
              </Label>
              <Input
                id="stream-title"
                placeholder="e.g., Sunday Service Live Praise & Worship"
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                required
                className="rounded-xl text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stream-desc" className="text-xs font-semibold text-stone-700">
                Description (Optional)
              </Label>
              <Textarea
                id="stream-desc"
                placeholder="Brief summary of the live broadcast..."
                value={streamDesc}
                onChange={(e) => setStreamDesc(e.target.value)}
                className="rounded-xl text-sm min-h-[80px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stream-url" className="text-xs font-semibold text-stone-700">
                Stream Video / YouTube URL *
              </Label>
              <Input
                id="stream-url"
                placeholder="YouTube live stream link or HLS URL (.m3u8/.mp4)"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                required
                className="rounded-xl text-sm"
              />
              <span className="text-[10px] text-stone-400 block mt-0.5">
                For testing, you can use any public video URL, e.g., YouTube watch link.
              </span>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setGoLiveOpen(false)}
                className="rounded-full font-semibold text-xs cursor-pointer h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingStream}
                className="rounded-full font-semibold text-xs h-9 text-white bg-gradient-to-r from-[#C75B5B] to-[#D87070] hover:brightness-105 transition-all shadow-md cursor-pointer"
              >
                {submittingStream ? 'Starting...' : 'Go Live Now'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
