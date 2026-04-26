'use client'

import { useEffect, useRef, useState, useTransition } from 'react'

import { Languages } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { PendingStatusBadge } from '@/components/pending-status-badge'
import { locales } from '@/i18n/routing'
import { usePathname, useRouter } from '@/lib/navigation'

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const currentLocale = useLocale()
  const pendingStatusT = useTranslations('components.pendingStatus')

  const toggleDropdown = () => {
    if (isPending) {
      return
    }

    setIsOpen(open => !open)
  }

  const selectLanguage = (locale: string) => {
    setIsOpen(false)
    if (isPending || locale === currentLocale) {
      return
    }

    // 触发路由切换，然后在 effect 中处理副作用
    startTransition(() => {
      router.replace(pathname, { locale })
    })
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 当 locale 变化时，存储用户偏好
  useEffect(() => {
    // Store user's language preference in both localStorage and cookie
    // 使用 next-intl 官方默认的 cookie 键名 NEXT_LOCALE
    localStorage.setItem('preferred-language', currentLocale)
    document.cookie = `NEXT_LOCALE=${currentLocale}; path=/; max-age=${60 * 60 * 24 * 365}` // 1 year
  }, [currentLocale])

  const languageNames = {
    en: 'English',
    zh: '中文',
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center rounded-full bg-zinc-100 p-2 text-zinc-900 transition-colors hover:text-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:text-zinc-400"
        disabled={isPending}
      >
        <Languages size={24} />
      </button>
      {isOpen && (
        <div className="absolute right-0 z-20 mt-2 min-w-[120px] whitespace-nowrap rounded-md bg-white py-2 shadow-xl dark:bg-zinc-800">
          {locales.map(locale => (
            <button
              key={locale}
              className={`block w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700 ${currentLocale === locale ? 'bg-zinc-100 dark:bg-zinc-700' : ''
              }`}
              onClick={() => selectLanguage(locale)}
              disabled={isPending}
            >
              {languageNames[locale as keyof typeof languageNames]}
            </button>
          ))}
        </div>
      )}
      <PendingStatusBadge
        show={isPending}
        text={pendingStatusT('updatingResults')}
        className="left-auto right-0 translate-x-0"
      />
    </div>
  )
}
