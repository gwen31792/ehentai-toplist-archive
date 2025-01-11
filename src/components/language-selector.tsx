'use client'

import { useState, useEffect, useRef } from 'react'
import { Languages } from 'lucide-react'
import { Language } from '@/lib/types'

interface LanguageSelectorProps {
    onLanguageChange: (lang: Language) => void
    currentLang: Language
}

export function LanguageSelector({ onLanguageChange, currentLang }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toggleDropdown = () => setIsOpen(!isOpen)

  const selectLanguage = (lang: Language) => {
    onLanguageChange(lang)
    setIsOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center rounded-full bg-zinc-100 p-2 text-zinc-900 transition-colors hover:text-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:text-zinc-400"
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Languages size={24} />
      </button>
      {isOpen && (
        <div className="absolute right-0 z-20 mt-2 min-w-[120px] whitespace-nowrap rounded-md bg-white py-2 shadow-xl dark:bg-zinc-800">
          <button
            className={`block w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700 ${currentLang === 'en' ? 'bg-zinc-100 dark:bg-zinc-700' : ''
            }`}
            onClick={() => selectLanguage('en')}
          >
                        English
          </button>
          <button
            className={`block w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700 ${currentLang === 'zh' ? 'bg-zinc-100 dark:bg-zinc-700' : ''
            }`}
            onClick={() => selectLanguage('zh')}
          >
                        中文
          </button>
        </div>
      )}
    </div>
  )
}

