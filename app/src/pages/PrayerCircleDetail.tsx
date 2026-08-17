import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { circleApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getMediaUrl } from '@/lib/utils'
import { toast } from 'sonner'
import {
  ArrowLeft, Users, Lock, Globe, MessageSquare, Send,
  Shield, Calendar, HandHeart, Flame, Briefcase, UserPlus, Church, Sparkles, ImagePlus, X
} from 'lucide-react'

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

const REACTIONS = [
  { type: 'amen', emoji: '🙏', label: 'Amen' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'fire', emoji: '🔥', label: 'Fire' },
  { type: 'strength', emoji: '💪', label: 'Strength' },
  { type: 'peace', emoji: '🕊️', label: 'Peace' },
]

export default function PrayerCircleDetail() {
  const { id } = useParams<{ id: string }>()
  const circleId = parseInt(id || '0', 10)
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [circle, setCircle] = useState<any>(null)
  const [isMember, setIsMember] = useState(false)
  const [memberRole, setMemberRole] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [messageText, setMessageText] = useState('')
  const [activeTab, setActiveTab] = useState<'discussion' | 'members'>('discussion')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const isModerator = memberRole === 'moderator'

  const loadCircleDetails = async () => {
    try {
      const data = await circleApi.get(circleId)
      setCircle(data)
      if (isAuthenticated) {
        const membership = await circleApi.checkMembership(circleId)
        setIsMember(membership.is_member)
        setMemberRole(membership.role)
      }
    } catch (err: any) {
      toast.error('Failed to load circle details')
      navigate('/joint-prayer')
    }
  }

  const loadMessages = async () => {
    if (!circleId) return
    try {
      const data = await circleApi.getMessages(circleId)
      setMessages(data)
    } catch (err) {
      // Ignored if forbidden
    }
  }

  const loadMembers = async () => {
    if (!circleId) return
    try {
      const data = await circleApi.getMembers(circleId)
      setMembers(data)
    } catch (err) {
      // Ignored if forbidden
    }
  }

  useEffect(() => {
    if (!circleId) return
    setLoading(true)
    Promise.all([loadCircleDetails(), loadMessages(), loadMembers()]).finally(() => {
      setLoading(false)
    })
  }, [circleId, isAuthenticated])

  const handleJoinLeave = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in first')
      navigate('/login')
      return
    }

    try {
      if (isMember) {
        await circleApi.leave(circleId)
        toast.success('Left circle')
        setIsMember(false)
        setMemberRole(null)
      } else {
        await circleApi.join(circleId)
        toast.success('Joined circle successfully!')
        setIsMember(true)
        setMemberRole('member')
      }
      loadCircleDetails()
      loadMembers()
      loadMessages()
    } catch (err: any) {
      toast.error(err.message || 'Operation failed')
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }
    setSelectedImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const clearImage = () => {
    setSelectedImage(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
  }

  const handlePostMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() && !selectedImage) return
    setPosting(true)
    try {
      if (selectedImage) {
        await circleApi.postMessageWithImage(circleId, messageText.trim(), selectedImage)
      } else {
        await circleApi.postMessage(circleId, messageText.trim())
      }
      setMessageText('')
      clearImage()
      loadMessages()
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message')
    }
    setPosting(false)
  }

  const handleReact = async (messageId: number, reactionType: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to react')
      return
    }
    try {
      const result = await circleApi.reactToMessage(circleId, messageId, reactionType)
      // Update the message in state with new reaction data
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? { ...msg, reactions: result.reactions, user_reactions: result.user_reactions }
          : msg
      ))
    } catch (err: any) {
      toast.error(err.message || 'Failed to react')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!circle) return null

  const CatIcon = categoryIcons[circle.category] ?? Church
  const catColor = categoryColors[circle.category] ?? categoryColors.general

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link to="/joint-prayer" className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline" style={{ color: 'var(--eleven-text-secondary)' }}>
          <ArrowLeft size={14} /> Back to Joint Prayer
        </Link>
      </div>

      {/* Circle details header */}
      <div className="bg-white rounded-xl p-6 border flex flex-col md:flex-row md:items-center justify-between gap-6" style={{ borderColor: 'var(--eleven-border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: catColor.light }}>
            <CatIcon size={22} style={{ color: catColor.text }} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <h1 className="font-display text-xl sm:text-2xl font-bold" style={{ color: 'var(--eleven-text)' }}>{circle.name}</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: catColor.bg, color: catColor.text }}><CatIcon size={10} /> {circle.category}</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 border" style={{ color: 'var(--eleven-text-secondary)' }}>
                {circle.is_public ? <Globe size={10} /> : <Lock size={10} />}
                {circle.is_public ? 'Public Circle' : 'Private Circle'}
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--eleven-text-secondary)' }}>{circle.description}</p>
            <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: 'var(--eleven-text-muted)' }}>
              <span className="flex items-center gap-1.5"><Users size={14} /> {circle.member_count} members</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} /> Created {new Date(circle.created_at).toLocaleDateString()}</span>
              <span>Hosted by <strong className="font-semibold">{circle.owner_name}</strong></span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Button
            onClick={handleJoinLeave}
            className={`rounded-full px-6 font-semibold text-xs h-9 ${isMember ? 'bg-stone-100 hover:bg-stone-200 text-stone-700' : 'text-white'}`}
            style={isMember ? {} : { background: 'var(--eleven-accent)' }}
          >
            {isMember ? 'Leave Circle' : 'Join Circle'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b" style={{ borderColor: 'var(--eleven-border)' }}>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('discussion')}
            className={`pb-3 text-sm font-semibold relative transition-colors ${activeTab === 'discussion' ? 'text-foreground' : 'text-stone-400 hover:text-stone-600'}`}
          >
            <span className="flex items-center gap-1.5"><MessageSquare size={16} /> Chat Wall</span>
            {activeTab === 'discussion' && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: 'var(--eleven-accent)' }} />}
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 text-sm font-semibold relative transition-colors ${activeTab === 'members' ? 'text-foreground' : 'text-stone-400 hover:text-stone-600'}`}
          >
            <span className="flex items-center gap-1.5"><Users size={16} /> Members Directory</span>
            {activeTab === 'members' && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: 'var(--eleven-accent)' }} />}
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'discussion' ? (
          <div className="space-y-6">
            {/* Post message box */}
            {isMember ? (
              <form onSubmit={handlePostMessage} className="bg-white rounded-xl p-4 border space-y-3" style={{ borderColor: 'var(--eleven-border)' }}>
                <Label htmlFor="msg-text" className="text-xs font-semibold" style={{ color: 'var(--eleven-text)' }}>Post to the Wall</Label>
                <Textarea
                  id="msg-text"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder={isModerator ? 'Share a prayer request, encouragement, verse, or image...' : 'Share a prayer request, encouragement, or verse with the circle...'}
                  rows={2}
                  className="text-xs resize-none"
                />
                {imagePreview && (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Preview" className="max-h-32 rounded-lg border" style={{ borderColor: 'var(--eleven-border)' }} />
                    <button type="button" onClick={clearImage} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors">
                      <X size={12} />
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    {isModerator && (
                      <label className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer px-3 py-1.5 rounded-lg border hover:bg-stone-50 transition-colors" style={{ color: 'var(--eleven-text-secondary)', borderColor: 'var(--eleven-border)' }}>
                        <ImagePlus size={14} />
                        <span>Add Image</span>
                        <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleImageSelect} className="hidden" />
                      </label>
                    )}
                  </div>
                  <Button type="submit" size="sm" className="rounded-lg text-xs text-white" style={{ background: 'var(--eleven-accent)' }} disabled={posting || (!messageText.trim() && !selectedImage)}>
                    <Send size={12} className="mr-1.5" /> {posting ? 'Posting...' : 'Post Message'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-6 bg-stone-50/50 rounded-xl text-center border" style={{ borderColor: 'var(--eleven-border)' }}>
                <p className="text-xs mb-3" style={{ color: 'var(--eleven-text-secondary)' }}>You must be a member of this circle to view and share encouragement on the wall.</p>
                <Button size="sm" className="rounded-full text-xs text-white" style={{ background: 'var(--eleven-accent)' }} onClick={handleJoinLeave}>Join Circle</Button>
              </div>
            )}

            {/* Discussion Feed */}
            {isMember && (
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--eleven-text)' }}>Recent Updates</h3>
                {messages.length > 0 ? (
                  <div className="space-y-3">
                    {messages.map(msg => (
                      <div key={msg.id} className="bg-white rounded-xl p-4 border flex gap-3" style={{ borderColor: 'var(--eleven-border)' }}>
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src={getMediaUrl(msg.author_avatar)} />
                          <AvatarFallback className="text-xs font-medium" style={{ background: 'var(--eleven-accent-light)', color: 'var(--eleven-accent-dark)' }}>{(msg.author_name ?? 'U').charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-xs font-semibold" style={{ color: 'var(--eleven-text)' }}>{msg.author_name}</span>
                            {msg.user_id === circle.created_by && <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200"><Shield size={10} /> Host</span>}
                            <span className="text-[10px]" style={{ color: 'var(--eleven-text-muted)' }}>&middot; {new Date(msg.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                          </div>
                          <p className="text-xs whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--eleven-text-secondary)' }}>{msg.content}</p>
                          {msg.image && (
                            <img src={msg.image} alt="Shared image" className="mt-2 max-w-full max-h-64 rounded-lg border cursor-pointer hover:opacity-90 transition-opacity" style={{ borderColor: 'var(--eleven-border)' }} onClick={() => window.open(msg.image, '_blank')} />
                          )}
                          {/* Reaction bar */}
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            {REACTIONS.map(r => {
                              const count = msg.reactions?.[r.type] || 0
                              const isActive = msg.user_reactions?.includes(r.type)
                              return (
                                <button
                                  key={r.type}
                                  onClick={() => handleReact(msg.id, r.type)}
                                  title={r.label}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all duration-200 hover:scale-105 ${
                                    isActive
                                      ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm'
                                      : 'border-transparent bg-stone-50 text-stone-500 hover:bg-stone-100 hover:border-stone-200'
                                  }`}
                                >
                                  <span className="text-sm">{r.emoji}</span>
                                  {count > 0 && <span>{count}</span>}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-center py-8" style={{ color: 'var(--eleven-text-muted)' }}>No messages shared yet. Be the first to encourage the circle!</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--eleven-text)' }}>Circle Members</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {members.map(member => (
                <div key={member.id} className="bg-white rounded-xl p-4 border flex items-center justify-between" style={{ borderColor: 'var(--eleven-border)' }}>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={getMediaUrl(member.user_avatar)} />
                      <AvatarFallback className="text-xs font-medium" style={{ background: 'var(--eleven-accent-light)', color: 'var(--eleven-accent-dark)' }}>{(member.user_name ?? 'U').charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--eleven-text)' }}>{member.user_name}</p>
                      <p className="text-[10px]" style={{ color: 'var(--eleven-text-muted)' }}>Joined {new Date(member.joined_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {member.role === 'moderator' ? (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200"><Shield size={10} /> Moderator</span>
                  ) : (
                    <span className="text-[9px] font-medium bg-stone-50 text-stone-500 px-1.5 py-0.5 rounded border">Member</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
