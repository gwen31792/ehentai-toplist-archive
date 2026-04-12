'use client'

import { useEffect, useState, useTransition } from 'react'

import { usePathname, useRouter } from 'next/navigation'

import { type PeriodType } from '@ehentai-toplist-archive/db'
import { format } from 'date-fns'

import { DataTable } from '@/components/data-table'
import { DatePicker } from '@/components/date-picker'
import { TypeSelect } from '@/components/type-select'
import type { QueryResponseItem } from '@/lib/types'
import { parseDate } from '@/lib/url-params'

interface ToplistContentProps {
  initialData: QueryResponseItem[]
  selectedDateString: string
  selectedType: PeriodType
  searchParamsString: string
}

function toSelectedDate(dateString: string): Date {
  return parseDate(dateString) ?? new Date(dateString)
}

export function ToplistContent({
  initialData,
  selectedDateString,
  selectedType,
  searchParamsString,
}: ToplistContentProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [currentDate, setCurrentDate] = useState<Date>(() => toSelectedDate(selectedDateString))
  const [currentType, setCurrentType] = useState<PeriodType>(selectedType)

  useEffect(() => {
    setCurrentDate(toSelectedDate(selectedDateString))
  }, [selectedDateString])

  useEffect(() => {
    setCurrentType(selectedType)
  }, [selectedType])

  // 更新 URL 的函数
  const updateURL = (newDate: Date, newType: PeriodType) => {
    const params = new URLSearchParams(searchParamsString)
    params.set('date', format(newDate, 'yyyy-MM-dd'))
    params.set('period_type', newType)

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  // DatePicker 和 TypeSelect 的回调
  const handleDateChange = (date: Date) => {
    setCurrentDate(date)
    updateURL(date, currentType)
  }

  const handleTypeChange = (type: PeriodType) => {
    setCurrentType(type)
    updateURL(currentDate, type)
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex space-x-4">
        <DatePicker date={currentDate} onDateChange={handleDateChange} />
        <TypeSelect type={currentType} onSelectChange={handleTypeChange} />
      </div>
      <div className="w-full space-y-12">
        <div className="w-full">
          <DataTable
            key={`${selectedDateString}-${selectedType}`}
            data={initialData}
            loading={isPending}
          />
        </div>
      </div>
    </div>
  )
}
