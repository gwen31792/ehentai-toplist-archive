'use client'

// 首页顶部的排行榜查询控件：负责日期/周期切换、URL 参数同步和结果更新中的提示。

import { useOptimistic, useTransition } from 'react'

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
  // 乐观值只在导航期间保留；导航完成或前进/返回时，直接使用 server 传入的参数。
  const [currentDateString, setCurrentDateString] = useOptimistic(selectedDateString)
  const [currentType, setCurrentType] = useOptimistic(selectedType)

  // 这里不直接拉数据，只更新 URL，让 page.tsx 重新走 server 查询。
  const updateURL = (newDateString: string, newType: PeriodType) => {
    const params = new URLSearchParams(searchParamsString)
    params.set('date', newDateString)
    params.set('period_type', newType)

    const nextSearchParamsString = params.toString()
    if (nextSearchParamsString === searchParamsString) {
      return
    }

    startTransition(() => {
      setCurrentDateString(newDateString)
      setCurrentType(newType)
      router.push(`${pathname}?${nextSearchParamsString}`, { scroll: false })
    })
  }

  const handleDateChange = (dateString: string) => {
    updateURL(dateString, currentType)
  }

  const handleTypeChange = (type: PeriodType) => {
    updateURL(currentDateString, type)
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
