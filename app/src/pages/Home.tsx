import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { testimonyApi, prayerApi, scheduleApi, forumApi } from '@/lib/api'
import {
  Play, ChevronDown, Heart, MessageCircle, Bookmark,
  Share2, Users, HandHeart, Church, Flame, Briefcase,
  UserPlus, Sparkles, ArrowRight, ChevronLeft, ChevronRight, Pause, Calendar, Megaphone
} from 'lucide-react'
import { TestimonyCard, TestimonyDetailModal, categoryIcons, categoryColors, timeAgo } from '@/components/TestimonyCardShared'

// ── Hero Section ──
function HeroSection() {
  return (
    <section className="relative overflow-hidden flex items-center justify-center text-center px-4" style={{ minHeight: 480, background: 'linear-gradient(135deg, #F5F0EB 0%, #FAF9F6 60%, #F5F0EB 100%)' }}>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full" style={{ background: 'radial-gradient(circle, var(--eleven-accent) 0%, transparent 70%)' }} />
      </div>
      <div className="relative z-10 max-w-2xl mx-auto">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--eleven-accent)' }}>Welcome to ELEVEN</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-4" style={{ color: 'var(--eleven-text)' }}>Share Your Story.<br/>Join the Prayer.</h1>
        <p className="text-base sm:text-lg mb-8 max-w-lg mx-auto" style={{ color: 'var(--eleven-text-secondary)' }}>A global community where testimonies ignite faith and prayers create miracles.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/testimonies"><Button size="lg" className="rounded-full px-6 font-semibold text-sm" style={{ background: 'var(--eleven-accent)' }}>Share Testimony</Button></Link>
          <Link to="/prayer-room"><Button variant="outline" size="lg" className="rounded-full px-6 font-semibold text-sm" style={{ borderColor: 'var(--eleven-accent)', color: 'var(--eleven-accent)' }}>Enter Prayer Room</Button></Link>
        </div>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce" style={{ color: 'var(--eleven-text-muted)' }}><ChevronDown size={24} /></div>
    </section>
  )
}

