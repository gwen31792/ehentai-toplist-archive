import { Suspense } from 'react'

import { useTranslations } from 'next-intl'

import { GitHubLink } from '@/components/github-link'
import { LanguageSelector } from '@/components/language-selector'
import { ThemeToggle } from '@/components/theme-toggle'
import { ToplistContent } from '@/components/toplist-content'
import { Link } from '@/lib/navigation'

export default function Home() {
  const t = useTranslations('pages.home')
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
      <Suspense fallback={<div>Loading...</div>}>
        <ToplistContent />
      </Suspense>

    </div>
  )
}
