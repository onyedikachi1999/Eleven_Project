import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getMediaUrl } from '@/lib/utils'
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
  user_id: number
  name: string
  avatar?: string
  isCoModerator: boolean
  peer_id?: string
}

export default function LiveAudioRoomPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(true) // Start muted by default
  const [isDeafened, setIsDeafened] = useState(false)
  const [reactions, setReactions] = useState<FloatingReaction[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [listenerCount, setListenerCount] = useState(0)
  const [audioLevel, setAudioLevel] = useState(12)
  const [activePanel, setActivePanel] = useState<'chat' | 'listeners'>('chat')
  
  const [participants, setParticipants] = useState<Participant[]>([])
  const [showExitWarning, setShowExitWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(1800)

  // Refs
  const localStreamRef = useRef<MediaStream | null>(null)
  const lastMsgIdRef = useRef<number>(0)
  const lastReactIdRef = useRef<number>(0)
  const isModeratorRef = useRef<boolean>(false)

  // HTTP Live Audio Chunks Refs & State
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const sequenceCounterRef = useRef<number>(Date.now())
  const lastSequenceRef = useRef<number>(-1)
  const audioQueueRef = useRef<string[]>([])
  const isPlayingRef = useRef<boolean>(false)
  const isDeafenedRef = useRef<boolean>(false)
  const isMutedRef = useRef<boolean>(true)
  const hasLeftRef = useRef<boolean>(false)
  const liveEndedNotifiedRef = useRef<boolean>(false)
  const sequenceInitializedRef = useRef<boolean>(false)
  const userIdRef = useRef<number | undefined>(undefined)
  
  // Dynamic audio controls
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false)
  const isAutoplayBlockedRef = useRef<boolean>(false)

  // Sync autoplay block to ref
  useEffect(() => {
    isAutoplayBlockedRef.current = isAutoplayBlocked
  }, [isAutoplayBlocked])

  // Compute Moderator role
  const isHostSpeaker = Boolean(
    session?.is_host || 
    (user && session && (user.id === session.host_id || user.is_staff || user.is_superuser || user.plan === 'premium')) ||
    participants.find(p => p.user_id === user?.id)?.isCoModerator
  )
  isModeratorRef.current = isHostSpeaker
  isMutedRef.current = isMuted
  userIdRef.current = user?.id

  // Sync deafened state to ref
  useEffect(() => {
    isDeafenedRef.current = isDeafened
    if (currentAudioRef.current) {
      currentAudioRef.current.volume = isDeafened ? 0 : 1
    }
  }, [isDeafened])

  const getSessionTimeLeft = (sessionData: any) => {
    if (!sessionData?.scheduled_at) {
      return (sessionData?.duration || 30) * 60
    }

    const start = new Date(sessionData.scheduled_at).getTime()
    const durationMs = (sessionData.duration || 30) * 60 * 1000
    const end = start + durationMs

    return Math.max(0, Math.floor((end - Date.now()) / 1000))
  }

  const initializeAudioSequence = async (sessionId: string) => {
    if (sequenceInitializedRef.current) return
    sequenceInitializedRef.current = true

    try {
      const data = await scheduleApi.syncRoom(sessionId, 0, 0, -1)
      if (!Array.isArray(data?.audio_chunks) || data.audio_chunks.length === 0) return

      const latestSequence = Math.max(...data.audio_chunks.map((chunk: any) => chunk.sequence))
      sequenceCounterRef.current = latestSequence + 1
      lastSequenceRef.current = latestSequence

      // If listener, queue the latest chunk so they hear audio immediately upon joining
      if (!isModeratorRef.current && !isDeafenedRef.current) {
        const sorted = [...data.audio_chunks].sort((a, b) => a.sequence - b.sequence)
        const latestChunk = sorted[sorted.length - 1]
        if (latestChunk && latestChunk.url) {
          const secureUrl = getMediaUrl(latestChunk.url) || latestChunk.url
          audioQueueRef.current.push(secureUrl)
          if (!isPlayingRef.current) {
            playNextChunk()
          }
        }
      }
    } catch (err) {
      console.warn('Failed to initialize live audio sequence:', err)
    }
  }

  // Fetch session details on load
  useEffect(() => {
    if (!id) return

    setLoading(true)

    scheduleApi.get(id)
      .then(async data => {
        await initializeAudioSequence(id)
        setSession(data)
        setTimeLeft(getSessionTimeLeft(data))
        // If owner/host, enable speaking
        if (user?.id === data.host_id || user?.plan === 'premium' || user?.is_staff) {
          setIsMuted(false)
        }
      })
      .catch((err: any) => {
        toast.error(err?.message || 'Failed to connect to live session')
        navigate('/joint-prayer')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id, user, navigate])

  // Join room on load
  useEffect(() => {
    if (loading || !session || !id) return
    scheduleApi.joinRoom(id).catch(() => {})
  }, [loading, session, id])

  // 1. Audio Recording Loop for Host/Moderator (Zero-Gap Continuous Standalone Chunks)
  useEffect(() => {
    if (loading || !session || !id) return

    let isRecordingActive = true
    let recordingTimer: any = null

    if (isHostSpeaker && !isMuted) {
      navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      })
        .then(stream => {
          if (!isRecordingActive) {
            stream.getTracks().forEach(t => t.stop())
            return
          }
          localStreamRef.current = stream

          // Check browser codec support
          let mimeType = 'audio/webm;codecs=opus'
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/webm'
            if (!MediaRecorder.isTypeSupported(mimeType)) {
              mimeType = 'audio/mp4' // iOS Safari fallback
              if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = '' // Browser native fallback
              }
            }
          }

          const recordChunk = () => {
            if (!isRecordingActive || !localStreamRef.current) return

            try {
              const recorder = new MediaRecorder(localStreamRef.current, mimeType ? { mimeType } : undefined)
              mediaRecorderRef.current = recorder
              const chunks: Blob[] = []

              recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                  chunks.push(e.data)
                }
              }

              recorder.onstop = () => {
                // Immediately start the next segment so no microphone speech is lost!
                if (isRecordingActive && isHostSpeaker && !isMutedRef.current) {
                  recordChunk()
                }

                // Asynchronously upload the completed standalone chunk in background
                if (chunks.length > 0) {
                  const blobType = mimeType || recorder.mimeType || 'audio/webm'
                  const completeBlob = new Blob(chunks, { type: blobType })
                  if (completeBlob.size > 300) {
                    const currentSeq = sequenceCounterRef.current++
                    scheduleApi.uploadAudio(id, currentSeq, completeBlob).catch(err => {
                      console.warn('[Live Audio] Audio chunk upload error:', err)
                    })
                  }
                }
              }

              recorder.start()
              // 2-second standalone chunks for responsive low-latency streaming
              recordingTimer = setTimeout(() => {
                if (recorder.state === 'recording') {
                  recorder.stop()
                }
              }, 2000)
            } catch (err) {
              console.error('[Live Audio] MediaRecorder error:', err)
            }
          }

          recordChunk()
        })
        .catch(err => {
          console.error('[Live Audio] Microphone error:', err)
          toast.error('Microphone access is required to host the live audio room.')
          setIsMuted(true)
        })
    }

    return () => {
      isRecordingActive = false
      if (recordingTimer) clearTimeout(recordingTimer)
      stopRecording()
    }
  }, [loading, session, id, isHostSpeaker, isMuted])

  // 2. Client Audio Playback Playlist Manager
  const playNextChunk = () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false
      return
    }

    if (isModeratorRef.current) {
      audioQueueRef.current = []
      isPlayingRef.current = false
      return
    }

    isPlayingRef.current = true
    const nextUrl = audioQueueRef.current.shift()!
    const secureUrl = getMediaUrl(nextUrl) || nextUrl
    const audio = new Audio(secureUrl)
    currentAudioRef.current = audio
    audio.volume = isDeafenedRef.current ? 0 : 1

    audio.onended = () => {
      playNextChunk()
    }

    audio.onerror = (e) => {
      console.warn('[Live Audio] Playback chunk error (advancing to next):', e)
      playNextChunk()
    }

    audio.play().catch(err => {
      console.warn('[Live Audio] Autoplay blocked by browser policy:', err)
      audioQueueRef.current.unshift(nextUrl)
      isPlayingRef.current = false
      setIsAutoplayBlocked(true)
    })
  }

  const unlockAudioPlayback = () => {
    setIsAutoplayBlocked(false)
    isAutoplayBlockedRef.current = false
    if (!isPlayingRef.current && audioQueueRef.current.length > 0) {
      playNextChunk()
    }
  }

  // 3. Join room, start Polling (Heartbeat & Sync) Loop
  useEffect(() => {
    if (loading || !session || !id) return

    // Countdown timer
    const timer = setInterval(() => {
      const remaining = getSessionTimeLeft(session)
      setTimeLeft(remaining)

      if (remaining <= 0 && !liveEndedNotifiedRef.current) {
        liveEndedNotifiedRef.current = true
        clearInterval(timer)
        toast.info('The live prayer session has concluded. Thank you for praying together!')
        navigate('/joint-prayer')
      }
    }, 1000)

    // 1.2-second Sync loop
    const syncInterval = setInterval(() => {
      // 1. Send Heartbeat to keep active list correct
      scheduleApi.sendHeartbeat(id)
        .then(res => {
          if (res && typeof res.participant_count === 'number') {
            setListenerCount(res.participant_count)
          }
        })
        .catch(() => {})

      // 2. Synchronize Chat, Participants, Reactions, and Audio Chunks
      scheduleApi.syncRoom(id, lastMsgIdRef.current, lastReactIdRef.current, lastSequenceRef.current)
        .then(data => {
          if (!data) return

          // Sync Participants
          if (Array.isArray(data.participants)) {
            const mapped: Participant[] = data.participants.map((p: any) => ({
              id: p.id.toString(),
              user_id: p.user_id,
              name: p.name,
              avatar: p.avatar,
              isCoModerator: p.is_co_moderator
            }))
            setParticipants(mapped)

            // Dynamic Co-Moderator promotion check for current user
            const currentParticipant = mapped.find(p => p.user_id === userIdRef.current)
            if (currentParticipant && currentParticipant.isCoModerator && isMutedRef.current) {
              toast.success('You have been promoted to Co-Host. You can now unmute and speak!')
            }
          }

          // Sync Audio Chunks (Only for listeners, speakers don't need to listen to their own voice)
          if (!isModeratorRef.current && !isDeafenedRef.current && Array.isArray(data.audio_chunks) && data.audio_chunks.length > 0) {
            // Sort ascending by sequence
            const sortedChunks = [...data.audio_chunks].sort((a, b) => a.sequence - b.sequence)
            const newUrls: string[] = []
            
            for (const c of sortedChunks) {
              if (c.sequence > lastSequenceRef.current) {
                lastSequenceRef.current = c.sequence
                const secureUrl = getMediaUrl(c.url) || c.url
                if (secureUrl) newUrls.push(secureUrl)
              }
            }
            
            if (newUrls.length > 0) {
              audioQueueRef.current.push(...newUrls)
              if (!isPlayingRef.current) {
                playNextChunk()
              }
            }
          }

          // Sync New Chat Messages
          if (Array.isArray(data.messages) && data.messages.length > 0) {
            const newMsgs: ChatMessage[] = data.messages.map((m: any) => ({
              id: m.id.toString(),
              user: m.user_name,
              text: m.text,
              time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isAmen: m.text.toLowerCase().includes('amen')
            }))
            setMessages(prev => {
              const ids = new Set(prev.map(p => p.id))
              const filteredNew = newMsgs.filter(m => !ids.has(m.id))
              return [...prev, ...filteredNew]
            })
            const maxId = Math.max(...data.messages.map((m: any) => m.id))
            if (maxId > lastMsgIdRef.current) {
              lastMsgIdRef.current = maxId
            }
          }

          // Sync New Reactions
          if (Array.isArray(data.reactions) && data.reactions.length > 0) {
            const newReacts: FloatingReaction[] = data.reactions.map((r: any) => ({
              id: r.id,
              emoji: r.emoji,
              label: r.label,
              x: r.x
            }))
            setReactions(prev => [...prev, ...newReacts])
            setTimeout(() => {
              setReactions(prev => prev.filter(r => !newReacts.map(nr => nr.id).includes(r.id)))
            }, 2200)

            const maxReactId = Math.max(...data.reactions.map((r: any) => r.id))
            if (maxReactId > lastReactIdRef.current) {
              lastReactIdRef.current = maxReactId
            }
          }
        })
        .catch(() => {})
    }, 2000)

    // Audio Visualizer simulator loop
    const visualizerInterval = setInterval(() => {
      if (isModeratorRef.current && !isMutedRef.current) {
        setAudioLevel(Math.floor(Math.random() * 55) + 35)
      } else {
        setAudioLevel(12)
      }
    }, 200)

    return () => {
      clearInterval(timer)
      clearInterval(syncInterval)
      clearInterval(visualizerInterval)
      
      // Stop audio playback immediately and clear queue
      if (currentAudioRef.current) {
        currentAudioRef.current.pause()
        currentAudioRef.current.src = ''
        currentAudioRef.current = null
      }
      audioQueueRef.current = []
      isPlayingRef.current = false
      
      // Call leave endpoint on exit if not already left
      if (!hasLeftRef.current && id) {
        scheduleApi.leaveRoom(id).catch(() => {})
      }
    }
  }, [loading, session, id, navigate])

  // Autoplay Unlock Effect
  useEffect(() => {
    const unlock = () => {
      if (isAutoplayBlockedRef.current) {
        unlockAudioPlayback()
      }
    }
    window.addEventListener('click', unlock)
    window.addEventListener('touchstart', unlock)
    return () => {
      window.removeEventListener('click', unlock)
      window.removeEventListener('touchstart', unlock)
    }
  }, [])

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch {}
      mediaRecorderRef.current = null
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop())
      localStreamRef.current = null
    }
  }

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const toggleMic = () => {
    if (!isHostSpeaker) {
      toast.info('Only the session moderator or appointed co-hosts can speak.')
      return
    }
    setIsMuted(!isMuted)
  }

  const toggleCoModerator = (userId: number) => {
    if (!id) return
    scheduleApi.toggleCoModerator(id, userId)
      .then(res => {
        if (res && res.status === 'co_moderator_toggled') {
          setParticipants(prev =>
            prev.map(p => p.user_id === userId ? { ...p, isCoModerator: res.is_co_moderator } : p)
          )
          toast.success(res.is_co_moderator ? 'Promoted user to Co-Host' : 'Revoked Co-Host status')
        }
      })
      .catch(() => {
        toast.error('Failed to change moderator status')
      })
  }

  const sendReaction = (emoji: string, label: string) => {
    if (!id) return
    
    if (id.startsWith('s')) {
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
      return
    }

    // Broadcast reaction to server
    scheduleApi.sendLiveReaction(id, emoji, label)
      .then(res => {
        // Optimistic local add
        const newReaction: FloatingReaction = {
          id: res.id || (Date.now() + Math.random()),
          emoji,
          label,
          x: Math.floor(Math.random() * 70) + 15,
        }
        setReactions(prev => [...prev, newReaction])
        setTimeout(() => {
          setReactions(prev => prev.filter(r => r.id !== newReaction.id))
        }, 2200)
      })
      .catch(() => {})
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !id) return

    const text = chatInput.trim()
    setChatInput('')

    if (id.startsWith('s')) {
      const newMsg: ChatMessage = {
        id: Math.random().toString(),
        user: user?.name || user?.username || 'Me',
        text: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAmen: text.toLowerCase().includes('amen')
      }
      setMessages(prev => [...prev, newMsg])
      return
    }

    // Send message to server
    scheduleApi.sendLiveMessage(id, text)
      .then(m => {
        // Optimistic local add
        const newMsg: ChatMessage = {
          id: m.id.toString(),
          user: m.user_name,
          text: m.text,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAmen: m.text.toLowerCase().includes('amen')
        }
        setMessages(prev => [...prev, newMsg])
        if (m.id > lastMsgIdRef.current) {
          lastMsgIdRef.current = m.id
        }
      })
      .catch(() => {
        toast.error('Failed to send message')
      })
  }

  const handleLeaveClick = () => {
    if (isHostSpeaker && user?.id === session?.host_id) {
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
        {isAutoplayBlocked && (
          <div className="absolute top-4 left-4 right-4 bg-amber-500/20 border border-amber-500/35 rounded-xl p-3 flex items-center justify-between gap-3 z-50 animate-bounce">
            <div className="flex items-center gap-2 text-amber-200 text-left">
              <VolumeX size={15} className="animate-pulse text-amber-400 shrink-0" />
              <span className="text-[11px] font-medium leading-relaxed">Audio is blocked by your browser. Click anywhere to unmute and listen live.</span>
            </div>
            <Button size="sm" onClick={unlockAudioPlayback} className="h-7 rounded-lg text-[10px] py-1 px-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold shrink-0">
              Unmute
            </Button>
          </div>
        )}
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
              <AvatarImage src={getMediaUrl(session.host_avatar)} />
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

        {/* Mobile Panel Tabs Switcher */}
        <div className="flex md:hidden w-full gap-2 mb-2">
          <button
            type="button"
            onClick={() => setActivePanel('chat')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
              activePanel === 'chat'
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm font-bold'
                : 'bg-white/5 border-white/10 text-stone-400 hover:bg-white/10'
            }`}
          >
            Live Chat
          </button>
          <button
            type="button"
            onClick={() => setActivePanel('listeners')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
              activePanel === 'listeners'
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm font-bold'
                : 'bg-white/5 border-white/10 text-stone-400 hover:bg-white/10'
            }`}
          >
            Listeners ({participants.length})
          </button>
        </div>

        {/* ── Chat & Listeners Panel ── */}
        <div className="w-full mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 h-64 md:h-56">
          {/* Live Chat Panel */}
          <div className={`rounded-xl bg-black/40 border border-white/10 p-3 flex flex-col h-full ${
            activePanel === 'chat' ? 'flex' : 'hidden md:flex'
          }`}>
            <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-white/10 text-xs font-semibold text-stone-300">
              <MessageCircle size={14} className="text-blue-400" />
              Live Chat
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {messages.length > 0 ? (
                messages.map(m => (
                  <div key={m.id} className="leading-relaxed text-left">
                    <span className="font-semibold text-emerald-400 mr-1.5">{m.user}:</span>
                    <span className={m.isAmen ? 'text-amber-300 font-medium' : 'text-stone-200'}>{m.text}</span>
                  </div>
                ))
              ) : (
                <p className="text-stone-500 text-center py-6">No chat messages yet. Write a prayer watch word!</p>
              )}
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
          <div className={`rounded-xl bg-black/40 border border-white/10 p-3 flex flex-col h-full overflow-hidden text-left ${
            activePanel === 'listeners' ? 'flex' : 'hidden md:flex'
          }`}>
            <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-white/10 text-xs font-semibold text-stone-300">
              <Users size={14} className="text-blue-400" />
              Active Listeners ({participants.length})
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {participants.length > 0 ? (
                participants.map(p => (
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
                    {isHostSpeaker && p.user_id !== session?.host_id && (
                      <button
                        type="button"
                        onClick={() => toggleCoModerator(p.user_id)}
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
                ))
              ) : (
                <p className="text-stone-500 text-center py-6">Connecting participants...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Controls Bar ── */}
      <div className="p-4 bg-[#161c27] border-t border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {isHostSpeaker ? (
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
              <Shield size={20} className={participants.some(p => p.isCoModerator && p.user_id !== session?.host_id) ? "text-amber-400" : "text-red-400"} />
              {participants.some(p => p.isCoModerator && p.user_id !== session?.host_id) ? "Leave Live Session?" : "End Live Session for Everyone?"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-stone-300 space-y-2 text-left">
            {participants.some(p => p.isCoModerator && p.user_id !== session?.host_id) ? (
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
              onClick={async () => {
                setShowExitWarning(false)
                hasLeftRef.current = true

                if (!id) return
                
                if (id.startsWith('s')) {
                  const hasCoMod = participants.some(p => p.isCoModerator && p.user_id !== session?.host_id)
                  if (hasCoMod) {
                    const firstCoMod = participants.find(p => p.isCoModerator && p.user_id !== session?.host_id)
                    toast.success(`Room handed over to Co-Host: ${firstCoMod?.name || 'Co-Host'}`)
                  } else {
                    toast.success('Live prayer session has been ended successfully.')
                  }
                  navigate('/joint-prayer')
                  return
                }

                try {
                  const res = await scheduleApi.leaveRoom(id)
                  if (res && res.status === 'handed_over') {
                    toast.success(`Room handed over to Co-Host: ${res.co_moderator_name}`)
                  } else if (res && res.status === 'ended') {
                    toast.success('Live prayer session has been ended successfully.')
                  } else {
                    toast.success('Left the live session.')
                  }
                } catch {
                  toast.error('Failed to leave room cleanly.')
                }
                navigate('/joint-prayer')
              }}
              className={participants.some(p => p.isCoModerator && p.user_id !== session?.host_id) ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-red-600 hover:bg-red-500 text-white"}
            >
              {participants.some(p => p.isCoModerator && p.user_id !== session?.host_id) ? "Leave Room" : "End Session & Exit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
