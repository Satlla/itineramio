/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['k1f4x7ksxbn13s8z.public.blob.vercel-storage.com'],
  },
  // Add headers to prevent aggressive caching of HTML
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
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