'use client'

import { useState, useEffect } from 'react'

import { format } from 'date-fns'
import { useTranslations } from 'next-intl'

import { DataTable } from '@/components/data-table'
import { DatePicker } from '@/components/date-picker'
import { GitHubLink } from '@/components/github-link'
import { LanguageSelector } from '@/components/language-selector'
import { ThemeToggle } from '@/components/theme-toggle'
import { TypeSelect } from '@/components/type-select'
import { Link } from '@/lib/navigation'
import { QueryResponseItem, ToplistType } from '@/lib/types'

export default function Home() {
  const t = useTranslations('pages.home')

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedType, setSelectedType] = useState<ToplistType>('day')

  const [data, setData] = useState<QueryResponseItem[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function func() {
      setLoading(true)
      const dateString = format(selectedDate, 'yyyy-MM-dd')
      const res = await fetch(`/api/data?list_date=${dateString}&period_type=${selectedType}`, { cache: 'force-cache' })
      setData(await res.json())
      setLoading(false)
    }
    func()
  }, [selectedDate, selectedType])
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
      <div className="flex flex-col items-center space-y-4">
        <div className="flex space-x-4">
          <DatePicker onDateChange={setSelectedDate} />
          <TypeSelect type={selectedType} onSelectChange={setSelectedType} />
        </div>
        <div className="w-full space-y-12">
          <div className="w-full">
            <DataTable data={data} loading={loading} />
          </div>
        </div>
      </div>

    </div>
  )
}
