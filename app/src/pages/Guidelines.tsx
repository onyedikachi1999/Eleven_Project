import { ShieldCheck, HeartHandshake, EyeOff, Ban } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function Guidelines() {
  return (
    <div className="min-h-screen animate-fade-in" style={{ background: 'var(--eleven-bg)' }}>
      {/* Header */}
      <div className="py-16 px-4 text-center" style={{ background: '#F5F0EB' }}>
        <div className="max-w-3xl mx-auto">
          <span className="text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-white/60 mb-3 inline-block" style={{ color: 'var(--eleven-accent-dark)' }}>
            Safety & Fellowship
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--eleven-text)' }}>
            Community Guidelines
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--eleven-text-secondary)' }}>
            Nurturing a respectful, supportive, and spiritually uplifting environment for all members.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="p-6 sm:p-8 rounded-2xl bg-white border mb-10" style={{ borderColor: 'var(--eleven-border)' }}>
          <p className="font-display text-lg italic text-center" style={{ color: 'var(--eleven-text)' }}>
            "Let your conversation be always full of grace, seasoned with salt, so that you may know how to answer everyone."
          </p>
          <p className="text-[10px] uppercase tracking-wider mt-3 font-semibold text-center" style={{ color: 'var(--eleven-accent)' }}>
            Colossians 4:6
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border shadow-none bg-white p-6 rounded-xl" style={{ borderColor: 'var(--eleven-border)' }}>
            <CardContent className="p-0 space-y-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--eleven-accent-light)' }}>
                <HeartHandshake size={16} style={{ color: 'var(--eleven-accent-dark)' }} />
              </div>
              <h3 className="font-display font-semibold text-base" style={{ color: 'var(--eleven-text)' }}>1. Uplift & Encourage</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--eleven-text-secondary)' }}>
                Speak with kindness, grace, and love. Our primary focus is to encourage one another, bear one another's burdens, and build up each other's faith.
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-none bg-white p-6 rounded-xl" style={{ borderColor: 'var(--eleven-border)' }}>
            <CardContent className="p-0 space-y-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--eleven-accent-light)' }}>
                <ShieldCheck size={16} style={{ color: 'var(--eleven-accent-dark)' }} />
              </div>
              <h3 className="font-display font-semibold text-base" style={{ color: 'var(--eleven-text)' }}>2. Respectful Conduct</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--eleven-text-secondary)' }}>
                Keep posts and responses constructive. Personal attacks, harassment, profanity, and offensive, demeaning, or hostile comments are strictly prohibited.
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-none bg-white p-6 rounded-xl" style={{ borderColor: 'var(--eleven-border)' }}>
            <CardContent className="p-0 space-y-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--eleven-accent-light)' }}>
                <EyeOff size={16} style={{ color: 'var(--eleven-accent-dark)' }} />
              </div>
              <h3 className="font-display font-semibold text-base" style={{ color: 'var(--eleven-text)' }}>3. Protect Privacy</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--eleven-text-secondary)' }}>
                Respect the privacy of fellow members. Do not post phone numbers, home addresses, or personal contact details of others without explicit, documented consent.
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-none bg-white p-6 rounded-xl" style={{ borderColor: 'var(--eleven-border)' }}>
            <CardContent className="p-0 space-y-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--eleven-accent-light)' }}>
                <Ban size={16} style={{ color: 'var(--eleven-accent-dark)' }} />
              </div>
              <h3 className="font-display font-semibold text-base" style={{ color: 'var(--eleven-text)' }}>4. No Spam or Self-Promotion</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--eleven-text-secondary)' }}>
                Keep posts focused on spiritual growth, community interaction, and testimonies. Unsolicited commercial advertising or spamming will result in account suspension.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
