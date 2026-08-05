import ElevenLogo from '@/components/ElevenLogo'

interface BannerProps {
  /** 'hero' = full-width homepage hero, 'sidebar' = login/register half-page, 'header' = about page header */
  variant?: 'hero' | 'sidebar' | 'header'
}

export default function ElevenFaithBanner({ variant = 'hero' }: BannerProps) {
  const isHero = variant === 'hero'
  const isSidebar = variant === 'sidebar'

  return (
    <div
      className={`relative overflow-hidden flex flex-col items-center justify-center text-center ${
        isSidebar ? 'h-full w-full px-8 py-16' : isHero ? 'px-4 py-20 sm:py-28' : 'px-4 py-16'
      }`}
      style={{ background: 'transparent' }}
    >
      {/* Soft green blob — bottom-left */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: -50,
          left: -50,
          width: 320,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(184,230,160,0.6) 0%, rgba(212,237,188,0.2) 60%, transparent 100%)',
          filter: 'blur(24px)',
        }}
      />

      {/* Soft blue blob — bottom-right */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: -40,
          right: -40,
          width: 300,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,200,240,0.6) 0%, rgba(192,216,245,0.2) 60%, transparent 100%)',
          filter: 'blur(24px)',
        }}
      />

      {/* Edge blending overlays */}
      {!isSidebar && (
        <>
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[var(--eleven-bg,#fff)] to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[var(--eleven-bg,#fff)] to-transparent pointer-events-none z-10" />
        </>
      )}

      {/* Content */}
      <div className="relative z-20 max-w-xl mx-auto">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <ElevenLogo height={isHero ? 48 : isSidebar ? 40 : 44} />
        </div>

        {/* Headline */}
        <h1
          className={`font-display font-bold leading-tight mb-3 ${
            isHero ? 'text-4xl sm:text-5xl' : isSidebar ? 'text-3xl sm:text-4xl' : 'text-3xl sm:text-4xl'
          }`}
          style={{ color: 'var(--eleven-text, #1a2332)' }}
        >
          The Power of Your Story
        </h1>

        {/* Subtitle */}
        <p
          className={`font-display leading-relaxed ${
            isHero ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
          }`}
          style={{ color: 'var(--eleven-text-secondary, #6b7b8d)' }}
        >
          Overcoming. One Story at a Time.
        </p>
      </div>
    </div>
  )
}
