import './globals.css'

import { LocaleHtml } from '@/components/locale-html'

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
    <LocaleHtml>
      <body>{children}</body>
    </LocaleHtml>
  )
}
