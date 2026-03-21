'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'

const GTM_ID = 'GTM-PK5PTZS3'
const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID

// Paths where tracking should be disabled
const EXCLUDED_PATHS = ['/admin', '/api']

/**
 * Checks if analytics consent has been given.
 * Supports both new format (cookiePreferences JSON) and legacy (cookiesAccepted string).
 */
function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const stored = localStorage.getItem('cookiePreferences')
    if (stored) {
      const prefs = JSON.parse(stored)
      return prefs?.analytics === true
    }
    // Legacy fallback
    return localStorage.getItem('cookiesAccepted') === 'true'
  } catch {
    return false
  }
}

/**
 * ConditionalTracking - Loads GTM + GA4 + FB Pixel ONLY after analytics consent (GDPR)
 *
 * Fixes:
 * - Accepts analytics-only consent (even without marketing)
 * - Loads GA4 directly so window.gtag is always available
 * - Tracks page views on SPA route changes
 */
export function ConditionalTracking() {
  const pathname = usePathname()
  const [hasConsent, setHasConsent] = useState(false)
  const [scriptsLoaded, setScriptsLoaded] = useState(false)
  const prevPathname = useRef<string | null>(null)

  const isExcludedPath = EXCLUDED_PATHS.some(path => pathname?.startsWith(path))

  // Load GTM
  const loadGTM = useCallback(() => {
    if (typeof window === 'undefined') return
    if ((window as any).gtmLoaded) return

    try {
      (window as any).gtmLoaded = true
      ;(window as any).dataLayer = (window as any).dataLayer || []
      ;(window as any).dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })

      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`
      document.head.appendChild(script)
    } catch (e) {
      // GTM load error ignored
    }
  }, [])

  // Load GA4 directly (ensures window.gtag is available for trackEvent calls)
  const loadGA4 = useCallback(() => {
    if (typeof window === 'undefined' || !GA_ID) return
    if ((window as any).ga4Loaded) return

    try {
      (window as any).ga4Loaded = true
      ;(window as any).dataLayer = (window as any).dataLayer || []
      ;(window as any).gtag = function(...args: any[]) {
        ;(window as any).dataLayer.push(args)
      }
      ;(window as any).gtag('js', new Date())
      ;(window as any).gtag('config', GA_ID, { send_page_view: true })

      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
      document.head.appendChild(script)
    } catch (e) {
      // GA4 load error ignored
    }
  }, [])

  // Load FB Pixel
  const loadFBPixel = useCallback(() => {
    if (typeof window === 'undefined' || !FB_PIXEL_ID) return
    if ((window as any).fbq) return

    try {
      const fbq: any = function(...args: any[]) {
        if (fbq.callMethod) fbq.callMethod.apply(fbq, args)
        else fbq.queue.push(args)
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
      document.head.appendChild(script)

      setTimeout(() => {
        if ((window as any).fbq) {
          ;(window as any).fbq('init', FB_PIXEL_ID)
          ;(window as any).fbq('track', 'PageView')
        }
      }, 100)
    } catch (e) {
      // FB Pixel load error ignored
    }
  }, [])

  // Check consent on mount and listen for changes
  useEffect(() => {
    setHasConsent(hasAnalyticsConsent())

    const handleConsentChange = (event: CustomEvent) => {
      // Support both new format (object) and legacy (string)
      const detail = event.detail
      if (typeof detail === 'object' && detail !== null) {
        setHasConsent(detail.analytics === true)
      } else if (detail === 'true') {
        setHasConsent(true)
      }
    }

    window.addEventListener('cookieConsentChanged' as any, handleConsentChange)
    return () => window.removeEventListener('cookieConsentChanged' as any, handleConsentChange)
  }, [])

  // Load scripts once consent is given
  useEffect(() => {
    if (!hasConsent || scriptsLoaded || isExcludedPath) return

    const timer = setTimeout(() => {
      loadGTM()
      loadGA4()
      loadFBPixel()
      setScriptsLoaded(true)
    }, 200)

    return () => clearTimeout(timer)
  }, [hasConsent, scriptsLoaded, isExcludedPath, loadGTM, loadGA4, loadFBPixel])

  // Track page views on SPA route changes (App Router)
  useEffect(() => {
    if (!hasConsent || isExcludedPath || !pathname) return
    if (prevPathname.current === pathname) return
    prevPathname.current = pathname

    // Send to GTM dataLayer
    if ((window as any).dataLayer) {
      ;(window as any).dataLayer.push({ event: 'page_view', page_path: pathname })
    }
    // Send to GA4 directly
    if ((window as any).gtag && GA_ID) {
      ;(window as any).gtag('config', GA_ID, { page_path: pathname })
    }
    // Send to FB Pixel
    if ((window as any).fbq) {
      ;(window as any).fbq('track', 'PageView')
    }
  }, [pathname, hasConsent, isExcludedPath])

  if (isExcludedPath || !hasConsent) return null

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
 * Hook para verificar si hay consentimiento de cookies de analytics
 */
export function useCookieConsent() {
  const [consent, setConsent] = useState(false)

  useEffect(() => {
    setConsent(hasAnalyticsConsent())

    const handleConsentChange = (event: CustomEvent) => {
      const detail = event.detail
      if (typeof detail === 'object' && detail !== null) {
        setConsent(detail.analytics === true)
      } else {
        setConsent(detail === 'true')
      }
    }

    window.addEventListener('cookieConsentChanged' as any, handleConsentChange)
    return () => window.removeEventListener('cookieConsentChanged' as any, handleConsentChange)
  }, [])

  return consent
}
