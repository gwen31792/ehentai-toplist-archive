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
      title: 'Welcome to Our Web App',
      description: 'This is a simple web application built with Next.js and Tailwind CSS. Learn more about our project on the',
      aboutLink: 'about page',
    },
    zh: {
      title: '欢迎来到我们的网络应用',
      description: '这是一个使用 Next.js 和 Tailwind CSS 构建的简单网络应用。在',
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <LanguageSelector onLanguageChange={handleLanguageChange} currentLang={language} />
        <GitHubLink />
        <ThemeToggle />
      </div>
      <div className="max-w-2xl px-4 py-8 text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          {content[language].title}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {content[language].description}{' '}
          <Link href="/about" className="text-blue-600 dark:text-blue-400 hover:underline">
            {content[language].aboutLink}
          </Link>
          {language === 'zh' && '了解更多关于我们项目的信息。'}
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
