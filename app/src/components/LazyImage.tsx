import React, { useState } from 'react'

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null
  alt?: string
  className?: string
  containerClassName?: string
  fallbackSrc?: string
}

export function LazyImage({
  src,
  alt = '',
  className = '',
  containerClassName = '',
  fallbackSrc,
  style,
  onClick,
  ...props
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  if (!src && !fallbackSrc) return null

  const targetSrc = error ? fallbackSrc : (src || fallbackSrc)
  if (!targetSrc) return null

  return (
    <div className={`relative overflow-hidden ${containerClassName}`} style={style} onClick={onClick}>
      {/* Animated shimmer skeleton placeholder */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-stone-100 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-stone-300 border-t-amber-600 animate-spin opacity-40" />
        </div>
      )}
      <img
        src={targetSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!error && fallbackSrc) {
            setError(true)
          }
        }}
        className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        {...props}
      />
    </div>
  )
}
