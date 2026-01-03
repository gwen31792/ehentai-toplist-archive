'use client'

import { useState, useEffect, useMemo } from 'react'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'

import { type PeriodType } from '@ehentai-toplist-archive/db'
import { format } from 'date-fns'

import { DataTable } from '@/components/data-table'
import { DatePicker } from '@/components/date-picker'
import { TypeSelect } from '@/components/type-select'
import { QueryResponseItem } from '@/lib/types'
import { parseDate, validateDateRange, validatePeriodType } from '@/lib/url-params'

function getUtcToday(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

export function ToplistContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // 从 URL 读取并验证参数，无效则用默认值
  const { selectedDate, selectedType } = useMemo(() => {
    const dateParam = searchParams.get('date')
    const parsed = parseDate(dateParam)
    const date = validateDateRange(parsed) ? parsed : getUtcToday()

    const typeParam = searchParams.get('period_type')
    const type = validatePeriodType(typeParam)

    return { selectedDate: date, selectedType: type }
  }, [searchParams])

  // 数据获取
  const [data, setData] = useState<QueryResponseItem[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function func() {
      setLoading(true)
      const dateString = format(selectedDate, 'yyyy-MM-dd')
      const res = await fetch(`/api/data?list_date=${dateString}&period_type=${selectedType}`, {
        cache: 'force-cache',
      })
      setData(await res.json())
      setLoading(false)
    }
    func()
  }, [selectedDate, selectedType])

  // 更新 URL 的函数
  const updateURL = (newDate: Date, newType: PeriodType) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('date', format(newDate, 'yyyy-MM-dd'))
    params.set('period_type', newType)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // DatePicker 和 TypeSelect 的回调
  const handleDateChange = (date: Date) => {
    updateURL(date, selectedType)
  }

  const handleTypeChange = (type: PeriodType) => {
    updateURL(selectedDate, type)
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex space-x-4">
        <DatePicker date={selectedDate} onDateChange={handleDateChange} />
        <TypeSelect type={selectedType} onSelectChange={handleTypeChange} />
      </div>
      <div className="w-full space-y-12">
        <div className="w-full">
          <DataTable data={data} loading={loading} />
        </div>
      </div>
    </div>
  )
}
