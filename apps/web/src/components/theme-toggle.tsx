'use client'

import { useState, useEffect } from 'react'

import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  // 使用函数式初始化状态，避免在 effect 中设置初始值
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false
    const savedTheme = localStorage.getItem('theme')
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  // 初始化时应用主题
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在组件挂载时运行一次
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    document.documentElement.classList.toggle('dark', newDarkMode)
    // 保存主题状态到 localStorage
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggleDarkMode}
      className="rounded-full bg-zinc-100 p-2 text-zinc-900 transition-colors hover:text-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:text-zinc-400"
      aria-label="Toggle dark mode"
    >
      {darkMode ? <Sun size={24} /> : <Moon size={24} />}
    </button>
  )
}
