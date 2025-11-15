'use client'

import { useState, useEffect } from 'react'

import { format } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  date: Date
  onDateChange: (date: Date) => void
}

const localeMap = {
  en: enUS,
  zh: zhCN,
}

function getUtcToday() {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

export function DatePicker({ date: externalDate, onDateChange }: DatePickerProps) {
  const [internalDate, setInternalDate] = useState<Date>(externalDate)
  const todayUtc = getUtcToday()
  // 设置初始月份为当前日期或选中日期
  const [month, setMonth] = useState<Date>(() => externalDate)
  const t = useTranslations('components.datePicker')
  const locale = useLocale() as 'en' | 'zh'

  // 同步外部状态
  useEffect(() => {
    setInternalDate(externalDate)
    setMonth(externalDate)
  }, [externalDate])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[280px] justify-start text-left font-normal bg-zinc-50 dark:bg-zinc-800',
            !internalDate && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {internalDate ? format(internalDate, 'PPP', { locale: localeMap[locale] }) : <span>{t('selectDate')}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto bg-zinc-50 p-0 dark:bg-zinc-800"
        side="bottom"
        align="start"
      >
        <Calendar
          mode="single"
          selected={internalDate}
          captionLayout="dropdown"
          required={true} // 防止取消点击传输 undefined 日期
          onSelect={(newDate) => {
            if (newDate && newDate <= todayUtc) {
              setInternalDate(newDate)
              setMonth(newDate) // 同步更新月份显示
              onDateChange(newDate as Date)
            }
          }}
          month={month}
          onMonthChange={setMonth}
          startMonth={new Date(2023, 10, 15)} // 2023-11-15
          endMonth={todayUtc}
          disabled={{ after: todayUtc }}
          locale={localeMap[locale]}
          fixedWeeks
        />
      </PopoverContent>
    </Popover>
  )
}
