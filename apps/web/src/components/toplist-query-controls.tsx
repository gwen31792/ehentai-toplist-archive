'use client'

// 首页顶部的排行榜查询控件：负责日期/周期切换、URL 参数同步和结果更新中的提示。

import { useEffect, useState, useTransition } from 'react'

import { usePathname, useRouter } from 'next/navigation'

import { useTranslations } from 'next-intl'

import { DatePicker } from '@/components/date-picker'
import { PendingStatusBadge } from '@/components/pending-status-badge'
import { TypeSelect } from '@/components/type-select'
import { type PeriodType } from '@/lib/types'
import { cn } from '@/lib/utils'

export interface ToplistQueryControlsProps {
  selectedDateString: string
  selectedType: PeriodType
  searchParamsString: string
}

export function ToplistQueryControls({
  selectedDateString,
  selectedType,
  searchParamsString,
}: ToplistQueryControlsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const pendingStatusT = useTranslations('components.pendingStatus')
  const [isPending, startTransition] = useTransition()
  const [currentDateString, setCurrentDateString] = useState(selectedDateString)
  const [currentType, setCurrentType] = useState<PeriodType>(selectedType)

  // server 返回新参数后，用它覆盖本地的乐观值，避免控件长期漂移。
  useEffect(() => {
    setCurrentDateString(selectedDateString)
  }, [selectedDateString])

  useEffect(() => {
    setCurrentType(selectedType)
  }, [selectedType])

  // 这里不直接拉数据，只更新 URL，让 page.tsx 重新走 server 查询。
  const updateURL = (newDateString: string, newType: PeriodType) => {
    const params = new URLSearchParams(searchParamsString)
    params.set('date', newDateString)
    params.set('period_type', newType)

    const nextSearchParamsString = params.toString()
    if (nextSearchParamsString === searchParamsString) {
      return false
    }

    startTransition(() => {
      router.push(`${pathname}?${nextSearchParamsString}`, { scroll: false })
    })

    return true
  }

  const handleDateChange = (dateString: string) => {
    if (!updateURL(dateString, currentType)) {
      return
    }

    setCurrentDateString(dateString)
  }

  const handleTypeChange = (type: PeriodType) => {
    if (!updateURL(currentDateString, type)) {
      return
    }

    setCurrentType(type)
  }

  return (
    <div className="relative flex w-full flex-col items-center">
      <div
        className={cn(
          'flex flex-wrap justify-center gap-4 transition-opacity',
          isPending && 'opacity-75',
        )}
      >
        <DatePicker
          key={isPending ? 'pending' : 'ready'}
          dateString={currentDateString}
          onDateChange={handleDateChange}
          disabled={isPending}
        />
        <TypeSelect
          type={currentType}
          onSelectChange={handleTypeChange}
          disabled={isPending}
        />
      </div>
      {/* pending 提示做成浮层，idle 时完全不占位，避免查询控件和表格之间留白。 */}
      <PendingStatusBadge show={isPending} text={pendingStatusT('updatingResults')} />
    </div>
  )
}
