'use client'

import { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { zhCN, enUS } from 'date-fns/locale'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Matcher } from 'react-day-picker'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Language } from '@/lib/types'

interface DatePickerProps {
    onDateChange: (date: Date) => void,
    language: Language
}

const localeMap = {
  en: enUS,
  zh: zhCN,
};

export function DatePicker({ onDateChange, language }: DatePickerProps) {
  const [date, setDate] = useState<Date>()
  // 设置初始月份为当前日期或选中日期
  const [month, setMonth] = useState<Date>(date || new Date())
  const dateText = {
    en: 'Pick a date',
    zh: '选择日期',
  };

  // 当选择日期变化时，同步更新月份显示
  useEffect(() => {
    if (date) {
      setMonth(date);
    }
  }, [date]);

  // 禁止查看没有数据的日期
  const disabledDays: Matcher = {
    // 禁止 2023-11-15 之前的日期
    before: new Date(2023, 10, 15),
    after: new Date(),
  }

  const [isDarkMode, setIsDarkMode] = useState(false)
  // 监听主题变化
  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'))
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'))
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  const calendarStyles = useMemo(() => ({
    disabled: { opacity: 0.5, cursor: 'not-allowed' },
    selected: {
      backgroundColor: isDarkMode ? 'rgb(82 82 91)' : 'rgb(82 82 91)', // zinc-600 : zinc-400
      color: 'white',
    },
    // 因为已经把不能选择的日期 disable 了，今天就是最后一个可选的日期，所以这里不需要再设置
    // today: {
    //     backgroundColor: isDarkMode ? 'rgb(63 63 70)' : 'rgb(212 212 216)',// zinc-700 : zinc-300
    //     color: isDarkMode ? 'white' : 'black',
    // },
  }), [isDarkMode])


  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline-solid'}
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
        align="start">
        <Calendar
          mode="single"
          selected={date}
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
          modifiers={{ disabled: disabledDays }}
          modifiersStyles={calendarStyles}
          initialFocus
          fixedWeeks
          language={language}
        />
      </PopoverContent>
    </Popover>
  )
}

