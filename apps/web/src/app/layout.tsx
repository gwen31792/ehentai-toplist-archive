import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
