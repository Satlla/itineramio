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
    domains: ['k1f4x7ksxbn13s8z.public.blob.vercel-storage.com', 'images.unsplash.com'],
  },
  // Redirects for legacy/short URLs
  async redirects() {
    return [
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