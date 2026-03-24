/** @type {import('next').NextConfig} */
// No defaults - all env vars must be set in .env.local

const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  transpilePackages: ['lenis'],
  outputFileTracingExcludes: {
    '/api/*': ['./public/uploads/**', './public/ffmpeg/**'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.muscache.com',
      },
    ],
  },
  async redirects() {
    return [
      // Gestion module renames
      {
        source: '/gestion/configuracion',
        destination: '/gestion/apartamentos',
        permanent: true,
      },
      {
        source: '/gestion/configuracion/:path*',
        destination: '/gestion/apartamentos/:path*',
        permanent: true,
      },
      // Legacy tool URLs
      {
        source: '/tools/:path*',
        destination: '/hub/tools/:path*',
        permanent: true,
      },
      {
        source: '/terms',
        destination: '/blog/manual-digital-apartamento-turistico-guia-completa',
        permanent: true,
      },
      // 404 fixes - pages that Google found but don't exist
      {
        source: '/cookies',
        destination: '/legal/privacy',
        permanent: true,
      },
      {
        source: '/estandares',
        destination: '/',
        permanent: true,
      },
      {
        source: '/%24', // encoded "$" character
        destination: '/',
        permanent: true,
      },
      // Old blog posts - redirect to blog or related content
      {
        source: '/blog/normativa-vut-2025-cambios-legales',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/blog/como-optimizar-precio-apartamento-turistico-2025',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/blog/manual-digital-apartamentos-guia-definitiva',
        destination: '/blog/manual-digital-apartamento-turistico-guia-completa',
        permanent: true,
      },
      {
        source: '/blog/manual-digital-apartamento-turistico-plantilla-completa-2025',
        destination: '/blog/manual-digital-apartamento-turistico-guia-completa',
        permanent: true,
      },
      // Old URL structure (apartments was renamed to properties/z)
      {
        source: '/apartments/:path*',
        destination: '/',
        permanent: true,
      },
      // Additional blog redirects for URLs Google found
      {
        source: '/blog/como-optimizar-precio-apartamento-turistico-2026',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/blog/10-trucos-marketing-aumentar-reservas',
        destination: '/blog/categoria/marketing',
        permanent: true,
      },
    ]
  },
  // Strategic caching headers + Security headers + CORS for mobile dev
  async headers() {
    // Security headers for all routes
    const securityHeaders = [
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains'
      },
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY'
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()'
      },
      // CSP enforced — blocks violations (not just reports)
      // unsafe-eval kept for GA4/GTM compatibility; remove once nonce support is added
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          // GA4 requires: googletagmanager.com + tagmanager.google.com + google-analytics.com + ssl.google-analytics.com
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://tagmanager.google.com https://www.google-analytics.com https://ssl.google-analytics.com https://connect.facebook.net https://maps.googleapis.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://tagmanager.google.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: blob: https://*.blob.vercel-storage.com https://*.public.blob.vercel-storage.com https://images.unsplash.com https://*.muscache.com https://www.google-analytics.com https://ssl.google-analytics.com https://www.facebook.com https://www.googletagmanager.com https://tagmanager.google.com https://ssl.gstatic.com https://maps.googleapis.com https://maps.gstatic.com https://streetviewpixels-pa.googleapis.com https://*.googleusercontent.com",
          // GA4 sends data to analytics.google.com + stats.g.doubleclick.net + region endpoints
          "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://ssl.google-analytics.com https://stats.g.doubleclick.net https://region1.google-analytics.com https://region1.analytics.google.com https://www.googletagmanager.com https://maps.googleapis.com https://www.facebook.com https://connect.facebook.net https://unpkg.com https://*.blob.vercel-storage.com https://blob.vercel-storage.com https://vercel.com blob:",
          "worker-src 'self' blob:",
          "media-src 'self' blob: https://*.public.blob.vercel-storage.com",
          "frame-src 'self' https://www.googletagmanager.com https://tagmanager.google.com https://www.youtube.com https://player.vimeo.com https://challenges.cloudflare.com https://www.facebook.com"
        ].join('; ')
      }
    ]

    return [
      {
        // COOP+COEP for /demo — enables SharedArrayBuffer for FFmpeg WASM video compression
        source: '/demo',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
        ],
      },
      {
        // COEP for Next.js static chunks — required so FFmpeg Web Worker scripts
        // inherit the credentialless COEP when loaded from a crossOriginIsolated context (/demo)
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
        ],
      },
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Cache static assets aggressively
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Default short cache for API routes — individual routes can override
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, must-revalidate',
          },
        ],
      },
      {
        // Light caching for pages
        source: '/((?!api|uploads).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ]
  },
  // Generate build ID from git commit hash for stable asset caching between deploys
  generateBuildId: async () => {
    const { execSync } = require('child_process')
    try {
      return execSync('git rev-parse HEAD').toString().trim()
    } catch {
      return `build-${Date.now()}`
    }
  },
}

module.exports = nextConfig