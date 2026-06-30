import { Lock, Eye, Database, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function Privacy() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--eleven-bg)' }}>
      {/* Header */}
      <div className="py-16 px-4 text-center" style={{ background: 'var(--eleven-surface-elevated)' }}>
        <div className="max-w-3xl mx-auto">
          <span className="text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-white/60 mb-3 inline-block" style={{ color: 'var(--eleven-accent-dark)' }}>
            Data Protection
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--eleven-text)' }}>
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--eleven-text-secondary)' }}>
            Your privacy is sacred to us. Learn how we handle and protect your personal data.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="space-y-6">
          <Card className="border shadow-none bg-white p-6 rounded-xl" style={{ borderColor: 'var(--eleven-border)' }}>
            <CardContent className="p-0 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
                  <Database size={15} style={{ color: 'var(--eleven-text)' }} />
                </div>
                <h3 className="font-display font-semibold text-base" style={{ color: 'var(--eleven-text)' }}>1. Information We Collect</h3>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--eleven-text-secondary)' }}>
                We collect personal information necessary to create and manage your account. This includes your name, username, email address, profile description, avatar photo, and the contents of the testimonies, comments, or prayers you choose to post.
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-none bg-white p-6 rounded-xl" style={{ borderColor: 'var(--eleven-border)' }}>
            <CardContent className="p-0 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
                  <Eye size={15} style={{ color: 'var(--eleven-text)' }} />
                </div>
                <h3 className="font-display font-semibold text-base" style={{ color: 'var(--eleven-text)' }}>2. Anonymity Option</h3>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--eleven-text-secondary)' }}>
                We support your choice to remain anonymous. If you select the "Post anonymously" option when sharing a testimony or submitting a prayer request, your name, profile photo, and user details will be masked from other users. However, backend administrators will still have access to the posting account for moderation purposes.
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-none bg-white p-6 rounded-xl" style={{ borderColor: 'var(--eleven-border)' }}>
            <CardContent className="p-0 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
                  <Lock size={15} style={{ color: 'var(--eleven-text)' }} />
                </div>
                <h3 className="font-display font-semibold text-base" style={{ color: 'var(--eleven-text)' }}>3. Data Protection & Sharing</h3>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--eleven-text-secondary)' }}>
                We do not sell, rent, or lease your personal information to third parties. We use secure servers, password-protected databases, and encrypted database connections (like Supabase security systems) to protect your user data from unauthorized access or alteration.
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-none bg-white p-6 rounded-xl" style={{ borderColor: 'var(--eleven-border)' }}>
            <CardContent className="p-0 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
                  <FileText size={15} style={{ color: 'var(--eleven-text)' }} />
                </div>
                <h3 className="font-display font-semibold text-base" style={{ color: 'var(--eleven-text)' }}>4. Cookies & Custom Settings</h3>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--eleven-text-secondary)' }}>
                We use cookies to maintain your login session. No advertising or tracking cookies are placed on your machine.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
