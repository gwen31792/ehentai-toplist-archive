import { Github } from 'lucide-react'

export function GitHubLink() {
  return (
    <a
      href="https://github.com/gwen31792/ehentai-toplist-archive"
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-full bg-zinc-100 p-2 text-zinc-900 transition-colors hover:text-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:text-zinc-400"
      aria-label="View source on GitHub"
    >
      <Github size={24} />
    </a>
  )
}

