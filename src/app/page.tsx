'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { GitHubLink } from '@/components/github-link'
import { LanguageSelector } from '@/components/language-selector'
import { TypeSelect } from '@/components/type-select'
import { DatePicker } from '@/components/date-picker'
import { DataTable, DataItem } from '@/components/data-table'

type Language = 'en' | 'zh'

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

  const sampleData: DataItem[] = [
    { id: 1, name: 'Item 1', value: 100, category: 'A', date: '2023-05-01' },
    { id: 2, name: 'Item 2', value: 200, category: 'B', date: '2023-05-02' },
    { id: 3, name: 'Item 3', value: 300, category: 'A', date: '2023-05-03' },
    { id: 4, name: 'Item 4', value: 400, category: 'C', date: '2023-05-04' },
    { id: 5, name: 'Item 5', value: 500, category: 'B', date: '2023-05-05' },
    { id: 6, name: 'Item 6', value: 600, category: 'C', date: '2023-05-06' },
    { id: 7, name: 'Item 7', value: 700, category: 'A', date: '2023-05-07' },
    { id: 8, name: 'Item 8', value: 800, category: 'B', date: '2023-05-08' },
    { id: 9, name: 'Item 9', value: 900, category: 'C', date: '2023-05-09' },
    { id: 10, name: 'Item 10', value: 1000, category: 'A', date: '2023-05-10' },
  ]

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
        <DatePicker />
        <TypeSelect />
        <DataTable data={sampleData} language={language} />
      </div>

    </div>
  )
}

