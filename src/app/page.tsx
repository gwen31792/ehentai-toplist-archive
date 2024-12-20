'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { GitHubLink } from '@/components/github-link'
import { LanguageSelector } from '@/components/language-selector'
import { TypeSelect } from '@/components/type-select'
import { DatePicker } from '@/components/date-picker'
import { DataTable } from '@/components/data-table'
import { Language, QueryResponseItem } from '@/lib/types'
import { format } from 'date-fns';

export default function Home() {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    const storedLang = localStorage.getItem('language') as Language
    if (storedLang) {
      setLanguage(storedLang)
    }
  }, [])

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang)
    localStorage.setItem('language', newLang)
  }

  const content = {
    en: {
      title: 'E-Hentai Toplist Archive',
      description: 'browse past gallery toplists of e-hentai. Learn more on the ',
      aboutLink: 'about page',
    },
    zh: {
      title: 'E 站排行榜存档',
      description: '浏览过去的 E-Hentai 画廊排行榜。在',
      aboutLink: '关于页面',
    },
  }

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedType, setSelectedType] = useState<string>('day')

  const [data, setData] = useState<QueryResponseItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function func() {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const res = await fetch(`/api/data?list_date=${dateString}&period_type=${selectedType}`);
      setData(await res.json());
      setLoading(false);
    }
    func();
  }, [selectedDate, selectedType]);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 transition-colors dark:bg-zinc-900">
      <div className="absolute right-4 top-4 flex items-center space-x-2">
        <LanguageSelector onLanguageChange={handleLanguageChange} currentLang={language} />
        <GitHubLink />
        <ThemeToggle />
      </div>
      <div className="max-w-2xl px-4 py-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-zinc-800 dark:text-zinc-200">
          {content[language].title}
        </h1>
        <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">
          {content[language].description}
          <Link href="/about" className="text-blue-600 hover:underline dark:text-blue-400">
            {content[language].aboutLink}
          </Link>
          {language === 'zh' && '了解更多'}
        </p>
      </div>
      <div className="flex flex-col items-center space-y-4">
        <div className='flex space-x-4'>
          <DatePicker onDateChange={setSelectedDate} language={language} />
          <TypeSelect type={selectedType} onSelectChange={setSelectedType} />
        </div>
        <DataTable data={data} language={language} loading={loading} />
      </div>

    </div>
  )
}

export const runtime = "edge";
