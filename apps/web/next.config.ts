import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
import createNextIntlPlugin from 'next-intl/plugin'

import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ehgt.org',
      },
    ],
  },
  reactCompiler: true,
  experimental: {
    // Next 16.3 起 next build 默认改用 tsc CLI 做类型检查，不再关闭 composite；
    // custom-worker.ts 会把已有的 .open-next 产物拉进项目报 TS6307，所以沿用 API 检查。
    useTypeScriptCli: false,
  },
}

export default withNextIntl(nextConfig)

if (process.env.NODE_ENV === 'development') {
  initOpenNextCloudflareForDev()
}
