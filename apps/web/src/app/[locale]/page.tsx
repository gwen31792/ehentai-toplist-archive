import { cookies } from 'next/headers'

import { getTranslations } from 'next-intl/server'

import { DataTable } from '@/components/data-table'
import { GitHubLink } from '@/components/github-link'
import { LanguageSelector } from '@/components/language-selector'
import { ThemeToggle } from '@/components/theme-toggle'
import { ToplistQueryControls } from '@/components/toplist-query-controls'
import { Link } from '@/lib/navigation'
import {
  deserializeTablePreferences,
  TABLE_PREFERENCES_COOKIE,
} from '@/lib/table-preferences'
import { queryToplistItems, resolveToplistParams } from '@/lib/toplist-data'

// 首页 server page：负责解析 URL、查询首屏数据，并把查询控件和表格拼装起来。

type PageSearchParams = Record<string, string | string[] | undefined>

type HomeProps = {
  searchParams: Promise<PageSearchParams>
}

// Next 的 searchParams 可能是 string / string[] / undefined，这里统一收敛成单值。
function getSearchParamValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

// 查询控件需要把当前 URL 参数原样带回客户端，继续在其基础上覆盖 date / period_type。
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
  const pageTranslationsPromise = getTranslations('pages.home')
  const cookieStorePromise = cookies()

  const resolvedSearchParams = await searchParams

  // server 侧统一校正 URL 参数，避免客户端和服务端对“当前查询条件”的理解不一致。
  const { selectedDateString, selectedType } = resolveToplistParams({
    dateParam: getSearchParamValue(resolvedSearchParams.date),
    periodTypeParam: getSearchParamValue(resolvedSearchParams.period_type),
  })

  // 查询条件一确定就启动 DB 查询，让它和翻译、cookie 准备并行。
  const initialDataPromise = queryToplistItems(selectedDateString, selectedType)

  const [
    t,
    cookieStore,
    initialData,
  ] = await Promise.all([
    pageTranslationsPromise,
    cookieStorePromise,
    initialDataPromise,
  ])

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
      <div className="flex w-full flex-col items-center space-y-3">
        <ToplistQueryControls
          selectedDateString={selectedDateString}
          selectedType={selectedType}
          searchParamsString={toSearchParamsString(resolvedSearchParams)}
        />
        <div className="w-full space-y-12">
          <div className="w-full">
            <DataTable
              // 查询条件变化后重建表格，让分页和筛选状态以新的数据集重新计算。
              key={`${selectedDateString}-${selectedType}`}
              data={initialData}
              initialPreferences={initialTablePreferences}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
