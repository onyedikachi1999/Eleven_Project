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
        isSidebar ? 'h-full w-full px-8 py-16' : isHero ? 'px-4 py-24 sm:py-32' : 'px-4 py-20'
      }`}
      style={{ background: '#f8f9fa' }}
    >
      {/* Soft green blob — bottom-left */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: -40,
          left: -40,
          width: 260,
          height: 180,
          borderRadius: '50% 50% 0 0',
          background: 'linear-gradient(135deg, #b8e6a0 0%, #d4edbc 40%, rgba(184,230,160,0.15) 100%)',
          opacity: 0.7,
          filter: 'blur(12px)',
        }}
      />

      {/* Soft blue blob — bottom-right */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: -30,
          right: -30,
          width: 220,
          height: 160,
          borderRadius: '50% 50% 0 0',
          background: 'linear-gradient(225deg, #a8c8f0 0%, #c0d8f5 40%, rgba(168,200,240,0.15) 100%)',
          opacity: 0.65,
          filter: 'blur(10px)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-xl mx-auto">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <ElevenLogo height={isHero ? 48 : isSidebar ? 40 : 44} />
        </div>

        {/* Headline */}
        <h1
          className={`font-display font-bold leading-tight mb-3 ${
            isHero ? 'text-4xl sm:text-5xl' : isSidebar ? 'text-3xl sm:text-4xl' : 'text-3xl sm:text-4xl'
          }`}
          style={{ color: '#1a2332' }}
        >
          The Power of Your Story
        </h1>

        {/* Subtitle */}
        <p
          className={`font-display leading-relaxed ${
            isHero ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
          }`}
          style={{ color: '#6b7b8d' }}
        >
          Overcoming. One Story at a Time.
        </p>
      </div>
    </div>
  )
}