// ── SlideShow Board ──
function SlideShowBoard() {
  const [current, setCurrent] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  const slides = [
    {
      id: 1,
      type: 'event',
      badge: 'Featured Event',
      title: 'Global Prayer Summit 2026',
      description: 'Join millions worldwide for 24 hours of non-stop prayer, worship, and miracles. Live broadcast on ELEVEN TV.',
      metaIcon: Calendar,
      metaText: 'Live: Saturday, July 12th at 6:00 PM (WAT)',
      ctaText: 'View Schedule',
      link: '/joint-prayer',
      bg: 'linear-gradient(135deg, #111827 0%, #1e1b4b 100%)',
      mediaType: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 2,
      type: 'ad',
      badge: 'Partner Spotlight',
      title: 'Experience Premium Watch Circles',
      description: 'Create your own prayer circles, host live watch sessions, and share unlimited audio/video testimonies in Naira.',
      metaIcon: Megaphone,
      metaText: 'From ₦5,000/mo — Cancel anytime',
      ctaText: 'Explore Tiers',
      link: '/pricing',
      bg: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
      mediaType: 'video',
      mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-worshippers-hands-raised-at-church-summit-41846-large.mp4'
    },
    {
      id: 3,
      type: 'event',
      badge: 'Community Gathering',
      title: 'Annual Youth Testimony Gathering',
      description: 'An evening of praise, fellowship, and listening to how God is moving in the lives of the next generation.',
      metaIcon: Calendar,
      metaText: 'Location: Lagos Faith Center & Online',
      ctaText: 'Join Circle',
      link: '/community',
      bg: 'linear-gradient(135deg, #581c87 0%, #3b0764 100%)',
      mediaType: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?auto=format&fit=crop&q=80&w=1200'
    }
  ]

  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [isPlaying, slides.length])

  const nextSlide = () => setCurrent(prev => (prev + 1) % slides.length)
  const prevSlide = () => setCurrent(prev => (prev - 1 + slides.length) % slides.length)

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 my-8 overflow-hidden rounded-2xl group" style={{ height: 400 }}>
      {slides.map((slide, idx) => {
        const isSelected = idx === current
        const MetaIcon = slide.metaIcon
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full flex flex-col justify-end p-6 sm:p-12 transition-all duration-700 ease-in-out ${
              isSelected ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 z-0 translate-x-full'
            }`}
            style={{ background: slide.bg }}
          >
            {/* Background Media */}
            <div className="absolute inset-0 w-full h-full opacity-40 mix-blend-overlay overflow-hidden">
              {slide.mediaType === 'video' ? (
                <video
                  src={slide.mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={slide.mediaUrl}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {/* Radial Gradient overlay for luxury contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

            {/* Slide Content */}
            <div className="relative z-20 max-w-2xl text-white space-y-3 sm:space-y-4 animate-fade-in-up">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <Sparkles size={10} /> {slide.badge}
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold leading-tight text-white">{slide.title}</h2>
              <p className="text-xs sm:text-sm text-stone-200 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl">{slide.description}</p>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                <span className="flex items-center gap-1.5 text-xs text-white/80"><MetaIcon size={14} /> {slide.metaText}</span>
                <Link to={slide.link} className="inline-block">
                  <Button className="rounded-full px-5 font-semibold text-xs h-9 text-stone-900 bg-white hover:bg-stone-100 transition-all hover:scale-105">
                    {slide.ctaText}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )
      })}

      {/* Slide Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 text-white/80 hover:text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 text-white/80 hover:text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
      >
        <ChevronRight size={20} />
      </button>

      {/* Bottom Controls / Indicator Dots */}
      <div className="absolute bottom-4 right-6 z-30 flex items-center gap-3">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-1 rounded bg-black/40 text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          {isPlaying ? <Pause size={12} /> : <Play size={12} />}
        </button>
        <div className="flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === current ? 'w-4 bg-white' : 'w-1.5 bg-white/45'}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Trending Section ──
function TrendingSection() {
  const { isAuthenticated } = useAuth()
  const [testimonies, setTestimonies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTestimony, setSelectedTestimony] = useState<any>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const load = () => {
    testimonyApi.list({ sort: 'popular', limit: '6' }).then(r => {
      const results = r.results ?? r
      setTestimonies(results)
      setIsLoading(false)
      if (selectedTestimony) {
        const updated = results.find((item: any) => item.id === selectedTestimony.id)
        if (updated) setSelectedTestimony(updated)
      }
    }).catch(() => setIsLoading(false))
  }

  const loadWithoutSpinner = () => {
    testimonyApi.list({ sort: 'popular', limit: '6' }).then(r => {
      const results = r.results ?? r
      setTestimonies(results)
      if (selectedTestimony) {
        const updated = results.find((item: any) => item.id === selectedTestimony.id)
        if (updated) setSelectedTestimony(updated)
      }
    }).catch(() => {})
  }

  const handleToggleReaction = async (testimonyId: number) => {
    if (!isAuthenticated) {
      toast.error('Please sign in first to react')
      return
    }

    let previousTestimony: any = null
    setTestimonies(prev => prev.map(t => {
      if (t.id === testimonyId) {
        previousTestimony = { ...t }
        const nextReacted = !t.has_reacted
        return {
          ...t,
          has_reacted: nextReacted,
          amen_count: nextReacted ? t.amen_count + 1 : Math.max(0, t.amen_count - 1)
        }
      }
      return t
    }))

    setSelectedTestimony(prev => {
      if (prev && prev.id === testimonyId) {
        const nextReacted = !prev.has_reacted
        return {
          ...prev,
          has_reacted: nextReacted,
          amen_count: nextReacted ? prev.amen_count + 1 : Math.max(0, prev.amen_count - 1)
        }
      }
      return prev
    })

    try {
      const res = await testimonyApi.amen(testimonyId)
      if (res) {
        setTestimonies(prev => prev.map(t => {
          if (t.id === testimonyId) {
            return {
              ...t,
              has_reacted: res.reacted,
              amen_count: res.amen_count
            }
          }
          return t
        }))
        setSelectedTestimony(prev => {
          if (prev && prev.id === testimonyId) {
            return {
              ...prev,
              has_reacted: res.reacted,
              amen_count: res.amen_count
            }
          }
          return prev
        })
      }
    } catch (err) {
      if (previousTestimony) {
        setTestimonies(prev => prev.map(t => t.id === testimonyId ? previousTestimony : t))
        setSelectedTestimony(prev => (prev && prev.id === testimonyId) ? previousTestimony : prev)
      }
      toast.error('Failed to update reaction')
    }
  }

  useEffect(() => { load() }, [])

  return (
    <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold" style={{ color: 'var(--eleven-text)' }}>Trending Now</h2>
        <Link to="/testimonies" className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--eleven-accent)' }}>View All <ArrowRight size={14} /></Link>
      </div>
      {isLoading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3].map(i => <Skeleton key={i} className="h-72 rounded-xl" />)}</div> :
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonies.map(t => (
            <TestimonyCard 
              key={t.id} 
              t={t} 
              onSelect={() => { setSelectedTestimony(t); setDetailOpen(true) }} 
              onAmen={handleToggleReaction} 
            />
          ))}
        </div>}

      {selectedTestimony && (
        <TestimonyDetailModal
          t={selectedTestimony}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onUpdate={(id) => id ? handleToggleReaction(id) : loadWithoutSpinner()}
        />
      )}
    </section>
  )
}

// ── Live Banner ──
function LiveBanner() {
  const [live, setLive] = useState<any>(null)
  useEffect(() => { scheduleApi.live().then(r => setLive(r)).catch(() => {}) }, [])
  if (!live) return null
  return (
    <section className="py-4 px-4 sm:px-6" style={{ background: 'linear-gradient(90deg, #7B8B6F, #8B9B7F)' }}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-bold text-white"><span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" /> LIVE NOW</span>
          <span className="text-sm font-medium text-white/90">{live.title}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/80 flex items-center gap-1"><Users size={14} /> {live.participant_count} joined</span>
          <Link to="/joint-prayer"><Button size="sm" className="bg-white hover:bg-white/90 font-semibold text-xs" style={{ color: '#7B8B6F' }}>Join Now</Button></Link>
        </div>
      </div>
    </section>
  )
}

// ── Prayer Card ──
function PrayerCard({ p }: { p: any }) {
  const catColor = categoryColors[p.category] ?? categoryColors.general
  const urgencyColors: Record<string, { dot: string; label: string }> = { low: { dot: '#A39E98', label: 'Low' }, medium: { dot: '#D4A843', label: 'Medium' }, high: { dot: '#C75B5B', label: 'High' } }
  const urgency = urgencyColors[p.urgency] ?? urgencyColors.low
  return (
    <div className="bg-white rounded-xl p-4 transition-all duration-300 hover:shadow-md" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderLeft: `3px solid var(--eleven-prayer)` }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--eleven-surface-elevated)', color: 'var(--eleven-text-secondary)' }}>{p.is_anonymous ? 'Anonymous' : (p.author_name ?? 'User')}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: catColor.bg, color: catColor.text }}>{p.category}</span>
        <span className="ml-auto flex items-center gap-1 text-[10px] font-medium" style={{ color: urgency.dot }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: urgency.dot }} />{urgency.label}</span>
      </div>
      <p className="text-sm leading-relaxed mb-3 line-clamp-3" style={{ color: 'var(--eleven-text)' }}>{p.content}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--eleven-text-muted)' }}><HandHeart size={12} /> {p.prayer_count} praying</span>
        <span className="text-xs" style={{ color: 'var(--eleven-text-muted)' }}>{timeAgo(p.created_at)}</span>
      </div>
    </div>
  )
}

// ── Prayer Section ──
function PrayerSection() {
  const [prayers, setPrayers] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    prayerApi.list({ limit: '4' }).then(r => { setPrayers(r.results ?? r); setIsLoading(false) }).catch(() => setIsLoading(false))
    prayerApi.stats().then(setStats).catch(() => {})
  }, [])

  return (
    <section className="py-16 px-4 sm:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold" style={{ color: 'var(--eleven-text)' }}>Prayer Requests</h2>
          <Link to="/prayer-room"><Button variant="outline" size="sm" className="rounded-full font-medium text-xs" style={{ borderColor: 'var(--eleven-accent)', color: 'var(--eleven-accent)' }}>Submit a Request</Button></Link>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">{isLoading ? [1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />) : prayers.map(p => <PrayerCard key={p.id} p={p} />)}</div>
          <div className="lg:w-72 space-y-4">
            <div className="rounded-xl p-5" style={{ background: 'var(--eleven-surface-elevated)' }}>
              <h3 className="font-display text-lg font-semibold mb-4" style={{ color: 'var(--eleven-text)' }}>Prayer Stats</h3>
              <div className="space-y-4">
                {[{ label: 'Active Requests', value: stats?.active ?? 0, icon: Users }, { label: 'Prayers Offered', value: (stats?.total ?? 0) * 12 + 391, icon: HandHeart }, { label: 'Answered', value: stats?.answered ?? 0, icon: Sparkles }].map(stat => (
                  <div key={stat.label} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--eleven-prayer-light)' }}><stat.icon size={18} style={{ color: 'var(--eleven-prayer)' }} /></div>
                    <div><p className="font-display text-xl font-bold" style={{ color: 'var(--eleven-text)' }}>{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p><p className="text-xs" style={{ color: 'var(--eleven-text-muted)' }}>{stat.label}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Video Section ──
function VideoSection() {
  const [videos, setVideos] = useState<any[]>([])
  useEffect(() => { testimonyApi.list({ type: 'video', limit: '4' }).then(r => setVideos((r.results ?? r).filter((v: any) => v.thumbnail_url))).catch(() => {}) }, [])
  if (!videos.length) return null
  return (
    <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-1" style={{ color: 'var(--eleven-text)' }}>ELEVEN TV</h2>
        <p className="text-sm" style={{ color: 'var(--eleven-text-secondary)' }}>Watch powerful testimonies and live events.</p>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
        {videos.map(v => (
          <div key={v.id} className="flex-shrink-0 w-72 snap-start group cursor-pointer">
            <div className="relative aspect-video rounded-xl overflow-hidden mb-2">
              <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center"><div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-90 group-hover:scale-110 transition-transform"><Play size={18} fill="var(--eleven-accent)" style={{ color: 'var(--eleven-accent)' }} /></div></div>
              <span className="absolute bottom-2 right-2 text-[10px] font-medium bg-black/70 text-white px-1.5 py-0.5 rounded">8:24</span>
            </div>
            <h3 className="text-sm font-semibold line-clamp-2" style={{ color: 'var(--eleven-text)' }}>{v.title}</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--eleven-text-muted)' }}>{v.view_count.toLocaleString()} views &middot; {timeAgo(v.created_at)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Community Section ──
function CommunitySection() {
  const [topics, setTopics] = useState<any[]>([])
  useEffect(() => { forumApi.list({ limit: '3' }).then(r => setTopics(r.results ?? r)).catch(() => {}) }, [])

  const forumCats: Record<string, { icon: typeof Church; color: string }> = {
    faith: { icon: Church, color: '#C4956A' }, life: { icon: Heart, color: '#7B8B6F' },
    relationships: { icon: UserPlus, color: '#8B7BB5' }, career_forum: { icon: Briefcase, color: '#5B9BC7' },
    prayer: { icon: HandHeart, color: '#C75B5B' }, general: { icon: Sparkles, color: '#6B6560' },
  }

  return (
    <section className="py-16 px-4 sm:px-6" style={{ background: 'var(--eleven-surface-elevated)' }}>
      <div className="max-w-7xl mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-8" style={{ color: 'var(--eleven-text)' }}>Community</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map(topic => {
            const cat = forumCats[topic.category] ?? forumCats.general
            const Icon = cat.icon
            return (
              <div key={topic.id} className="bg-white rounded-xl p-5 transition-all duration-300 hover:shadow-md cursor-pointer" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-3" style={{ background: `${cat.color}15` }}><Icon size={20} style={{ color: cat.color }} /></div>
                <h3 className="font-semibold text-sm mb-1 line-clamp-2" style={{ color: 'var(--eleven-text)' }}>{topic.title}</h3>
                <p className="text-xs mb-3" style={{ color: 'var(--eleven-text-muted)' }}>{topic.reply_count} replies</p>
                <Link to="/community" className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--eleven-accent)' }}>Join Discussion <ArrowRight size={12} /></Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── CTA Banner ──
function CTABanner() {
  return (
    <section className="py-20 px-4 sm:px-6 text-center" style={{ background: 'var(--eleven-dark)' }}>
      <div className="max-w-2xl mx-auto">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">Your Story Matters. Your Prayer Counts.</h2>
        <p className="text-base mb-8" style={{ color: 'var(--eleven-text-muted)' }}>Join thousands sharing faith and lifting each other in prayer.</p>
        <Link to="/login"><Button size="lg" className="rounded-full px-8 font-semibold" style={{ background: 'var(--eleven-accent)' }}>Get Started &mdash; It&apos;s Free</Button></Link>
      </div>
    </section>
  )
}

export default function Home() {
  return <div><HeroSection /><SlideShowBoard /><TrendingSection /><LiveBanner /><PrayerSection /><VideoSection /><CommunitySection /><CTABanner /></div>
}
