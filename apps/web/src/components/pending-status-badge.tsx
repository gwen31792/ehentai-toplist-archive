import { LoaderCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

interface PendingStatusBadgeProps {
  show: boolean
  text: string
  className?: string
}

export function PendingStatusBadge({
  show,
  text,
  className,
}: PendingStatusBadgeProps) {
  if (!show) {
    return null
  }

  return (
    <div
      className={cn(
        'pointer-events-none absolute top-full left-1/2 z-20 mt-2 -translate-x-1/2 duration-150 animate-in fade-in zoom-in-95',
        className,
      )}
    >
      <div
        className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50/95 px-3 py-1.5 text-sm whitespace-nowrap text-zinc-500 shadow-sm backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/95 dark:text-zinc-400"
      >
        <LoaderCircle className="size-4 animate-spin" />
        {text}
      </div>
    </div>
  )
}
