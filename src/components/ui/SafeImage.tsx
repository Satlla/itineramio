import { useState } from 'react'
import Image from 'next/image'

interface SafeImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  width?: number
  height?: number
  fallback?: string
}

export function SafeImage({ 
  src, 
  alt, 
  className = '', 
  width = 200, 
  height = 200,
  fallback = '/isotipe.svg'
}: SafeImageProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const imageSrc = error || !src ? fallback : src

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
        unoptimized={src?.includes('blob.vercel-storage.com')}
      />
    </div>
  )
}