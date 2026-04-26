'use client'

import { useState } from 'react'

import { format } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { useLocale } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const localeMap = {
  en: enUS,
  zh: zhCN,
}

type DatePickerLocale = keyof typeof localeMap

interface DatePickerProps {
  dateString: string
  onDateChange: (dateString: string) => void
  disabled?: boolean
}

function getUtcTodayString() {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function toCalendarDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function toDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function DatePicker({
  dateString,
  onDateChange,
  disabled = false,
}: DatePickerProps) {
  const locale = useLocale() as DatePickerLocale
  const [open, setOpen] = useState(false)
  const today = toCalendarDate(getUtcTodayString())
  const selectedDate = toCalendarDate(dateString)
  // 设置初始月份为当前日期或选中日期
  const [month, setMonth] = useState<Date>(() => selectedDate)
  const datePickerLocale = localeMap[locale] ?? localeMap.en
  const formattedDate = format(selectedDate, 'PPP', { locale: datePickerLocale })

  const handleOpenChange = (nextOpen: boolean) => {
    if (disabled || !nextOpen) {
      setOpen(false)
      return
    }

    setMonth(selectedDate)
    setOpen(true)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[280px] justify-start bg-zinc-50 text-left font-normal dark:bg-zinc-800"
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 size-4" />
          {formattedDate}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto bg-zinc-50 p-0 dark:bg-zinc-800"
        side="bottom"
        align="start"
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          captionLayout="dropdown"
          required={true} // 防止取消点击传输 undefined 日期
          onSelect={(newDate) => {
            if (!disabled && newDate && newDate <= today) {
              setMonth(newDate) // 同步更新月份显示
              setOpen(false)
              onDateChange(toDateString(newDate))
            }
          }}
          month={month}
          onMonthChange={setMonth}
          startMonth={new Date(2023, 10, 15)} // 2023-11-15
          endMonth={today}
          disabled={[
            { after: today },
            { before: new Date(2023, 10, 15) },
          ]}
          locale={datePickerLocale}
          fixedWeeks
        />
      </PopoverContent>
    </Popover>
  )
}
