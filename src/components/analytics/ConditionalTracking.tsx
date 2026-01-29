'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

const GTM_ID = 'GTM-PK5PTZS3'
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID

/**
 * ConditionalTracking - Carga scripts de tracking SOLO si hay consentimiento
 *
 * Cumple con GDPR Art. 7 - No carga cookies de analytics/marketing sin consentimiento previo
 */
export function ConditionalTracking() {
  const [hasConsent, setHasConsent] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

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

  // Don't render scripts until we have consent
  if (!hasConsent) {
    return null
  }

  return (
    <>
      {/* Google Tag Manager */}
      <Script
        id="gtm-script-conditional"
        strategy="afterInteractive"
        onLoad={() => setIsLoaded(true)}
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `,
        }}
      />

      {/* Facebook Pixel */}
      {FB_PIXEL_ID && (
        <Script
          id="fb-pixel-conditional"
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
      )}

      {/* GTM NoScript fallback */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
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
