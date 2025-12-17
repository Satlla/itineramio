'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

// Facebook Pixel ID - Set in environment variable
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID

// Track page views
function FacebookPixelPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (FB_PIXEL_ID && typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'PageView')
    }
  }, [pathname, searchParams])

  return null
}

// Main component
export function FacebookPixel() {
  // Don't render if no Pixel ID configured
  if (!FB_PIXEL_ID) {
    return null
  }

  return (
    <>
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      <Suspense fallback={null}>
        <FacebookPixelPageView />
      </Suspense>
    </>
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
