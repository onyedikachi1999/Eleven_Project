import { Routes, Route, useLocation } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import TestimonyHub from './pages/TestimonyHub'
import PrayerRoom from './pages/PrayerRoom'
import ElevenTV from './pages/ElevenTV'
import JointPrayer from './pages/JointPrayer'
import PrayerCircleDetail from './pages/PrayerCircleDetail'
import CommunityForum from './pages/CommunityForum'
import Pricing from './pages/Pricing'
import Dashboard from './pages/Dashboard'
import Notifications from './pages/Notifications'
import AdminPanel from './pages/AdminPanel'
import About from './pages/About'
import Guidelines from './pages/Guidelines'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PageTransition from './components/PageTransition'
import LiveAudioRoomPage from './pages/LiveAudioRoomPage'

import { ThemeProvider } from './hooks/useTheme'

export default function App() {
  const location = useLocation()
  const isLiveRoom = location.pathname.startsWith('/live-room/')

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col transition-colors duration-300" style={{ background: 'var(--eleven-bg)' }}>
      {!isLiveRoom && <Navbar />}
      <main className="flex-1">
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/testimonies" element={<TestimonyHub />} />
            <Route path="/prayer-room" element={<PrayerRoom />} />
            <Route path="/tv" element={<ElevenTV />} />
            <Route path="/joint-prayer" element={<JointPrayer />} />
            <Route path="/prayer-circle/:id" element={<PrayerCircleDetail />} />
            <Route path="/community" element={<CommunityForum />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/about" element={<About />} />
            <Route path="/guidelines" element={<Guidelines />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/live-room/:id" element={<LiveAudioRoomPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      </main>
      {!isLiveRoom && <Footer />}
      <Toaster position="bottom-right" />
    </div>
    </ThemeProvider>
  )
}
