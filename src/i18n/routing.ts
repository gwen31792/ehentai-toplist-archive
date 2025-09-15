import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  localePrefix: 'always',
})

export const { locales, defaultLocale, localePrefix } = routing
export type Locale = (typeof locales)[number]
