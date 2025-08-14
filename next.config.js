/** @type {import('next').NextConfig} */
// Set default environment variables for build if not provided
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://build:build@localhost:5432/builddb'
}
if (!process.env.RESEND_API_KEY) {
  process.env.RESEND_API_KEY = 're_build_dummy_key_for_build_only'
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'build-jwt-secret-placeholder-do-not-use-in-production'
}
if (!process.env.NEXT_PUBLIC_APP_URL) {
  process.env.NEXT_PUBLIC_APP_URL = 'https://itineramio.com'
}

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: true,
  },
  images: {
    domains: ['k1f4x7ksxbn13s8z.public.blob.vercel-storage.com'],
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