import { cookies } from 'next/headers'

import { getTranslations } from 'next-intl/server'

import { GitHubLink } from '@/components/github-link'
import { LanguageSelector } from '@/components/language-selector'
import { ThemeToggle } from '@/components/theme-toggle'
import { ToplistContent } from '@/components/toplist-content'
import { Link } from '@/lib/navigation'
import {
  deserializeTablePreferences,
  TABLE_PREFERENCES_COOKIE,
} from '@/lib/table-preferences'
import { queryToplistItems, resolveToplistParams } from '@/lib/toplist-data'

type PageSearchParams = Record<string, string | string[] | undefined>

type HomeProps = {
  searchParams: Promise<PageSearchParams>
}

function getSearchParamValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function toSearchParamsString(searchParams: PageSearchParams): string {
  const params = new URLSearchParams()

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(item => params.append(key, item))
      return
    }

    if (value !== undefined) {
      params.set(key, value)
    }
  })

  return params.toString()
}

export default async function Home({ searchParams }: HomeProps) {
  const [t, resolvedSearchParams, cookieStore] = await Promise.all([
    getTranslations('pages.home'),
    searchParams,
    cookies(),
  ])
  const { selectedDateString, selectedType } = resolveToplistParams({
    dateParam: getSearchParamValue(resolvedSearchParams.date),
    periodTypeParam: getSearchParamValue(resolvedSearchParams.period_type),
  })
  const initialData = await queryToplistItems(selectedDateString, selectedType)
  // 首屏直接读取 cookie 里的表格偏好，让 SSR 和 hydration 前的客户端视图尽量一致。
  const initialTablePreferences = deserializeTablePreferences(
    cookieStore.get(TABLE_PREFERENCES_COOKIE)?.value,
  )

  return (
    <div className="flex min-h-[calc(100vh+50px)] flex-col items-center justify-start bg-zinc-100 transition-colors dark:bg-zinc-900">
      <div className="absolute right-4 top-4 flex items-center space-x-2">
        <LanguageSelector />
        <GitHubLink />
        <ThemeToggle />
      </div>
      <div className="max-w-2xl px-4 py-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-zinc-800 dark:text-zinc-200">
          {t('title')}
        </h1>
        <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">
          {t.rich('description', {
            link: chunks => (
              <Link
                href="/about"
                className="link-hover-underline text-blue-600 dark:text-blue-400"
              >
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>
      <ToplistContent
        initialData={initialData}
        initialTablePreferences={initialTablePreferences}
        selectedDateString={selectedDateString}
        selectedType={selectedType}
        searchParamsString={toSearchParamsString(resolvedSearchParams)}
      />

    </div>
  )
}
