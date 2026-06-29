import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Home, BookOpen, Church, Tv, Users, Menu, Search, Bell,
  User, LogOut, Shield,
} from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/testimonies', label: 'Testimonies', icon: BookOpen },
  { to: '/prayer-room', label: 'Prayer Room', icon: Church },
  { to: '/tv', label: 'TV', icon: Tv },
  { to: '/community', label: 'Community', icon: Users },
]

export default function Navbar() {
  const location = useLocation()
  const { user, isAuthenticated, isLoading, isAdmin, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b shadow-sm' : 'bg-white border-b'}`} style={{ borderColor: 'var(--eleven-border)', height: 64 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        <Link to="/" className="flex flex-col items-start">
          <span className="font-display text-xl font-bold tracking-tight" style={{ color: 'var(--eleven-text)' }}>ELEVEN&trade;</span>
          <span className="text-[10px] tracking-widest uppercase hidden sm:block" style={{ color: 'var(--eleven-text-muted)', marginTop: -2 }}>Testimony. Prayer. Community.</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => {
            const isActive = location.pathname === link.to
            return <Link key={link.to} to={link.to} className={`relative px-3 py-2 text-sm font-medium transition-colors rounded-md`} style={{ color: isActive ? 'var(--eleven-text)' : 'var(--eleven-text-secondary)' }}>{link.label}{isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full" style={{ background: 'var(--eleven-accent)' }} />}</Link>
          })}
        </nav>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg transition-colors hover:bg-black/5 hidden sm:flex" style={{ color: 'var(--eleven-text-secondary)' }}><Search size={18} /></button>
          {isAuthenticated && <button className="p-2 rounded-lg transition-colors hover:bg-black/5 hidden sm:flex relative" style={{ color: 'var(--eleven-text-secondary)' }}><Bell size={18} /><span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" /></button>}
          {isLoading ? <div className="w-8 h-8 rounded-full animate-pulse bg-gray-200" /> :
            isAuthenticated ? <div className="hidden md:flex items-center gap-2">
              <Link to="/dashboard"><Avatar className="w-8 h-8 cursor-pointer"><AvatarImage src={user?.avatar ?? undefined} /><AvatarFallback className="text-xs font-medium" style={{ background: 'var(--eleven-accent-light)', color: 'var(--eleven-accent-dark)' }}>{(user?.name ?? 'U').charAt(0).toUpperCase()}</AvatarFallback></Avatar></Link>
              {isAdmin && <Link to="/admin"><Shield size={18} style={{ color: 'var(--eleven-accent)' }} /></Link>}
            </div> :
            <Link to="/login" className="hidden md:block"><Button variant="outline" size="sm" className="rounded-full px-4 font-medium text-xs" style={{ borderColor: 'var(--eleven-accent)', color: 'var(--eleven-accent)' }}>Sign In</Button></Link>}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden"><Button variant="ghost" size="icon" className="h-8 w-8"><Menu size={20} /></Button></SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="flex flex-col h-full pt-12">
                <div className="px-4 pb-4 border-b" style={{ borderColor: 'var(--eleven-border)' }}>
                  {isAuthenticated && user ? <div className="flex items-center gap-3"><Avatar className="w-10 h-10"><AvatarImage src={user.avatar ?? undefined} /><AvatarFallback style={{ background: 'var(--eleven-accent-light)', color: 'var(--eleven-accent-dark)' }}>{(user.name ?? 'U').charAt(0).toUpperCase()}</AvatarFallback></Avatar><div><p className="font-medium text-sm">{user.name ?? 'User'}</p><p className="text-xs" style={{ color: 'var(--eleven-text-muted)' }}>{user.email ?? ''}</p></div></div> :
                    <Link to="/login" onClick={() => setMobileOpen(false)}><Button className="w-full rounded-full" style={{ background: 'var(--eleven-accent)' }}>Sign In</Button></Link>}
                </div>
                <nav className="flex-1 p-4 flex flex-col gap-1">
                  {navLinks.map(link => { const Icon = link.icon; const isActive = location.pathname === link.to; return <Link key={link.to} to={link.to} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-black/5' : 'hover:bg-black/5'}`} style={{ color: isActive ? 'var(--eleven-text)' : 'var(--eleven-text-secondary)' }}><Icon size={18} />{link.label}</Link> })}
                  {isAuthenticated && <><Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors" style={{ color: 'var(--eleven-text-secondary)' }}><User size={18} />My Dashboard</Link>{isAdmin && <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors" style={{ color: 'var(--eleven-text-secondary)' }}><Shield size={18} />Admin Panel</Link>}</>}
                </nav>
                {isAuthenticated && <div className="p-4 border-t" style={{ borderColor: 'var(--eleven-border)' }}><button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full hover:bg-black/5 transition-colors" style={{ color: 'var(--eleven-text-secondary)' }}><LogOut size={18} />Sign Out</button></div>}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
