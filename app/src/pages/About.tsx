import { Heart, Church, Flame, Users, BookOpen, HandHeart, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function About() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--eleven-bg)' }}>
      {/* Hero Header */}
      <div className="py-20 px-4 text-center" style={{ background: 'linear-gradient(135deg, #F5F0EB 0%, #E8D5C0 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-white/60 mb-4 inline-block" style={{ color: 'var(--eleven-accent-dark)' }}>
            Our Purpose
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-6" style={{ color: 'var(--eleven-text)' }}>
            About ELEVEN&trade;
          </h1>
          <p className="font-display text-lg sm:text-xl leading-relaxed" style={{ color: 'var(--eleven-text-secondary)' }}>
            "Share Your Story. Join The Prayer."
            <br />
            Connecting the global body of Christ through testimonies, continuous prayer, and spiritual community.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        {/* Quote Section */}
        <div className="text-center mb-16 p-8 rounded-2xl bg-white border" style={{ borderColor: 'var(--eleven-border)', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <p className="font-display text-xl italic" style={{ color: 'var(--eleven-text)' }}>
            "Therefore I tell you, whatever you ask for in prayer, believe that you have received it, and it will be yours."
          </p>
          <p className="text-xs uppercase tracking-wider mt-3 font-semibold" style={{ color: 'var(--eleven-accent)' }}>
            Mark 11:24
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4" style={{ color: 'var(--eleven-text)' }}>
              Our Mission
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-4" style={{ color: 'var(--eleven-text-secondary)' }}>
              In a digital age filled with noise and distraction, ELEVEN serves as a digital sanctuary. We are dedicated to creating a focused, faith-centric platform where believers can gather to uplift one another.
            </p>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--eleven-text-secondary)' }}>
              Through shared testimonies of God's goodness and active intercessory prayer, we believe we can strengthen individual faith and cultivate a deeper sense of global spiritual unity.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-white border flex flex-col justify-between h-36" style={{ borderColor: 'var(--eleven-border)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#E8D5C0' }}>
                <BookOpen size={16} style={{ color: '#8B6914' }} />
              </div>
              <p className="text-xs font-semibold" style={{ color: 'var(--eleven-text)' }}>Share Testimonies</p>
            </div>
            <div className="p-5 rounded-xl bg-white border flex flex-col justify-between h-36" style={{ borderColor: 'var(--eleven-border)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#D4E0CC' }}>
                <HandHeart size={16} style={{ color: '#4A6B3A' }} />
              </div>
              <p className="text-xs font-semibold" style={{ color: 'var(--eleven-text)' }}>Join in Prayer</p>
            </div>
            <div className="p-5 rounded-xl bg-white border flex flex-col justify-between h-36" style={{ borderColor: 'var(--eleven-border)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#D4E0F0' }}>
                <Users size={16} style={{ color: '#2E5A8B' }} />
              </div>
              <p className="text-xs font-semibold" style={{ color: 'var(--eleven-text)' }}>Build Circles</p>
            </div>
            <div className="p-5 rounded-xl bg-white border flex flex-col justify-between h-36" style={{ borderColor: 'var(--eleven-border)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#E8D5E0' }}>
                <Flame size={16} style={{ color: '#6B3A5A' }} />
              </div>
              <p className="text-xs font-semibold" style={{ color: 'var(--eleven-text)' }}>Spiritual Growth</p>
            </div>
          </div>
        </div>

        {/* Vision & Values */}
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-8 text-center" style={{ color: 'var(--eleven-text)' }}>
            Core Pillars
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-none bg-white p-6 rounded-xl border" style={{ borderColor: 'var(--eleven-border)' }}>
              <CardContent className="p-0 space-y-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--eleven-accent-light)' }}>
                  <Sparkles size={18} style={{ color: 'var(--eleven-accent)' }} />
                </div>
                <h3 className="font-display font-semibold text-lg" style={{ color: 'var(--eleven-text)' }}>Distraction-Free</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--eleven-text-secondary)' }}>
                  Designed specifically to foster prayer and focus, keeping your daily quiet time free from commercial noise and algorithms.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-white p-6 rounded-xl border" style={{ borderColor: 'var(--eleven-border)' }}>
              <CardContent className="p-0 space-y-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--eleven-accent-light)' }}>
                  <Heart size={18} style={{ color: 'var(--eleven-accent)' }} />
                </div>
                <h3 className="font-display font-semibold text-lg" style={{ color: 'var(--eleven-text)' }}>Encouragement</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--eleven-text-secondary)' }}>
                  Every testimony shared builds faith, and every 'Amen' or 'I Prayed' action reassures members they are never alone in their struggles.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-white p-6 rounded-xl border" style={{ borderColor: 'var(--eleven-border)' }}>
              <CardContent className="p-0 space-y-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--eleven-accent-light)' }}>
                  <Church size={18} style={{ color: 'var(--eleven-accent)' }} />
                </div>
                <h3 className="font-display font-semibold text-lg" style={{ color: 'var(--eleven-text)' }}>Community First</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--eleven-text-secondary)' }}>
                  Whether discussing faith questions, joining live prayer sessions, or interacting in circles, we prioritize authentic, respectful relationships.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
