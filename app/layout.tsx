import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { I18nProvider } from '@/providers/I18nProvider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Itineramio - Create Beautiful Property Manuals',
  description: 'The easiest way to create interactive property manuals for your guests. Airbnb-quality experience made simple.',
  keywords: ['property manual', 'airbnb', 'vacation rental', 'guest guide', 'interactive manual'],
  authors: [{ name: 'Itineramio Team' }],
  creator: 'Itineramio',
  publisher: 'Itineramio',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://itineramio.com'),
  openGraph: {
    title: 'Itineramio - Create Beautiful Property Manuals',
    description: 'The easiest way to create interactive property manuals for your guests.',
    url: 'https://itineramio.com',
    siteName: 'Itineramio',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Itineramio - Property Manual Creator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Itineramio - Create Beautiful Property Manuals',
    description: 'The easiest way to create interactive property manuals for your guests.',
    images: ['/og-image.jpg'],
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
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
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
      </body>
    </html>
  )
}