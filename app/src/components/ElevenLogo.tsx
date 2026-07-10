export default function ElevenLogo({ className = '', height = 28 }: { className?: string; height?: number }) {
  const width = Math.round(height * 1.14)
  
  return (
    <img 
      src="/assets/logo.png" 
      alt="ELEVEN Logo"
      height={height}
      width={width}
      style={{ height: height, width: 'auto' }}
      className={`object-contain ${className}`}
    />
  )
}
