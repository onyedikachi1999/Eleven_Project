export default function ElevenLogo({ className = '', height = 28 }: { className?: string; height?: number }) {
  // Font size scales with the requested height
  const fontSize = Math.round(height * 0.75)
  
  return (
    <span
      className={`inline-flex items-center select-none ${className}`}
      style={{ 
        height, 
        lineHeight: `${height}px`,
        fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
        fontWeight: 800,
        fontSize,
        letterSpacing: '-0.02em',
      }}
      aria-label="ElevenFaith"
    >
      <span style={{ color: '#00C853' }}>eleven</span>
      <span style={{ color: '#1565C0' }}>faith</span>
    </span>
  )
}
