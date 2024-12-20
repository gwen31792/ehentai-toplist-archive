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
            title: 'About Our App',
            backLink: 'Back to Home',

        },
        zh: {
            title: '关于我们的应用',
            backLink: '返回首页',
        },
    }

    return (
        <div className="flex min-h-screen flex-col items-center bg-zinc-100 transition-colors dark:bg-zinc-900">
            <div className="fixed right-4 top-4 flex items-center space-x-2">
                <LanguageSelector onLanguageChange={handleLanguageChange} currentLang={language} />
                <GitHubLink />
                <ThemeToggle />
            </div>
            <div className="max-w-2xl px-4 py-8 text-center">
                <h1 className="mb-4 text-4xl font-bold text-zinc-800 dark:text-zinc-200">
                    {content[language].title}
                </h1>
                {/* <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400 mb-4">
                    {content[language].description}
                </p> */}
                <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
                    {content[language].backLink}
                </Link>
            </div>
            <div className="w-full max-w-2xl px-4 text-left text-zinc-800 dark:text-zinc-200">
                {language === 'en' && (
                    <div>
                        <h2 className="mb-4 text-2xl font-bold">Background</h2>
                        <p className="mb-2">some text</p>
                        <p className="mb-2">some text</p>
                        <h2 className="mb-4 text-2xl font-bold">english</h2>
                        <p className="mb-2">some text</p>
                        <p className="mb-2">some text</p>
                    </div>
                )}
                {language === 'zh' && (
                    <div>
                        <h2 className="mb-4 text-2xl font-bold tracking-wide">背景</h2>
                        <p className="mb-4 leading-relaxed tracking-wide">E-Hentai 并没有提供查看过去的排行榜的功能，你只能在当下查看昨天、过去一个月、过去一年、所有时间的排行榜单，但是，有时你又会想查看过去一个精确的时间</p>
                        <p className="mb-4 leading-relaxed tracking-wide">比如，上上个月的排行榜。这时，过去一个月的排行榜不包括这部分数据，但是，过去一年的数据又会过于冗余，上上个月的数据需要和其他 11 个月的竞争</p>
                        <p className="mb-4 leading-relaxed tracking-wide">这就是我写这个应用的最初动机，我希望不用担心错过某些排行榜，在几个月后仍然能找回之前的状态</p>

                        <h2 className="mb-4 text-2xl font-bold tracking-wide">说明</h2>
                        <p className="mb-4 leading-relaxed tracking-wide">这个应用的数据来源是 E-Hentai 的排行榜，我会每天爬取一次排行榜数据（所以几乎不会对服务器造成影响），然后存储在数据库中，你可以在这个应用中查看过去的排行榜数据</p>
                        <p className='mb-4 leading-relaxed tracking-wide '>同时，这个应用也不会影响 E-Hentai 本身的流量，它只提供 E-Hentai 本身不提供的数据，如果没有本站，这些流量也不会出现</p>
                        <p className='mb-4 leading-relaxed tracking-wide'>在浏览每个具体的画廊时，用户又会回到 E-Hentai</p>

                        <h2 className="mb-4 text-2xl font-bold tracking-wide">技术架构</h2>

                    </div>
                )}
            </div>
        </div>

    )
}

export const runtime = "edge";