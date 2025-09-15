import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'E-Hentai Toplist Archive',
  description: 'browse past gallery toplists of e-hentai',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
