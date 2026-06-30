import { Routes, Route } from 'react-router'
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
import AdminPanel from './pages/AdminPanel'
import About from './pages/About'
import Guidelines from './pages/Guidelines'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PageTransition from './components/PageTransition'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--eleven-bg)' }}>
      <Navbar />
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
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/about" element={<About />} />
            <Route path="/guidelines" element={<Guidelines />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      </main>
      <Footer />
      <Toaster position="bottom-right" />
    </div>
  )
}
