'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { GitHubLink } from '@/components/github-link'
import { LanguageSelector } from '@/components/language-selector'

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="fixed top-4 right-4 flex items-center space-x-2">
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
    </div>
  )
}

