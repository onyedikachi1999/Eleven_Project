import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { scheduleApi } from '@/lib/api'
import {
  Mic, MicOff, Volume2, VolumeX, Users, PhoneOff,
  Send, Radio, Shield, MessageCircle, Clock
} from 'lucide-react'

interface FloatingReaction {
  id: number
  emoji: string
  label: string
  x: number
}

interface ChatMessage {
  id: string
  user: string
  text: string
  time: string
  isAmen?: boolean
}

interface Participant {
  id: string
  name: string
  avatar?: string
  isCoModerator: boolean
}

const SAMPLE_SESSIONS = [
  { id: 's1', title: 'Morning Grace Prayer Watch', description: 'Starting the day in worship, intercession, and personal prayer.', duration: 30, host_name: 'Pastor David' },
  { id: 's2', title: 'Healing & Deliverance Fellowship', description: 'Gathering to pray for the sick, brokenhearted, and needy.', duration: 45, host_name: 'Sister Sarah' },
  { id: 's3', title: 'Midnight Breakthrough Vigil', description: 'Late-night prayer watch standing in agreement for miracles.', duration: 60, host_name: 'Brother John' },
]

const DEFAULT_MESSAGES: ChatMessage[] = [
  { id: '1', user: 'Pastor David', text: 'Welcome everyone! We are opening in prayer for healing today.', time: 'Just now' },
  { id: '2', user: 'Sister Grace', text: 'Amen! Standing in faith with everyone here.', time: 'Just now', isAmen: true },
  { id: '3', user: 'Brother John', text: 'Lord, touch every heart listening right now.', time: 'Just now' },
]

