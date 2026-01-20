'use client'

import { useEffect } from 'react'

/**
 * PWA Safe Area Handler
 *
 * This component detects if the app is running in PWA standalone mode
 * and adds appropriate CSS classes to the body element for safe-area handling.
 *
 * It also handles iOS-specific quirks where env(safe-area-inset-top) may not
 * work correctly in inline styles.
 */
export function PWASafeArea() {
  useEffect(() => {
    // Check if running as standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true // iOS Safari

    if (isStandalone) {
      document.body.classList.add('pwa-standalone')
      document.documentElement.classList.add('pwa-standalone')
    }

    // Listen for display mode changes (e.g., when added to home screen)
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.body.classList.add('pwa-standalone')
        document.documentElement.classList.add('pwa-standalone')
      } else {
        document.body.classList.remove('pwa-standalone')
        document.documentElement.classList.remove('pwa-standalone')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return null
}
