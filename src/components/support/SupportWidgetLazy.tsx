'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const SupportWidget = dynamic(
  () => import('./SupportWidget').then(mod => ({ default: mod.SupportWidget })),
  { ssr: false }
)

export function SupportWidgetLazy() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return <SupportWidget />
}
