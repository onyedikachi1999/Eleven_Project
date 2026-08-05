import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Bell, Check, Trash2, ShieldAlert, Tv, BookOpen, MessageSquare, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  type: 'system' | 'tv' | 'forum' | 'prayer'
  read: boolean
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Welcome to ElevenFaith',
    message: 'Welcome to our spiritual community fellowship space! We are so glad to have you here.',
    time: '1 hour ago',
    type: 'system',
    read: false,
  },
  {
    id: '2',
    title: 'New Live Event on ElevenFaith TV',
    message: 'Watch premium live streams of vigils, prayers, and church services directly on our TV page.',
    time: '5 hours ago',
    type: 'tv',
    read: false,
  },
  {
    id: '3',
    title: 'Explore the Fellowship Circles',
    message: 'Join active prayer circles and share testimonies to encourage others in their faith journey.',
    time: '1 day ago',
    type: 'prayer',
    read: false,
  },
  {
    id: '4',
    title: 'Community Guidelines Update',
    message: 'Please review our updated community guidelines to maintain a pure and supportive space.',
    time: '2 days ago',
    type: 'system',
    read: true,
  }
]

export default function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    const saved = localStorage.getItem(`eleven_notifications_${user?.id || 'guest'}`)
    if (saved) {
      setNotifications(JSON.parse(saved))
    } else {
      setNotifications(DEFAULT_NOTIFICATIONS)
      localStorage.setItem(`eleven_notifications_${user?.id || 'guest'}`, JSON.stringify(DEFAULT_NOTIFICATIONS))
    }
  }, [user?.id])

  const saveNotifications = (items: NotificationItem[]) => {
    setNotifications(items)
    localStorage.setItem(`eleven_notifications_${user?.id || 'guest'}`, JSON.stringify(items))
  }

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    saveNotifications(updated)
  }

  const toggleRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: !n.read } : n)
    saveNotifications(updated)
  }

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id)
    saveNotifications(updated)
  }

  const clearAll = () => {
    saveNotifications([])
  }

  const filtered = notifications.filter(n => activeTab === 'all' || !n.read)

  const getIcon = (type: string) => {
    switch (type) {
      case 'tv': return <Tv size={16} className="text-red-500" />
      case 'forum': return <MessageSquare size={16} className="text-blue-500" />
      case 'prayer': return <BookOpen size={16} className="text-emerald-500" />
      default: return <ShieldAlert size={16} className="text-amber-500" />
    }
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6" style={{ background: 'var(--eleven-bg)' }}>
      <div className="max-w-3xl mx-auto">
        
        {/* Header Back Link */}
        <div className="mb-6">
          <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs font-semibold hover:opacity-85" style={{ color: 'var(--eleven-accent)' }}>
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        </div>

        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2" style={{ color: 'var(--eleven-text)' }}>
              <Bell className="text-[#c4956a]" /> Notifications
            </h1>
            <p className="text-xs mt-1" style={{ color: 'var(--eleven-text-secondary)' }}>
              Stay updated on fellowship activities, prayers, and ElevenFaith TV streams.
            </p>
          </div>
          {notifications.length > 0 && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={markAllAsRead} 
                className="rounded-full text-xs font-semibold h-8 cursor-pointer"
              >
                <Check size={14} className="mr-1" /> Mark all read
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAll} 
                className="rounded-full text-xs font-semibold h-8 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <Trash2 size={14} className="mr-1" /> Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex items-center border-b mb-6" style={{ borderColor: 'var(--eleven-border)' }}>
          <button 
            onClick={() => setActiveTab('all')} 
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 capitalize transition-all ${
              activeTab === 'all' 
                ? 'border-[#c4956a] text-[#8b6914] font-bold' 
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            All ({notifications.length})
          </button>
          <button 
            onClick={() => setActiveTab('unread')} 
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 capitalize transition-all ${
              activeTab === 'unread' 
                ? 'border-[#c4956a] text-[#8b6914] font-bold' 
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            Unread ({notifications.filter(n => !n.read).length})
          </button>
        </div>

        {/* Notification List */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map(n => (
              <Card 
                key={n.id} 
                className={`p-4 transition-all border flex gap-4 items-start ${
                  !n.read 
                    ? 'bg-[#c4956a]/5 border-[#c4956a]/20 shadow-sm' 
                    : 'bg-white border-stone-100'
                }`}
                style={{ borderColor: !n.read ? undefined : 'var(--eleven-border)' }}
              >
                <div className={`p-2 rounded-xl border ${
                  !n.read ? 'bg-white border-[#c4956a]/20' : 'bg-stone-50 border-stone-100'
                }`} style={{ borderColor: !n.read ? undefined : 'var(--eleven-border)' }}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className={`text-sm font-semibold leading-none ${!n.read ? 'text-[#8b6914]' : 'text-stone-800'}`}>
                      {n.title}
                    </h3>
                    <span className="text-[10px] text-stone-400 whitespace-nowrap">{n.time}</span>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed mt-1.5">{n.message}</p>
                </div>
                <div className="flex items-center gap-1.5 self-center">
                  <button 
                    onClick={() => toggleRead(n.id)}
                    className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
                    title={n.read ? 'Mark as unread' : 'Mark as read'}
                  >
                    <Check size={14} className={!n.read ? 'text-[#c4956a]' : ''} />
                  </button>
                  <button 
                    onClick={() => deleteNotification(n.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed" style={{ borderColor: 'var(--eleven-border)' }}>
            <Bell size={40} className="mx-auto mb-3 text-stone-300 animate-pulse" />
            <h3 className="text-sm font-bold text-stone-600">No Notifications</h3>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              You are all caught up! We'll notify you here about new streams, prayers, and announcements.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
