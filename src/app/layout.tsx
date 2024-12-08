'use client'

import { useState } from 'react'
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TODO: 国际化路由
  const [language, setLanguage] = useState<'en' | 'zh'>('en')

  const metadata = {
    en: {
      title: 'Simple Web App',
      description: 'A simple web app with dark mode toggle and language selection',
    },
    zh: {
      title: '简单网络应用',
      description: '一个具有深色模式切换和语言选择功能的简单网络应用',
    },
  }

  return (
    <html lang={language}>
      <head>
        <title>{metadata[language].title}</title>
        <meta name="description" content={metadata[language].description} />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}

