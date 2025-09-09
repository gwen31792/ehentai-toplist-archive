'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { zhCN, enUS } from 'date-fns/locale'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Language } from '@/lib/types'

interface DatePickerProps {
  onDateChange: (date: Date) => void
  language: Language
}

const localeMap = {
  en: enUS,
  zh: zhCN,
}

export function DatePicker({ onDateChange, language }: DatePickerProps) {
  const [date, setDate] = useState<Date>()
  // 设置初始月份为当前日期或选中日期
  const [month, setMonth] = useState<Date>(date || new Date())
  const dateText = {
    en: 'Pick a date',
    zh: '选择日期',
  }

  // 当选择日期变化时，同步更新月份显示
  useEffect(() => {
    if (date) {
      setMonth(date)
    }
  }, [date])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[280px] justify-start text-left font-normal bg-zinc-50 dark:bg-zinc-800',
            !date && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {date ? format(date, 'PPP', { locale: localeMap[language] }) : <span>{dateText[language]}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto bg-zinc-50 p-0 dark:bg-zinc-800"
        side="bottom"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          captionLayout="dropdown"
          required={true} // 防止取消点击传输 undefined 日期
          onSelect={(newDate) => {
            if (newDate) {
              setDate(newDate)
              setMonth(newDate) // 同步更新月份显示
              onDateChange(newDate as Date)
            }
          }}
          month={month}
          onMonthChange={setMonth}
          startMonth={new Date(2023, 10, 15)} // 2023-11-15
          endMonth={new Date()}
          fixedWeeks
          language={language}
        />
      </PopoverContent>
    </Popover>
  )
}
