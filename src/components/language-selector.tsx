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
                className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors flex items-center"
                aria-label="Select language"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <Languages size={24} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 py-2 min-w-[120px] whitespace-nowrap bg-white dark:bg-zinc-800 rounded-md shadow-xl z-20">
                    <button
                        className={`block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 w-full text-left ${currentLang === 'en' ? 'bg-zinc-100 dark:bg-zinc-700' : ''
                            }`}
                        onClick={() => selectLanguage('en')}
                    >
                        English
                    </button>
                    <button
                        className={`block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 w-full text-left ${currentLang === 'zh' ? 'bg-zinc-100 dark:bg-zinc-700' : ''
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

