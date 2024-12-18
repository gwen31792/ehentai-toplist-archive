import { Github } from 'lucide-react'

export function GitHubLink() {
    return (
        <a
            href="https://github.com/yourusername/your-repo"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
            aria-label="View source on GitHub"
        >
            <Github size={24} />
        </a>
    )
}

