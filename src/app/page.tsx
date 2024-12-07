import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { GitHubLink } from '@/components/github-link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="fixed top-4 right-4 flex items-center space-x-2">
        <GitHubLink />
        <ThemeToggle />
      </div>
      <div className="max-w-2xl px-4 py-8 text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Welcome to Our Web App
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          This is a simple web application built with Next.js and Tailwind CSS.
          Learn more about our project on the <Link href="/about" className="text-blue-600 dark:text-blue-400 hover:underline">about page</Link>.
        </p>
      </div>
    </div>
  )
}

