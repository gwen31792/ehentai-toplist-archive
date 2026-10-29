'use client'

import { useParams } from 'next/navigation'

import { hasLocale } from 'next-intl'

import { routing } from '@/i18n/routing'

// 根布局在 [locale] 段之上拿不到 locale 参数，这里用 useParams 读当前路由的 locale 设置 lang。
// <html> 留在根布局：挪进 [locale]/layout.tsx 的话，切换语言时 <html> 会重新挂载，ThemeToggle 加的 dark class 会被 React 清掉。
export function LocaleHtml({ children }: { children: React.ReactNode }) {
  const { locale } = useParams<{ locale?: string }>()

  return (
    <html lang={hasLocale(routing.locales, locale) ? locale : routing.defaultLocale}>
      {children}
    </html>
  )
}
