export default function ElevenLogo({ className = '', height = 28 }: { className?: string; height?: number }) {
  // The logo width is roughly 3.2 times the height
  const width = Math.round(height * 3.2)
  
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 160 50" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* "eleve" text in exact brand blue (#008cd6) */}
      <text 
        x="0" 
        y="39" 
        fill="#008cd6" 
        style={{ 
          fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
          fontWeight: '800', 
          fontSize: '44px', 
          letterSpacing: '-0.04em' 
        }}
      >
        eleve
      </text>
      
      {/* Green bubble path with pointer pointing up-left (#92c83e) */}
      <path 
        d="M 111,0 L 126,12 A 6,6 0 0 1 128,12 L 152,12 A 8,8 0 0 1 160,20 L 160,42 A 8,8 0 0 1 152,50 L 122,50 A 8,8 0 0 1 114,42 L 114,20 A 8,8 0 0 1 122,12 L 111,0 Z" 
        fill="#92c83e" 
      />
      
      {/* White letter "n" inside the green bubble */}
      <text 
        x="137" 
        y="42" 
        textAnchor="middle" 
        fill="#ffffff" 
        style={{ 
          fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
          fontWeight: '800', 
          fontSize: '34px' 
        }}
      >
        n
      </text>
    </svg>
  )
}
