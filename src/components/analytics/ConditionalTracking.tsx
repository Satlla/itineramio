'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'

// Build timestamp: 1769980900 - forces cache invalidation
const GTM_ID = 'GTM-PK5PTZS3'
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID

// Paths where tracking should be disabled
const EXCLUDED_PATHS = ['/admin', '/api']

/**
 * ConditionalTracking - Carga scripts de tracking SOLO si hay consentimiento
 *
 * Cumple con GDPR Art. 7 - No carga cookies de analytics/marketing sin consentimiento previo
 *
 * NOTA: Usamos inyección manual de scripts en lugar de next/script para evitar
 * errores de "appendChild" que ocurren con scripts inline en algunos casos.
 *
 * EXCLUSIONES: No carga tracking en /admin ni /api para evitar errores
 * y porque estas áreas no necesitan analytics.
 */
export function ConditionalTracking() {
  const pathname = usePathname()
  const [hasConsent, setHasConsent] = useState(false)
  const [scriptsLoaded, setScriptsLoaded] = useState(false)

  // Check if current path should be excluded from tracking
  const isExcludedPath = EXCLUDED_PATHS.some(path => pathname?.startsWith(path))

  // Load GTM script manually to avoid Next.js Script issues
  const loadGTM = useCallback(() => {
    if (typeof window === 'undefined') return
    if ((window as any).gtmLoaded) return

    try {
      (window as any).gtmLoaded = true;
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
      });

      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`
      script.onerror = () => {
        console.warn('GTM script failed to load')
      }
      document.head.appendChild(script)
    } catch (e) {
      console.warn('Error loading GTM:', e)
    }
  }, [])

  // Load FB Pixel script manually
  const loadFBPixel = useCallback(() => {
    if (typeof window === 'undefined' || !FB_PIXEL_ID) return
    if ((window as any).fbq) return

    try {
      // Create FB Pixel queue function
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fbq: any = function(...args: any[]) {
        if (fbq.callMethod) {
          fbq.callMethod.apply(fbq, args)
        } else {
          fbq.queue.push(args)
        }
      }
      fbq.push = fbq
      fbq.loaded = true
      fbq.version = '2.0'
      fbq.queue = []

      ;(window as any).fbq = fbq
      if (!(window as any)._fbq) (window as any)._fbq = fbq

      const script = document.createElement('script')
      script.async = true
      script.src = 'https://connect.facebook.net/en_US/fbevents.js'
      script.onerror = () => {
        console.warn('FB Pixel script failed to load')
      }
      document.head.appendChild(script)

      // Initialize after script element is added
      setTimeout(() => {
        if ((window as any).fbq) {
          (window as any).fbq('init', FB_PIXEL_ID)
          ;(window as any).fbq('track', 'PageView')
        }
      }, 100)
    } catch (e) {
      console.warn('Error loading FB Pixel:', e)
    }
  }, [])

  useEffect(() => {
    // Check initial consent
    const consent = localStorage.getItem('cookiesAccepted')
    if (consent === 'true') {
      setHasConsent(true)
    }

    // Listen for consent changes (from CookieBanner)
    const handleConsentChange = (event: CustomEvent) => {
      if (event.detail === 'true') {
        setHasConsent(true)
      }
    }

    window.addEventListener('cookieConsentChanged' as any, handleConsentChange)

    return () => {
      window.removeEventListener('cookieConsentChanged' as any, handleConsentChange)
    }
  }, [])

  // Load scripts when consent is given (and not on excluded paths)
  useEffect(() => {
    if (!hasConsent || scriptsLoaded || isExcludedPath) return

    // Small delay to ensure page is fully loaded (reduced from 500ms for faster tracking)
    const timer = setTimeout(() => {
      loadGTM()
      loadFBPixel()
      setScriptsLoaded(true)
    }, 200)

    return () => clearTimeout(timer)
  }, [hasConsent, scriptsLoaded, isExcludedPath, loadGTM, loadFBPixel])

  // Don't render anything on excluded paths or if no consent
  if (isExcludedPath || !hasConsent) {
    return null
  }

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}

/**
 * Hook para verificar si hay consentimiento de cookies
 */
export function useCookieConsent() {
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookiesAccepted')
    setHasConsent(consent === 'true')

    const handleConsentChange = (event: CustomEvent) => {
      setHasConsent(event.detail === 'true')
    }

    window.addEventListener('cookieConsentChanged' as any, handleConsentChange)

    return () => {
      window.removeEventListener('cookieConsentChanged' as any, handleConsentChange)
    }
  }, [])

  return hasConsent
}
