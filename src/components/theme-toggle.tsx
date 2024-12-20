// TODO: use animation like https://elysiajs.com/
'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
    const [darkMode, setDarkMode] = useState(false)

    useEffect(() => {
        const isDarkMode = document.documentElement.classList.contains('dark')
        setDarkMode(isDarkMode)
    }, [])

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode
        setDarkMode(newDarkMode)
        document.documentElement.classList.toggle('dark', newDarkMode)
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

