/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
    return new Date().getTime().toString()
  },
}

module.exports = nextConfig