export default function LiveAudioRoomPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)
  const [reactions, setReactions] = useState<FloatingReaction[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>(DEFAULT_MESSAGES)
  const [chatInput, setChatInput] = useState('')
  const [listenerCount, setListenerCount] = useState(48)
  const [audioLevel, setAudioLevel] = useState(60)
  
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 'p1', name: 'Sister Grace', isCoModerator: false },
    { id: 'p2', name: 'Brother John', isCoModerator: false },
    { id: 'p3', name: 'Sister Sarah', isCoModerator: false },
    { id: 'p4', name: 'Brother David', isCoModerator: false },
  ])
  const [showExitWarning, setShowExitWarning] = useState(false)
  
  // Timer countdown state
  const [timeLeft, setTimeLeft] = useState(1800) // Default 30 min

  const mediaStreamRef = useRef<MediaStream | null>(null)

  const isModerator = Boolean(session?.is_host || user?.role === 'admin' || user?.username === session?.host_name)
  const hasCoModerator = participants.some(p => p.isCoModerator)

  // Fetch session details on load
  useEffect(() => {
    if (!id) return
    setLoading(true)

    // Check if it's a sample session
    const sample = SAMPLE_SESSIONS.find(s => s.id === id)
    if (sample) {
      setSession(sample)
      setTimeLeft(sample.duration * 60)
      setLoading(false)
      // Mute state setup
      if (user?.role === 'admin' || user?.username === sample.host_name) {
        setIsMuted(false)
      } else {
        setIsMuted(true)
      }
    } else {
      // Fetch from API
      scheduleApi.get(id)
        .then(data => {
          setSession(data)
          setTimeLeft((data.duration || 30) * 60)
          if (user?.role === 'admin' || user?.id === data.host_id) {
            setIsMuted(false)
          } else {
            setIsMuted(true)
          }
        })
        .catch(() => {
          toast.error('Failed to load live session')
          navigate('/joint-prayer')
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [id, user, navigate])

  // Start micro audio stream if moderator and not muted
  useEffect(() => {
    if (loading || !session) return

    if (!isMuted && isModerator) {
      startAudioStream()
    } else {
      stopAudioStream()
    }
  }, [isMuted, isModerator, loading, session])

  // Countdown timer & listener flux effect
  useEffect(() => {
    if (loading || !session) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          toast.info('The live prayer session has concluded. Thank you for praying together!')
          navigate('/joint-prayer')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    const countInterval = setInterval(() => {
      setListenerCount(prev => prev + Math.floor(Math.random() * 3) - 1)
    }, 5000)

    const audioInterval = setInterval(() => {
      if (isModerator && !isMuted) {
        setAudioLevel(Math.floor(Math.random() * 55) + 35)
      } else {
        setAudioLevel(12)
      }
    }, 200)

    return () => {
      clearInterval(timer)
      clearInterval(countInterval)
      clearInterval(audioInterval)
      stopAudioStream()
    }
  }, [loading, session, isMuted, isModerator])

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const startAudioStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
    } catch {
      // Fallback
    }
  }

  const stopAudioStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop())
      mediaStreamRef.current = null
    }
  }

  const toggleMic = () => {
    if (!isModerator) {
      toast.info('Only the session moderator can speak. You are in listen-only mode.')
      return
    }
    setIsMuted(!isMuted)
  }

  const toggleCoModerator = (id: string) => {
    setParticipants(prev =>
      prev.map(p => (p.id === id ? { ...p, isCoModerator: !p.isCoModerator } : p))
    )
    const p = participants.find(part => part.id === id)
    if (p) {
      toast.success(
        p.isCoModerator
          ? `${p.name} is no longer Co-Host`
          : `${p.name} has been appointed Co-Host`
      )
    }
  }

  const sendReaction = (emoji: string, label: string) => {
    const newReaction: FloatingReaction = {
      id: Date.now() + Math.random(),
      emoji,
      label,
      x: Math.floor(Math.random() * 70) + 15,
    }
    setReactions(prev => [...prev, newReaction])

    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newReaction.id))
    }, 2200)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      user: user?.first_name ? `${user.first_name} ${user.last_name || ''}` : (user?.username || 'Believer'),
      text: chatInput.trim(),
      time: 'Just now',
    }
    setMessages(prev => [...prev, newMsg])
    setChatInput('')
  }

  const handleLeaveClick = () => {
    if (isModerator) {
      setShowExitWarning(true)
    } else {
      navigate('/joint-prayer')
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-[#0f141c] text-white z-50">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold text-stone-400">Connecting to live prayer watch...</p>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col overflow-hidden bg-[#0f141c] text-white z-50">
      {/* CSS Keyframes for Floating Reaction Animation */}
      <style>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0) scale(0.8); }
          50% { opacity: 0.9; transform: translateY(-100px) scale(1.2); }
          100% { opacity: 0; transform: translateY(-220px) scale(1); }
        }
        .animate-float-up {
          animation: floatUp 2.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      {/* ── Header ── */}
      <div className="p-5 pb-4 border-b border-white/10 flex flex-row items-center justify-between bg-[#161c27]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center animate-pulse">
            <Radio size={20} className="text-red-400" />
          </div>
          <div className="text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse">
                LIVE AUDIO
              </span>
              <span className="text-xs text-stone-400 flex items-center gap-1">
                <Users size={13} className="text-emerald-400" /> {listenerCount} listening
              </span>
              <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20 flex items-center gap-1">
                <Clock size={12} /> {formatCountdown(timeLeft)} remaining
              </span>
            </div>
            <h1 className="font-display text-lg font-bold text-white mt-0.5 line-clamp-1">
              {session.title}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Main Stage Area ── */}
      <div className="relative flex-1 p-6 overflow-y-auto flex flex-col items-center justify-between min-h-[300px] bg-gradient-to-b from-[#161c27] to-[#0f141c]">
        {/* Floating Reaction Container */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
          {reactions.map(r => (
            <div
              key={r.id}
              className="absolute bottom-16 animate-float-up flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-lg text-sm font-semibold"
              style={{ left: `${r.x}%` }}
            >
              <span>{r.emoji}</span>
              <span className="text-xs text-white/90">{r.label}</span>
            </div>
          ))}
        </div>

        {/* Host Stage & Animated Audio Waves */}
        <div className="w-full flex flex-col items-center justify-center my-4">
          <div className="relative flex items-center justify-center mb-4">
            <div
              className="absolute rounded-full transition-all duration-300 pointer-events-none"
              style={{
                width: 130 + (isMuted ? 0 : audioLevel * 0.8),
                height: 130 + (isMuted ? 0 : audioLevel * 0.8),
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(59, 130, 246, 0.1) 70%, transparent 100%)',
                filter: 'blur(16px)',
              }}
            />
            <Avatar className="w-24 h-24 border-4 border-emerald-500/80 shadow-2xl relative z-10">
              <AvatarImage src={session.host_avatar || ''} />
              <AvatarFallback className="bg-emerald-950 text-emerald-300 font-bold text-2xl">
                {(session.host_name || 'H').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 z-20 px-2.5 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Shield size={11} /> HOST SPEAKER
            </div>
          </div>

          <h3 className="font-display font-semibold text-base text-white mt-2">
            {session.host_name || 'Faith Leader'}
          </h3>
          <p className="text-xs text-stone-400 mt-0.5 max-w-md text-center line-clamp-2">
            {session.description || 'Leading live prayer intercession and testimonies.'}
          </p>

          {/* Live Equalizer Visualizer Bars */}
          <div className="flex items-center gap-1.5 h-8 mt-5">
            {[40, 70, 100, 60, 90, 45, 80, 55, 95, 50, 75].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-gradient-to-t from-emerald-500 to-blue-400 rounded-full transition-all duration-150"
                style={{
                  height: isMuted ? '6px' : `${Math.max(6, (h * audioLevel) / 100)}px`,
                  opacity: isMuted ? 0.3 : 0.9,
                }}
              />
            ))}
          </div>
        </div>

        {/* Quick Floating Reaction Bar */}
        <div className="w-full flex items-center justify-center gap-2 my-2 py-2 px-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
          <span className="text-xs text-stone-400 font-medium mr-1 hidden sm:inline">React:</span>
          {[
            { emoji: '🙏', label: 'Amen' },
            { emoji: '🔥', label: 'Hallelujah' },
            { emoji: '✨', label: 'Glory' },
            { emoji: '💜', label: 'Praying' },
          ].map(r => (
            <button
              key={r.label}
              onClick={() => sendReaction(r.emoji, r.label)}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xs font-medium flex items-center gap-1 text-white border border-white/10"
            >
              <span>{r.emoji}</span>
              <span>{r.label}</span>
            </button>
          ))}
        </div>

        {/* ── Chat & Listeners Panel ── */}
        <div className="w-full mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 h-64 md:h-56">
          {/* Live Chat Panel */}
          <div className="rounded-xl bg-black/40 border border-white/10 p-3 flex flex-col h-full">
            <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-white/10 text-xs font-semibold text-stone-300">
              <MessageCircle size={14} className="text-blue-400" />
              Live Chat
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {messages.map(m => (
                <div key={m.id} className="leading-relaxed text-left">
                  <span className="font-semibold text-emerald-400 mr-1.5">{m.user}:</span>
                  <span className={m.isAmen ? 'text-amber-300 font-medium' : 'text-stone-200'}>{m.text}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2 mt-2 pt-2 border-t border-white/10">
              <Input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Type a prayer..."
                className="h-8 text-xs bg-white/10 border-white/10 text-white placeholder:text-stone-500 focus-visible:ring-emerald-500"
              />
              <Button type="submit" size="sm" className="h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
                <Send size={12} />
              </Button>
            </form>
          </div>

          {/* Listeners Directory Panel */}
          <div className="rounded-xl bg-black/40 border border-white/10 p-3 flex flex-col h-full overflow-hidden text-left">
            <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-white/10 text-xs font-semibold text-stone-300">
              <Users size={14} className="text-blue-400" />
              Active Listeners ({participants.length})
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {participants.map(p => (
                <div key={p.id} className="flex items-center justify-between py-0.5">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5 border border-white/10">
                      <AvatarFallback className="bg-stone-800 text-stone-300 font-bold text-[8px] flex items-center justify-center">
                        {p.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-stone-200 font-medium">{p.name}</span>
                    {p.isCoModerator && (
                      <span className="inline-flex items-center gap-0.5 px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded text-[8px] border border-amber-500/30">
                        <Shield size={8} /> Co-Host
                      </span>
                    )}
                  </div>
                  {isModerator && (
                    <button
                      type="button"
                      onClick={() => toggleCoModerator(p.id)}
                      className={`h-5 px-1.5 text-[9px] font-semibold rounded-md transition-colors cursor-pointer border ${
                        p.isCoModerator
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border-emerald-500/30'
                      }`}
                    >
                      {p.isCoModerator ? 'Revoke Co-Host' : 'Appoint Co-Host'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Controls Bar ── */}
      <div className="p-4 bg-[#161c27] border-t border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {isModerator ? (
            <Button
              onClick={toggleMic}
              variant="outline"
              size="sm"
              className={`rounded-full h-10 px-4 flex items-center gap-2 border-white/20 cursor-pointer ${
                isMuted ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
              <span className="text-xs font-semibold">{isMuted ? 'Unmute Mic' : 'Broadcasting'}</span>
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-stone-400 text-xs font-medium">
              <MicOff size={14} className="text-amber-400" />
              <span>Listen-Only Mode</span>
            </div>
          )}

          <Button
            onClick={() => setIsDeafened(!isDeafened)}
            variant="outline"
            size="icon"
            className="rounded-full w-10 h-10 border-white/20 bg-white/5 text-stone-300 hover:bg-white/10"
          >
            {isDeafened ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </Button>
        </div>

        <Button
          onClick={handleLeaveClick}
          className="rounded-full h-10 px-5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
        >
          <PhoneOff size={16} />
          Leave Room
        </Button>
      </div>

      {/* ── Exit Warning Dialog ── */}
      <Dialog open={showExitWarning} onOpenChange={setShowExitWarning}>
        <DialogContent className="sm:max-w-md bg-[#161c27] border border-white/10 text-white p-5 rounded-2xl animate-none">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Shield size={20} className={hasCoModerator ? "text-amber-400" : "text-red-400"} />
              {hasCoModerator ? "Leave Live Session?" : "End Live Session for Everyone?"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-stone-300 space-y-2 text-left">
            {hasCoModerator ? (
              <p>
                You have appointed a co-moderator. If you leave, the live prayer session will continue running under their leadership.
              </p>
            ) : (
              <p>
                You are the moderator of this session. Leaving now will **end the live prayer room for all {listenerCount} listeners**.
                To keep it active, cancel and appoint a listener as a co-moderator first.
              </p>
            )}
            <p className="text-xs text-stone-500 italic mt-2">
              Are you sure you want to proceed?
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setShowExitWarning(false)}
              className="bg-white/5 border-white/10 hover:bg-white/10 text-stone-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowExitWarning(false)
                navigate('/joint-prayer')
              }}
              className={hasCoModerator ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-red-600 hover:bg-red-500 text-white"}
            >
              {hasCoModerator ? "Leave Room" : "End Session & Exit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
