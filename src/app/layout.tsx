'use client'

import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // const [language, setLanguage] = useState<'en' | 'zh'>('en')
  const language = 'en'

  const metadata = {
    en: {
      title: 'E-Hentai Toplist Archive',
      description: 'browse past gallery toplists of e-hentai',
    },
    zh: {
      title: 'E 站排行榜存档',
      description: '浏览过去的 E-Hentai 画廊排行榜',
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

export const runtime = 'edge';
