'use client'

import { useEffect, useState } from 'react'

interface PWAInfo {
  isPWA: boolean
  isIOS: boolean
  isAndroid: boolean
  isStandalone: boolean
  safeAreaInsets: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

/**
 * Hook to detect PWA mode and platform information
 * Helps apply platform-specific styles and behaviors
 */
export function usePWA(): PWAInfo {
  const [pwaInfo, setPWAInfo] = useState<PWAInfo>({
    isPWA: false,
    isIOS: false,
    isAndroid: false,
    isStandalone: false,
    safeAreaInsets: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    }
  })

  useEffect(() => {
    // Detect if running as PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')

    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream

    // Detect Android
    const isAndroid = /Android/.test(navigator.userAgent)

    // Get safe area insets (only works in PWA mode on iOS)
    const getSafeAreaInset = (position: 'top' | 'bottom' | 'left' | 'right'): number => {
      if (typeof window === 'undefined') return 0

      const element = document.createElement('div')
      element.style.position = 'fixed'
      element.style[position] = '0'
      element.style.paddingTop = `env(safe-area-inset-${position}, 0px)`
      document.body.appendChild(element)

      const computed = window.getComputedStyle(element)
      const value = parseInt(computed.paddingTop) || 0

      document.body.removeChild(element)
      return value
    }

    setPWAInfo({
      isPWA: isStandalone,
      isIOS,
      isAndroid,
      isStandalone,
      safeAreaInsets: {
        top: getSafeAreaInset('top'),
        bottom: getSafeAreaInset('bottom'),
        left: getSafeAreaInset('left'),
        right: getSafeAreaInset('right')
      }
    })
  }, [])

  return pwaInfo
}
