'use client'

import React, { useState } from 'react'

import { Table } from '@tanstack/react-table'
import { Settings, Filter } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { VirtualizedFilterList } from '@/components/virtualized-filter-list'

type TagFilterMode = 'or' | 'and'

interface TableHeaderControlsProps<TData> {
  table: Table<TData>
  selectedTags: Set<string>
  extractedTags: string[]
  tagFilterMode: TagFilterMode
  onSelectedTagsChange: (tags: Set<string>) => void
  onTagFilterModeChange: (mode: TagFilterMode) => void
  selectedTypes: Set<string>
  extractedTypes: string[]
  onSelectedTypesChange: (types: Set<string>) => void
}

export function TableHeaderControls<TData>({
  table,
  selectedTags,
  extractedTags,
  tagFilterMode,
  onSelectedTagsChange,
  onTagFilterModeChange,
  selectedTypes,
  extractedTypes,
  onSelectedTypesChange,
}: TableHeaderControlsProps<TData>) {
  const t = useTranslations('components.dataTable')

  // Popover 打开状态
  const [typePopoverOpen, setTypePopoverOpen] = useState(false)
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false)

  return (
    <div className="mb-4 flex items-center justify-end">
      <div className="flex items-center gap-2">
        {/* OR/AND 模式切换（紧凑分段按钮） */}
        <div className="inline-flex rounded-md border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
          <HoverCard openDelay={80} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Button
                variant={tagFilterMode === 'or' ? 'default' : 'ghost'}
                size="sm"
                className={`h-9 px-3 text-sm ${tagFilterMode === 'or' ? '' : 'text-zinc-700 dark:text-zinc-300'}`}
                onClick={() => onTagFilterModeChange('or')}
                aria-pressed={tagFilterMode === 'or'}
                aria-label={t('matchAnyHint')}
              >
                {t('matchAnyShort')}
              </Button>
            </HoverCardTrigger>
            <HoverCardContent
              side="bottom"
              align="start"
              sideOffset={6}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs leading-tight text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {t('matchAnyHint')}
            </HoverCardContent>
          </HoverCard>
          <HoverCard openDelay={80} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Button
                variant={tagFilterMode === 'and' ? 'default' : 'ghost'}
                size="sm"
                className={`h-9 px-3 text-sm ${tagFilterMode === 'and' ? '' : 'text-zinc-700 dark:text-zinc-300'}`}
                onClick={() => onTagFilterModeChange('and')}
                aria-pressed={tagFilterMode === 'and'}
                aria-label={t('matchAllHint')}
              >
                {t('matchAllShort')}
              </Button>
            </HoverCardTrigger>
            <HoverCardContent
              side="bottom"
              align="start"
              sideOffset={6}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs leading-tight text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {t('matchAllHint')}
            </HoverCardContent>
          </HoverCard>
        </div>

        {/* 类型筛选器 */}
        <Popover open={typePopoverOpen} onOpenChange={setTypePopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="bg-zinc-50 dark:bg-zinc-800"
            >
              <Filter className="mr-2 h-4 w-4" />
              {t('typeFilter')}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[300px] bg-zinc-50 dark:bg-zinc-800">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium leading-none text-zinc-900 dark:text-zinc-100">
                  {t('typeFilter')}
                </h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectedTypesChange(new Set(extractedTypes))}
                    className="h-6 text-xs"
                  >
                    {t('selectAll')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectedTypesChange(new Set())}
                    className="h-6 text-xs"
                  >
                    {t('clear')}
                  </Button>
                </div>
              </div>

              <VirtualizedFilterList
                items={extractedTypes}
                selectedItems={selectedTypes}
                onSelectionChange={onSelectedTypesChange}
                idPrefix="type"
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* 标签筛选器 */}
        <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="bg-zinc-50 dark:bg-zinc-800"
            >
              <Filter className="mr-2 h-4 w-4" />
              {t('tagFilter')}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[300px] bg-zinc-50 dark:bg-zinc-800">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium leading-none text-zinc-900 dark:text-zinc-100">
                  {t('tagFilter')}
                </h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectedTagsChange(new Set(extractedTags))}
                    className="h-6 text-xs"
                  >
                    {t('selectAll')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectedTagsChange(new Set())}
                    className="h-6 text-xs"
                  >
                    {t('clear')}
                  </Button>
                </div>
              </div>

              <VirtualizedFilterList
                items={extractedTags}
                selectedItems={selectedTags}
                onSelectionChange={onSelectedTagsChange}
                idPrefix="tag"
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* 列设置 */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="bg-zinc-50 dark:bg-zinc-800"
            >
              <Settings className="mr-2 h-4 w-4" />
              {t('columns')}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[200px] bg-zinc-50 dark:bg-zinc-800">
            <div className="space-y-2">
              <h4 className="font-medium leading-none text-zinc-900 dark:text-zinc-100">
                {t('toggleColumns')}
              </h4>
              <div className="space-y-2">
                {table.getAllColumns().filter(column => column.getCanHide()).map(column => (
                  <div key={column.id} className="flex items-center space-x-2">
                    <Switch
                      id={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={value => column.toggleVisibility(!!value)}
                      className="data-[state=checked]:bg-zinc-900 dark:data-[state=checked]:bg-zinc-100"
                    />
                    <label
                      htmlFor={column.id}
                      className="text-sm font-normal text-zinc-700 dark:text-zinc-300 cursor-pointer"
                    >
                      {t(`headers.${column.id}`) || column.id}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
