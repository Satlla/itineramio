import type { Metadata, Viewport } from 'next'
import { Inter, Satisfy } from 'next/font/google'
import './globals.css'

export const dynamic = 'force-dynamic'
export const dynamicParams = true
import { Providers } from './providers'
import { I18nProvider } from '../src/providers/I18nProvider'
import { Toaster } from 'react-hot-toast'
import { validateEnvironmentVariables } from '../src/lib/env-validation'
import { ErrorBoundary } from '../src/components/ErrorBoundary'
import { ChunkErrorHandler } from '../src/components/ChunkErrorHandler'
import { Analytics } from '@vercel/analytics/next'

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
  metadataBase: new URL('https://itineramio.com'),
  alternates: {
    canonical: 'https://itineramio.com',
    languages: {
      'es-ES': 'https://itineramio.com',
      'es': 'https://itineramio.com',
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
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3B82F6' },
    { media: '(prefers-color-scheme: dark)', color: '#1E40AF' }
  ],
  viewportFit: 'cover', // Support for notched devices
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${satisfy.variable}`}>
      <head>
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
      </head>
      <body className={`${inter.className} antialiased`}>
        <ChunkErrorHandler />
        <ErrorBoundary>
          <I18nProvider>
            <Providers>
              {children}
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
        <Analytics />
      </body>
    </html>
  )
}