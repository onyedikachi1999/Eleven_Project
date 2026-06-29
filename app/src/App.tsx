import { Routes, Route } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import TestimonyHub from './pages/TestimonyHub'
import PrayerRoom from './pages/PrayerRoom'
import ElevenTV from './pages/ElevenTV'
import JointPrayer from './pages/JointPrayer'
import CommunityForum from './pages/CommunityForum'
import Dashboard from './pages/Dashboard'
import AdminPanel from './pages/AdminPanel'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--eleven-bg)' }}>
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/testimonies" element={<TestimonyHub />} />
          <Route path="/prayer-room" element={<PrayerRoom />} />
          <Route path="/tv" element={<ElevenTV />} />
          <Route path="/joint-prayer" element={<JointPrayer />} />
          <Route path="/community" element={<CommunityForum />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Toaster position="bottom-right" />
    </div>
  )
}
