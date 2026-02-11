import type { Metadata, Viewport } from 'next'
import { Inter, Satisfy } from 'next/font/google'
import './globals.css'

// Force dynamic rendering — required because many client pages use useSearchParams()
// which fails during static prerendering in Next.js 15
export const dynamic = 'force-dynamic'

import { Providers } from './providers'
import { I18nProvider } from '../src/providers/I18nProvider'
import { Toaster } from 'react-hot-toast'
import { validateEnvironmentVariables } from '../src/lib/env-validation'
import { ErrorBoundary } from '../src/components/ErrorBoundary'
import { ChunkErrorHandler } from '../src/components/ChunkErrorHandler'
import { Analytics } from '@vercel/analytics/next'
import { FacebookPixel } from '../src/components/analytics/FacebookPixel'
import { ConditionalTracking } from '../src/components/analytics/ConditionalTracking'
import { CookieBanner } from '../src/components/ui/CookieBanner'
import { LoadingProvider } from '../src/components/providers/LoadingProvider'
import { ExitIntentPopup } from '../src/components/marketing/ExitIntentPopup'
import { PWASafeArea } from '../src/components/pwa/PWASafeArea'
import NextTopLoader from 'nextjs-toploader'

// Validate environment variables on startup
if (typeof window === 'undefined') {
  validateEnvironmentVariables()
}

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

const satisfy = Satisfy({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-satisfy'
})

export const metadata: Metadata = {
  title: 'Manual Digital Apartamentos Turísticos | Software Gestión Airbnb | Itineramio',
  description: 'Crea manuales digitales para apartamentos turísticos en minutos. Software de gestión para Airbnb y alquiler vacacional: QR codes, check-in automático, comunicación con huéspedes. Prueba gratis 15 días.',
  keywords: [
    // Primary keywords (high volume, high intent)
    'manual digital apartamento turistico',
    'manuales digitales apartamentos turisticos',
    'guia digital vivienda vacacional',
    'manual digital piso turistico',
    'manual bienvenida airbnb',
    'software gestion apartamentos turisticos',
    'gestion alquiler vacacional',

    // Problem-based keywords
    'como hacer manual apartamento turistico',
    'instrucciones apartamento turistico',
    'manual huespedes apartamento',
    'automatizar gestion apartamento turistico',
    'automatizar airbnb',
    'reducir llamadas huespedes',

    // Feature keywords
    'codigo qr apartamento turistico',
    'manual interactivo airbnb',
    'check-in digital apartamento',
    'comunicacion huespedes automatizada',
    'PMS apartamentos turisticos',

    // Superhost & Quality
    'como ser superhost airbnb',
    'conseguir resenas 5 estrellas',
    'mejorar experiencia huesped',

    // Location-specific
    'manual apartamento turistico madrid',
    'guia digital vivienda turistica barcelona',
    'normativa vivienda turistica espana',
  ],
  authors: [{ name: 'Itineramio' }],
  creator: 'Itineramio',
  publisher: 'Itineramio',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.itineramio.com'),
  alternates: {
    canonical: 'https://www.itineramio.com',
    languages: {
      'es-ES': 'https://www.itineramio.com',
      'es': 'https://www.itineramio.com',
      'en': 'https://www.itineramio.com',
      'fr': 'https://www.itineramio.com',
    },
  },
  openGraph: {
    title: 'Itineramio - Manual Digital para Apartamentos Turísticos',
    description: 'Crea manuales digitales interactivos con códigos QR. Ahorra tiempo cada semana. Prueba gratis 15 días. ¡Adiós a las llamadas de madrugada!',
    url: 'https://www.itineramio.com',
    siteName: 'Itineramio',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Itineramio - Crea Manuales Digitales para Apartamentos Turísticos',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Itineramio - Manual Digital para Apartamentos Turísticos',
    description: 'Crea manuales digitales interactivos con códigos QR. Ahorra tiempo cada semana. Prueba gratis 15 días.',
    images: ['/og-image.jpg'],
    creator: '@itineramio',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // TODO: Replace with actual code from Google Search Console
  },
  category: 'Software',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Itineramio',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#8B5CF6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Organization Schema for SEO
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Itineramio',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'Crea manuales digitales interactivos para tus alojamientos turísticos. Ahorra 8h/semana. Códigos QR, zonas personalizadas y analytics.',
    url: 'https://www.itineramio.com',
    image: 'https://www.itineramio.com/og-image.jpg',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      description: 'Prueba gratis 15 días, luego desde €9/mes',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Itineramio',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.itineramio.com/logo.png',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'hola@itineramio.com',
        contactType: 'Customer Support',
        availableLanguage: ['Spanish', 'English', 'French'],
      },
      sameAs: [
        'https://twitter.com/itineramio',
        'https://www.linkedin.com/company/itineramio',
        'https://www.facebook.com/itineramio',
      ],
    },
  }

  return (
    <html lang="es" className={`${inter.variable} ${satisfy.variable}`}>
      <head>
        {/* Schema.org Organization structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />

        {/* Favicons - v2 forces cache refresh */}
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
        <link rel="manifest" href="/manifest.json?v=2" />
        
        {/* Enhanced PWA meta tags for native app feel */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Itineramio" />
        <meta name="format-detection" content="telephone=no" />

        {/* iOS Splash Screens */}
        <link rel="apple-touch-startup-image" href="/splash-screen.png" />

        {/* Disable double-tap zoom on iOS */}
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Facebook Pixel and GTM are loaded via ConditionalTracking after cookie consent */}
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* PWA Safe Area Handler - adds pwa-standalone class when in PWA mode */}
        <PWASafeArea />

        {/* Global Top Loading Bar */}
        <NextTopLoader
          color="#8B5CF6"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #8B5CF6,0 0 5px #8B5CF6"
          zIndex={9999}
        />

        {/* Conditional Tracking - GTM and FB Pixel load ONLY after cookie consent (GDPR) */}
        <ConditionalTracking />

        {/* Facebook Pixel SPA navigation tracking (only works if consent given) */}
        <FacebookPixel />

        {/* Cookie Consent Banner - Shows on all pages until user makes a choice */}
        <CookieBanner />

        {/* Exit Intent Popup - Time Calculator Lead Magnet */}
        {/* Shows after 5 seconds OR on exit intent, with 3-day cooldown */}
        <ExitIntentPopup delay={3000} cooldownDays={3} autoShowDelay={5000} />

        <ChunkErrorHandler />
        <ErrorBoundary>
          <I18nProvider>
            <Providers>
              <LoadingProvider>
                {children}
              </LoadingProvider>
              <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                className: 'bg-white border border-gray-200 text-gray-800 shadow-lg',
                success: {
                  className: 'bg-green-50 border-green-200 text-green-800',
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#f0fdf4',
                  },
                },
                error: {
                  className: 'bg-red-50 border-red-200 text-red-800',
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fef2f2',
                  },
                },
              }}
              />
            </Providers>
          </I18nProvider>
        </ErrorBoundary>

        {/* Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  )
}