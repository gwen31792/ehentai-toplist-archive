'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type PeriodType } from '@/lib/types'

export interface TypeSelectContent {
  placeholder: string
  day: string
  month: string
  year: string
  all: string
}

interface TypeSelectProps {
  type: PeriodType
  onSelectChange: (type: PeriodType) => void
  content: TypeSelectContent
  disabled?: boolean
}

export function TypeSelect({
  type,
  onSelectChange,
  content,
  disabled = false,
}: TypeSelectProps) {
  return (
    <Select
      value={type}
      onValueChange={value => onSelectChange(value as PeriodType)}
      disabled={disabled}
    >
      <SelectTrigger className="w-[180px] bg-zinc-50 dark:bg-zinc-800">
        <SelectValue placeholder={content.placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-zinc-50 dark:bg-zinc-800">
        <SelectItem value="day" className="dark:hover:bg-zinc-700 dark:data-highlighted:bg-zinc-700">
          {content.day}
        </SelectItem>
        <SelectItem value="month" className="dark:hover:bg-zinc-700 dark:data-highlighted:bg-zinc-700">
          {content.month}
        </SelectItem>
        <SelectItem value="year" className="dark:hover:bg-zinc-700 dark:data-highlighted:bg-zinc-700">
          {content.year}
        </SelectItem>
        <SelectItem value="all" className="dark:hover:bg-zinc-700 dark:data-highlighted:bg-zinc-700">
          {content.all}
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
