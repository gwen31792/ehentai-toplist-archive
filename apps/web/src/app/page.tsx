import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { routing, type Locale } from '@/i18n/routing'

// 根页面的语言检测和重定向
// Next.js 15: cookies() / headers() / params / searchParams 都是异步 Dynamic APIs
export default async function RootPage() {
  const [cookieStore, headersList] = await Promise.all([cookies(), headers()])

  const preferredLanguage = cookieStore.get('NEXT_LOCALE')?.value
  const acceptLanguage = headersList.get('accept-language')

  let locale: Locale = routing.defaultLocale

  // 优先使用用户存储的偏好
  if (preferredLanguage && routing.locales.includes(preferredLanguage as Locale)) {
    locale = preferredLanguage as Locale
  }
  else if (acceptLanguage) {
    // 检测浏览器语言偏好
    const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim())
    for (const lang of languages) {
      const browserLocale = lang.split('-')[0].toLowerCase()
      if (routing.locales.includes(browserLocale as Locale)) {
        locale = browserLocale as Locale
        break
      }
    }
  }

  redirect(`/${locale}`)
}
