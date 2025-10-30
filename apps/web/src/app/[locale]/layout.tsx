import { notFound } from 'next/navigation'

import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'

import requestConfig from '@/i18n/request'
import { routing } from '@/i18n/routing'

type Props = {
  children: React.ReactNode
  // Next.js 15 Dynamic APIs: params 已异步化（Promise），需显式 await 才能访问属性
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const { messages } = await requestConfig({ requestLocale: Promise.resolve(locale) })

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
