'use client'

import { useTranslations } from 'next-intl'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type PeriodType } from '@/lib/types'

interface TypeSelectProps {
  type: PeriodType
  onSelectChange: (type: PeriodType) => void
  disabled?: boolean
}

export function TypeSelect({
  type,
  onSelectChange,
  disabled = false,
}: TypeSelectProps) {
  const t = useTranslations('components.typeSelect')

  return (
    <Select
      value={type}
      onValueChange={value => onSelectChange(value as PeriodType)}
      disabled={disabled}
    >
      <SelectTrigger className="w-[180px] bg-zinc-50 dark:bg-zinc-800">
        <SelectValue placeholder={t('placeholder')} />
      </SelectTrigger>
      <SelectContent className="bg-zinc-50 dark:bg-zinc-800">
        <SelectItem value="day" className="dark:hover:bg-zinc-700 dark:data-highlighted:bg-zinc-700">
          {t('day')}
        </SelectItem>
        <SelectItem value="month" className="dark:hover:bg-zinc-700 dark:data-highlighted:bg-zinc-700">
          {t('month')}
        </SelectItem>
        <SelectItem value="year" className="dark:hover:bg-zinc-700 dark:data-highlighted:bg-zinc-700">
          {t('year')}
        </SelectItem>
        <SelectItem value="all" className="dark:hover:bg-zinc-700 dark:data-highlighted:bg-zinc-700">
          {t('all')}
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
