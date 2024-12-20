'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { GitHubLink } from '@/components/github-link'
import { LanguageSelector } from '@/components/language-selector'
import { Language } from '@/lib/types'

export default function About() {
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
            title: 'About Our Web App',
            description: 'This is the about page of our simple web application. It demonstrates the use of Next.js for routing and Tailwind CSS for styling.',
            backLink: 'Back to Home',
        },
        zh: {
            title: '关于我们的网络应用',
            description: '这是我们简单网络应用的关于页面。它展示了使用 Next.js 进行路由和 Tailwind CSS 进行样式设计的应用。',
            backLink: '返回首页',
        },
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 transition-colors">
            <div className="fixed top-4 right-4 flex items-center space-x-2">
                <LanguageSelector onLanguageChange={handleLanguageChange} currentLang={language} />
                <GitHubLink />
                <ThemeToggle />
            </div>
            <div className="max-w-2xl px-4 py-8 text-center">
                <h1 className="text-4xl font-bold mb-4 text-zinc-800 dark:text-zinc-200">
                    {content[language].title}
                </h1>
                <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400 mb-4">
                    {content[language].description}
                </p>
                <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
                    {content[language].backLink}
                </Link>
            </div>
        </div>
    )
}

export const runtime = "edge";