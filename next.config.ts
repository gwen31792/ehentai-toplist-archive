import type { NextConfig } from 'next'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ehgt.org',
      },
    ],
  },
}

export default nextConfig

initOpenNextCloudflareForDev({
  experimental: { remoteBindings: true },
})
