import { Github } from 'lucide-react'

export function GitHubLink() {
    return (
        <a
            href="https://github.com/gwen31792/ehentai-toplist-archive"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed top-4 right-16 p-2 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            aria-label="View source on GitHub"
        >
            <Github size={24} />
        </a>
    )
}

