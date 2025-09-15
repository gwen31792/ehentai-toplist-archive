import type { NextConfig } from 'next'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

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

export default withNextIntl(nextConfig)

initOpenNextCloudflareForDev({
  experimental: { remoteBindings: true },
})
