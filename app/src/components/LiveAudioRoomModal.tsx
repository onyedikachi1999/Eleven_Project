import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import {
  Mic, MicOff, Volume2, VolumeX, Users, PhoneOff,
  Send, Sparkles, Flame, HandHeart, Radio, Shield, MessageCircle
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

interface LiveAudioRoomModalProps {
  open: boolean
  onClose: () => void
  session: {
    id?: string | number
    title: string
    host_name?: string
    host_avatar?: string
    category?: string
    description?: string
    is_host?: boolean
  } | null
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  { id: '1', user: 'Pastor David', text: 'Welcome everyone! We are opening in prayer for healing today.', time: 'Just now' },
  { id: '2', user: 'Sister Grace', text: 'Amen! Standing in faith with everyone here.', time: 'Just now', isAmen: true },
  { id: '3', user: 'Brother John', text: 'Lord, touch every heart listening right now.', time: 'Just now' },
]

export default function LiveAudioRoomModal({ open, onClose, session }: LiveAudioRoomModalProps) {
  const { user } = useAuth()
  const [isMuted, setIsMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)
  const [reactions, setReactions] = useState<FloatingReaction[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>(DEFAULT_MESSAGES)
  const [chatInput, setChatInput] = useState('')
  const [listenerCount, setListenerCount] = useState(48)
  const [isLiveStreaming, setIsLiveStreaming] = useState(false)
  const [audioLevel, setAudioLevel] = useState(60)

  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const animFrameRef = useRef<number | null>(null)

  const isHost = session?.is_host || user?.role === 'admin' || user?.username === session?.host_name

  // Micro-audio stream setup when host or unmuted speaker
  useEffect(() => {
    if (!open) {
      stopAudioStream()
      return
    }

    // Simulate real-time listener flux
    const countInterval = setInterval(() => {
      setListenerCount(prev => prev + Math.floor(Math.random() * 3) - 1)
    }, 5000)

    // Simulate audio level pulse
    const audioInterval = setInterval(() => {
      if (!isMuted) {
        setAudioLevel(Math.floor(Math.random() * 55) + 35)
      } else {
        setAudioLevel(5)
      }
    }, 200)

    return () => {
      clearInterval(countInterval)
      clearInterval(audioInterval)
      stopAudioStream()
    }
  }, [open, isMuted])

  const startAudioStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      setIsLiveStreaming(true)
      toast.success('Microphone connected — You are speaking live!')
    } catch {
      toast.info('Audio room joined in listener mode.')
    }
  }

  const stopAudioStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop())
      mediaStreamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
    }
    setIsLiveStreaming(false)
  }

  const toggleMic = () => {
    if (!isLiveStreaming && !isMuted) {
      startAudioStream()
    }
    setIsMuted(!isMuted)
    toast(isMuted ? 'Microphone unmuted' : 'Microphone muted')
  }

  const sendReaction = (emoji: string, label: string) => {
    const newReaction: FloatingReaction = {
      id: Date.now() + Math.random(),
      emoji,
      label,
      x: Math.floor(Math.random() * 70) + 15,
    }
    setReactions(prev => [...prev, newReaction])

    // Auto remove floating element after animation finishes
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

  if (!session) return null

  return (
    <Dialog open={open} onOpenChange={val => { if (!val) onClose() }}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] flex flex-col p-0 overflow-hidden border-0 bg-[#0f141c] text-white shadow-2xl rounded-2xl">
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
        <DialogHeader className="p-5 pb-4 border-b border-white/10 flex flex-row items-center justify-between space-y-0 bg-[#161c27]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center animate-pulse">
              <Radio size={20} className="text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse">
                  LIVE AUDIO
                </span>
                <span className="text-xs text-stone-400 flex items-center gap-1">
                  <Users size={13} className="text-emerald-400" /> {listenerCount} listening
                </span>
              </div>
              <DialogTitle className="font-display text-lg font-bold text-white mt-0.5 line-clamp-1">
                {session.title}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

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
            {/* Glowing Soundwave Aura */}
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

          {/* ── Live Prayer Chat Section ── */}
          <div className="w-full mt-3 rounded-xl bg-black/40 border border-white/10 p-3 flex flex-col h-40">
            <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-white/10 text-xs font-semibold text-stone-300">
              <MessageCircle size={14} className="text-blue-400" />
              Live Prayer Stream Chat
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {messages.map(m => (
                <div key={m.id} className="leading-relaxed">
                  <span className="font-semibold text-emerald-400 mr-1.5">{m.user}:</span>
                  <span className={m.isAmen ? 'text-amber-300 font-medium' : 'text-stone-200'}>{m.text}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2 mt-2 pt-2 border-t border-white/10">
              <Input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Type a prayer or Amen..."
                className="h-8 text-xs bg-white/10 border-white/10 text-white placeholder:text-stone-500 focus-visible:ring-emerald-500"
              />
              <Button type="submit" size="sm" className="h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
                <Send size={12} />
              </Button>
            </form>
          </div>
        </div>

        {/* ── Bottom Controls Bar ── */}
        <div className="p-4 bg-[#161c27] border-t border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleMic}
              variant="outline"
              size="sm"
              className={`rounded-full h-10 px-4 flex items-center gap-2 border-white/20 ${
                isMuted ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
              <span className="text-xs font-semibold">{isMuted ? 'Muted' : 'Speaking'}</span>
            </Button>

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
            onClick={onClose}
            className="rounded-full h-10 px-5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
          >
            <PhoneOff size={16} />
            Leave Room
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
