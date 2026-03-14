'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

const SupportWidget = dynamic(
  () => import('./SupportWidget').then(mod => ({ default: mod.SupportWidget })),
  { ssr: false }
)

export function SupportWidgetLazy() {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null
  if (pathname?.startsWith('/satllabot')) return null

  return <SupportWidget />
}
