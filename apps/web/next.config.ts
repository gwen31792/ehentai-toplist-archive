import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
import createNextIntlPlugin from 'next-intl/plugin'

import type { NextConfig } from 'next'

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
  experimental: {
    reactCompiler: true,
  },
}

export default withNextIntl(nextConfig)

initOpenNextCloudflareForDev({
  experimental: { remoteBindings: true },
})
