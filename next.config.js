/** @type {import('next').NextConfig} */
// No defaults - all env vars must be set in .env.local

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    esmExternals: true,
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
    ],
  },
  // Redirects for legacy/short URLs and 404 fixes
  async redirects() {
    return [
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
    ]
  },
  // Strategic caching headers
  async headers() {
    return [
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
        // Cache API routes for a short time
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
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
  // Generate build ID based on timestamp to force new deployments
  generateBuildId: async () => {
    return `clean-build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },
}

module.exports = nextConfig