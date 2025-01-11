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
      <div className="absolute right-4 top-4 flex items-center space-x-2">
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
        <Link href="/" className="link-hover-underline text-blue-600 dark:text-blue-400">
          {content[language].backLink}
        </Link>
      </div>
      <div className="w-full max-w-2xl px-4 text-left text-zinc-800 dark:text-zinc-200">
        {language === 'en' && (
          <div>
            <h2 className="mb-4 text-2xl font-bold tracking-wide">Background</h2>
            <p className="mb-4 leading-relaxed tracking-wide">E-Hentai does not provide a feature to view past toplists. You can only check the toplists for yesterday, the past month, the past year, or all time. However, there are times when you might want to look at the toplist from a specific point in time.</p>
            <p className="mb-4 leading-relaxed tracking-wide">For instance, if you want to view the toplist from two months ago, the past month toplist won&apos;t cover that period, while the past year toplist includes too much data from other months. This makes it difficult for galleries from the target month to stand out among those from the other 11 months.</p>
            <p className="mb-4 leading-relaxed tracking-wide">This was my initial motivation for creating this application. I wanted a way to ensure I wouldn’t miss certain toplists and still be able to revisit them months later.</p>

            <h2 className="mb-4 text-2xl font-bold tracking-wide">Description</h2>
            <p className="mb-4 leading-relaxed tracking-wide">This application gathers its data from E-Hentai&apos;s toplists. I scrape the toplist data once a day (minimizing the impact on the server&apos;s load) and store it in a database. You can use this app to access historical toplist data.</p>
            <p className='mb-4 leading-relaxed tracking-wide '>The app only provides historical toplist data that E-Hentai itself does not offer. It does not affect E-Hentai&apos;s regular traffic. Users still need to visit the official E-Hentai website to browse specific galleries.</p>
            <p className='mb-4 leading-relaxed tracking-wide'>For technical details about this application, including the tech stack, the underlying infrastructure, the frontend-backend interaction architecture, and changelog, please refer to the <Link href="https://github.com/gwen31792/ehentai-toplist-archive" className='link-hover-underline text-blue-600 dark:text-blue-400'>GitHub repository</Link>.</p>

            <h2 className="mb-4 text-2xl font-bold tracking-wide">Feedback</h2>
            <p className='mb-4 leading-relaxed tracking-wide'>If you have any questions or suggestions for features, feel free to submit them via <Link href="https://github.com/gwen31792/ehentai-toplist-archive/issues" className='link-hover-underline text-blue-600 dark:text-blue-400'>GitHub Issues</Link>.</p>
          </div>
        )}
        {language === 'zh' && (
          <div>
            <h2 className="mb-4 text-2xl font-bold tracking-wide">背景</h2>
            <p className="mb-4 leading-relaxed tracking-wide">E-Hentai 并没有提供查看过去的排行榜的功能，你只能在当下查看昨天、过去一个月、过去一年、所有时间的排行榜单，但是，有时你可能想查看某个特定时间点的排行榜</p>
            <p className="mb-4 leading-relaxed tracking-wide">例如，当你想查看上上个月的排行榜时，过去一个月的榜单无法覆盖这个时间段，而过去一年的榜单又包含了太多其他月份的数据，使得目标月份的作品需要与其他 11 个月的作品竞争排名</p>
            <p className="mb-4 leading-relaxed tracking-wide">这就是我写这个应用的最初动机，我希望不用担心错过某些排行榜，在几个月后仍然能找回之前的状态</p>

            <h2 className="mb-4 text-2xl font-bold tracking-wide">说明</h2>
            <p className="mb-4 leading-relaxed tracking-wide">这个应用的数据来源是 E-Hentai 的排行榜，我会每天爬取一次排行榜数据（所以对服务器的负载影响极小），然后存储在数据库中，你可以在这个应用中查看过去的排行榜数据</p>
            <p className='mb-4 leading-relaxed tracking-wide '>本应用仅提供 E-Hentai 官方未提供的历史排行榜数据，不会影响其正常流量。用户浏览具体画廊时仍需访问 E-Hentai 官网</p>
            <p className='mb-4 leading-relaxed tracking-wide'>关于本应用的技术相关的内容，包括技术栈，依赖的互联网基础设施，前后端交互架构以及更新说明，请到 <Link href="https://github.com/gwen31792/ehentai-toplist-archive" className='link-hover-underline text-blue-600 dark:text-blue-400'>GitHub</Link> 上查看</p>

            <h2 className="mb-4 text-2xl font-bold tracking-wide">反馈</h2>
            <p className='mb-4 leading-relaxed tracking-wide'>如果你有任何问题或者功能上的建议，欢迎在 <Link href="https://github.com/gwen31792/ehentai-toplist-archive/issues" className='link-hover-underline text-blue-600 dark:text-blue-400'>GitHub Issues</Link> 上提出</p>

          </div>
        )}
      </div>
    </div>

  )
}

export const runtime = 'edge';