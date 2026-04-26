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

import type enMessages from '../../messages/en.json'
import type zhMessages from '../../messages/zh.json'

type TypeSelectMessageKey = Extract<
  keyof typeof enMessages.components.typeSelect,
  keyof typeof zhMessages.components.typeSelect
>

type PeriodTypeLabelKeyMap = {
  [Type in PeriodType]: Extract<Type, TypeSelectMessageKey>
}

type PeriodTypeOption = {
  value: PeriodType
  labelKey: PeriodType
}

const PERIOD_TYPE_LABEL_KEYS = {
  day: 'day',
  month: 'month',
  year: 'year',
  all: 'all',
} satisfies PeriodTypeLabelKeyMap

const PERIOD_TYPE_OPTIONS = (Object.keys(PERIOD_TYPE_LABEL_KEYS) as PeriodType[]).map(value => ({
  value,
  labelKey: PERIOD_TYPE_LABEL_KEYS[value],
})) satisfies ReadonlyArray<PeriodTypeOption>

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
        {PERIOD_TYPE_OPTIONS.map(option => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="dark:hover:bg-zinc-700 dark:data-highlighted:bg-zinc-700"
          >
            {t(option.labelKey)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
