'use client'

import Link from 'next/link'
import { trackCTAClicked } from '@/lib/analytics'
import { ReactNode } from 'react'

interface TrackedCTAProps {
  href: string
  ctaId: string
  ctaText: string
  location: 'hero' | 'pricing' | 'footer' | 'navbar' | 'sidebar' | 'modal' | 'inline'
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function TrackedCTA({
  href,
  ctaId,
  ctaText,
  location,
  children,
  className,
  onClick
}: TrackedCTAProps) {
  const handleClick = () => {
    trackCTAClicked({
      ctaId,
      ctaText,
      location,
      destination: href
    })
    onClick?.()
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}

export function TrackedButton({
  ctaId,
  ctaText,
  location,
  children,
  className,
  onClick,
  type = 'button'
}: Omit<TrackedCTAProps, 'href'> & { type?: 'button' | 'submit' }) {
  const handleClick = () => {
    trackCTAClicked({
      ctaId,
      ctaText,
      location,
      destination: 'button_action'
    })
    onClick?.()
  }

  return (
    <button type={type} className={className} onClick={handleClick}>
      {children}
    </button>
  )
}
