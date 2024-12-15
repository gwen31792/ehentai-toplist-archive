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
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
        >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
    )
}

