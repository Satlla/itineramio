import type { Metadata, Viewport } from 'next'
import { Inter, Satisfy } from 'next/font/google'
import './globals.css'

export const dynamic = 'force-dynamic'

import { Providers } from './providers'
import { I18nProvider } from '../src/providers/I18nProvider'
import { Toaster } from 'react-hot-toast'
import { validateEnvironmentVariables } from '../src/lib/env-validation'
import { ErrorBoundary } from '../src/components/ErrorBoundary'
import { ChunkErrorHandler } from '../src/components/ChunkErrorHandler'
import { Analytics } from '@vercel/analytics/next'
import { GoogleAnalytics } from '../src/components/GoogleAnalytics'
import { FacebookPixel } from '../src/components/analytics/FacebookPixel'
import { GoogleTagManager, GoogleTagManagerNoScript } from '../src/components/analytics/GoogleTagManager'
import { LoadingProvider } from '../src/components/providers/LoadingProvider'

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
  title: 'Itineramio - Manual Digital para Apartamentos Turísticos | Sin Llamadas 24/7',
  description: 'Crea manuales digitales interactivos para tus alojamientos turísticos. Ahorra 8h/semana. Códigos QR, zonas personalizadas y analytics. Primera propiedad gratis. ¡Adiós a las llamadas a las 4 AM!',
  keywords: [
    // Primary keywords (high volume, high intent)
    'manual digital apartamento turistico',
    'guia digital vivienda vacacional',
    'manual digital piso turistico',
    'manual bienvenida airbnb',

    // Problem-based keywords
    'como hacer manual apartamento turistico',
    'instrucciones apartamento turistico',
    'manual huespedes apartamento',
    'automatizar gestion apartamento turistico',

    // Location-specific
    'manual apartamento turistico madrid',
    'guia digital vivienda turistica barcelona',
    'vut madrid manual digital',

    // Feature keywords
    'codigo qr apartamento turistico',
    'manual interactivo airbnb',
    'software gestion apartamentos turisticos',
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
    },
  },
  openGraph: {
    title: 'Itineramio - Manual Digital para Apartamentos Turísticos',
    description: 'Crea manuales digitales interactivos con códigos QR. Ahorra 8 horas/semana. Primera propiedad gratis. ¡Adiós a las llamadas de madrugada!',
    url: 'https://itineramio.com',
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
    description: 'Crea manuales digitales interactivos con códigos QR. Ahorra 8 horas/semana. Primera propiedad gratis.',
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
    url: 'https://itineramio.com',
    image: 'https://itineramio.com/og-image.jpg',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      description: 'Primera propiedad gratis, luego desde €9/mes',
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
        url: 'https://itineramio.com/logo.png',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'hola@itineramio.com',
        contactType: 'Customer Support',
        availableLanguage: ['Spanish'],
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

        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
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

        {/* Facebook Pixel - Direct in head for immediate loading */}
        {process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID && (
          <script
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
                fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* Google Tag Manager (noscript) */}
        <GoogleTagManagerNoScript />

        {/* Google Tag Manager */}
        <GoogleTagManager />

        {/* Google Analytics 4 (legacy - now using GTM) */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}

        {/* Facebook Pixel - Set NEXT_PUBLIC_FACEBOOK_PIXEL_ID in .env */}
        <FacebookPixel />

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