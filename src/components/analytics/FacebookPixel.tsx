'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

// Facebook Pixel ID - Set in environment variable
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID

// Paths where tracking should be disabled
const EXCLUDED_PATHS = ['/admin', '/api']

// Track page views on SPA navigation
function FacebookPixelPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Skip tracking on excluded paths (admin, api)
    if (EXCLUDED_PATHS.some(path => pathname?.startsWith(path))) {
      return
    }

    // Skip first render (initial PageView is fired in head script)
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'PageView')
    }
  }, [pathname, searchParams])

  return null
}

// Main component - Now only handles SPA navigation tracking
// Initial script is in layout.tsx head for immediate loading
export function FacebookPixel() {
  if (!FB_PIXEL_ID) {
    return null
  }

  return (
    <Suspense fallback={null}>
      <FacebookPixelPageView />
    </Suspense>
  )
}

// Helper functions for tracking events
export const fbEvent = (eventName: string, options?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, options)
  }
}

// Pre-defined event helpers
export const fbEvents = {
  // Lead generation
  lead: (data?: { content_name?: string; content_category?: string; value?: number; currency?: string }) => {
    fbEvent('Lead', data)
  },

  // Registration
  completeRegistration: (data?: { content_name?: string; status?: string; value?: number; currency?: string }) => {
    fbEvent('CompleteRegistration', data)
  },

  // Trial start
  startTrial: (data?: { value?: number; currency?: string; predicted_ltv?: number }) => {
    fbEvent('StartTrial', data)
  },

  // Subscription/Purchase
  subscribe: (data?: { value?: number; currency?: string; predicted_ltv?: number }) => {
    fbEvent('Subscribe', data)
  },

  // View content (blog, resources)
  viewContent: (data?: { content_name?: string; content_category?: string; content_type?: string; content_ids?: string[] }) => {
    fbEvent('ViewContent', data)
  },

  // Search
  search: (query: string) => {
    fbEvent('Search', { search_string: query })
  },

  // Contact
  contact: () => {
    fbEvent('Contact')
  },

  // Custom event for lead magnets
  downloadLeadMagnet: (name: string, category: string) => {
    fbEvent('Lead', {
      content_name: name,
      content_category: category,
      content_type: 'lead_magnet'
    })
  },
}
