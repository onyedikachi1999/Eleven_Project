import { CheckSquare, Scale, BookOpen, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function Terms() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--eleven-bg)' }}>
      {/* Header */}
      <div className="py-16 px-4 text-center" style={{ background: 'var(--eleven-surface-elevated)' }}>
        <div className="max-w-3xl mx-auto">
          <span className="text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-white/60 mb-3 inline-block" style={{ color: 'var(--eleven-accent-dark)' }}>
            User Agreement
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--eleven-text)' }}>
            Terms of Service
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--eleven-text-secondary)' }}>
            Please read these terms carefully before accessing or using the ELEVEN platform.
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
                  <CheckSquare size={15} style={{ color: 'var(--eleven-text)' }} />
                </div>
                <h3 className="font-display font-semibold text-base" style={{ color: 'var(--eleven-text)' }}>1. Acceptance of Terms</h3>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--eleven-text-secondary)' }}>
                By creating an account or using the ELEVEN testimony and prayer platform, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you must not use or access the services.
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-none bg-white p-6 rounded-xl" style={{ borderColor: 'var(--eleven-border)' }}>
            <CardContent className="p-0 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
                  <Scale size={15} style={{ color: 'var(--eleven-text)' }} />
                </div>
                <h3 className="font-display font-semibold text-base" style={{ color: 'var(--eleven-text)' }}>2. User Registration & Responsibilities</h3>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--eleven-text-secondary)' }}>
                You are responsible for keeping your login credentials secure. You must not use the platform for any illegal actions, nor post spam, advertisements, malware, or unsolicited content. Any violation may lead to temporary or permanent suspension of your account.
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-none bg-white p-6 rounded-xl" style={{ borderColor: 'var(--eleven-border)' }}>
            <CardContent className="p-0 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
                  <BookOpen size={15} style={{ color: 'var(--eleven-text)' }} />
                </div>
                <h3 className="font-display font-semibold text-base" style={{ color: 'var(--eleven-text)' }}>3. Content Standards & Ownership</h3>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--eleven-text-secondary)' }}>
                You retain ownership of the content (testimonies, prayers, comments) that you upload. However, by uploading content, you grant ELEVEN a non-exclusive, royalty-free license to host, display, and distribute it on the platform. All shared content must comply with our Community Guidelines.
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-none bg-white p-6 rounded-xl" style={{ borderColor: 'var(--eleven-border)' }}>
            <CardContent className="p-0 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
                  <AlertCircle size={15} style={{ color: 'var(--eleven-text)' }} />
                </div>
                <h3 className="font-display font-semibold text-base" style={{ color: 'var(--eleven-text)' }}>4. Modifications to the Service</h3>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--eleven-text-secondary)' }}>
                We reserve the right to modify or discontinue any part of the service with or without notice. We may update these Terms of Service occasionally, and your continued use of ELEVEN after changes are published constitutes agreement to the updated terms.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
