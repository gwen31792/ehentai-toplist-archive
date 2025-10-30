'use client'

import { useTranslations } from 'next-intl'

import { GitHubLink } from '@/components/github-link'
import { LanguageSelector } from '@/components/language-selector'
import { ThemeToggle } from '@/components/theme-toggle'
import { Link } from '@/lib/navigation'

export default function About() {
  const t = useTranslations('pages.about')
  const tSections = useTranslations('pages.about.sections')

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-100 transition-colors dark:bg-zinc-900">
      <div className="absolute right-4 top-4 flex items-center space-x-2">
        <LanguageSelector />
        <GitHubLink />
        <ThemeToggle />
      </div>
      <div className="max-w-2xl px-4 py-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-zinc-800 dark:text-zinc-200">
          {t('title')}
        </h1>
        <Link href="/" className="link-hover-underline text-blue-600 dark:text-blue-400">
          {t('backLink')}
        </Link>
      </div>
      <div className="w-full max-w-2xl px-4 text-left text-zinc-800 dark:text-zinc-200">
        <div>
          <h2 className="mb-4 text-2xl font-bold tracking-wide">{tSections('background.title')}</h2>
          <p className="mb-4 leading-relaxed tracking-wide">{tSections('background.paragraph1')}</p>
          <p className="mb-4 leading-relaxed tracking-wide">{tSections('background.paragraph2')}</p>
          <p className="mb-4 leading-relaxed tracking-wide">{tSections('background.paragraph3')}</p>

          <h2 className="mb-4 text-2xl font-bold tracking-wide">{tSections('description.title')}</h2>
          <p className="mb-4 leading-relaxed tracking-wide">{tSections('description.paragraph1')}</p>
          <p className="mb-4 leading-relaxed tracking-wide">{tSections('description.paragraph2')}</p>
          <p className="mb-4 leading-relaxed tracking-wide">
            {tSections.rich('description.paragraph3', {
              link: chunks => (
                <Link
                  href="https://github.com/gwen31792/ehentai-toplist-archive"
                  className="link-hover-underline text-blue-600 dark:text-blue-400"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>

          <h2 className="mb-4 text-2xl font-bold tracking-wide">{tSections('feedback.title')}</h2>
          <p className="mb-4 leading-relaxed tracking-wide">
            {tSections.rich('feedback.paragraph1', {
              link: chunks => (
                <Link
                  href="https://github.com/gwen31792/ehentai-toplist-archive/issues"
                  className="link-hover-underline text-blue-600 dark:text-blue-400"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
