'use client'

import React, { useMemo, useState } from 'react'

import { Table, VisibilityState } from '@tanstack/react-table'
import { Filter, Search, Settings, Tags, X } from 'lucide-react'
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
import {
  getSelectedCurrentTagCount,
  prioritizeSelectedTags,
} from '@/lib/table-tag-selection'
import { cn } from '@/lib/utils'

type TagFilterMode = 'or' | 'and'

interface TableHeaderControlsProps<TData> {
  table: Table<TData>
  columnVisibility: VisibilityState
  selectedTags: Set<string>
  extractedTags: string[]
  tagFilterMode: TagFilterMode
  preserveTagSelection: boolean
  onSelectedTagsChange: (tags: Set<string>) => void
  onTagFilterModeChange: (mode: TagFilterMode) => void
  onPreserveTagSelectionChange: (preserve: boolean) => void
  selectedTypes: Set<string>
  extractedTypes: string[]
  onSelectedTypesChange: (types: Set<string>) => void
}

export function TableHeaderControls<TData>({
  table,
  columnVisibility,
  selectedTags,
  extractedTags,
  tagFilterMode,
  preserveTagSelection,
  onSelectedTagsChange,
  onTagFilterModeChange,
  onPreserveTagSelectionChange,
  selectedTypes,
  extractedTypes,
  onSelectedTypesChange,
}: TableHeaderControlsProps<TData>) {
  const t = useTranslations('components.dataTable')

  // Popover 打开状态
  const [typePopoverOpen, setTypePopoverOpen] = useState(false)
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false)
  const [tagSearch, setTagSearch] = useState('')

  // 保留标签筛选会带来当前榜单外的标签，这里拆开当前可见选中数和额外保留数用于计数展示。
  const selectedCurrentTagCount = useMemo(() => (
    getSelectedCurrentTagCount(selectedTags, extractedTags)
  ), [extractedTags, selectedTags])
  const missingSelectedTagCount = Math.max(0, selectedTags.size - selectedCurrentTagCount)
  const missingSelectedTagLabel = missingSelectedTagCount > 0
    ? ` +${missingSelectedTagCount}`
    : ''

  // 当前数据存在筛选差异，或有跨数据集保留的缺失标签时，才把筛选数量外显到按钮上。
  const hasActiveTagFilter = missingSelectedTagCount > 0
    || (extractedTags.length > 0 && selectedCurrentTagCount !== extractedTags.length)
  const tagFilterButtonLabel = hasActiveTagFilter
    ? `${t('headers.tags')} ${selectedCurrentTagCount}/${extractedTags.length}${missingSelectedTagLabel}`
    : t('tagFilter')

  // 搜索只缩小标签弹窗中的可见选项，不改变表格实际筛选条件。
  const filteredTags = useMemo(() => {
    const normalizedSearch = tagSearch.trim().toLowerCase()
    if (!normalizedSearch) {
      return extractedTags
    }

    return extractedTags.filter(tag => tag.toLowerCase().includes(normalizedSearch))
  }, [extractedTags, tagSearch])
  const orderedFilteredTags = useMemo(() => (
    prioritizeSelectedTags(filteredTags, selectedTags)
  ), [filteredTags, selectedTags])

  const handleTagPopoverOpenChange = (open: boolean) => {
    setTagPopoverOpen(open)
    if (!open) {
      setTagSearch('')
    }
  }

  return (
    <div className="mb-4 flex items-center justify-end">
      <div className="flex items-center gap-2">
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
        <Popover open={tagPopoverOpen} onOpenChange={handleTagPopoverOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'bg-zinc-50 dark:bg-zinc-800',
                hasActiveTagFilter
                  ? 'border-zinc-400 bg-zinc-100 text-zinc-900 shadow-sm hover:bg-zinc-200 dark:border-zinc-500 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-700/80'
                  : null,
              )}
            >
              <Tags className="mr-2 h-4 w-4" />
              {tagFilterButtonLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[300px] bg-zinc-50 dark:bg-zinc-800">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium leading-none text-zinc-900 dark:text-zinc-100">
                  {t('tagFilter')}
                  <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {selectedCurrentTagCount}
                    /
                    {extractedTags.length}
                    {missingSelectedTagLabel}
                  </span>
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

              <div className="flex items-center justify-between gap-2 px-1">
                <div className="min-w-0">
                  <label
                    htmlFor="preserve-tag-selection"
                    className="block cursor-pointer text-xs font-medium leading-none text-zinc-700 dark:text-zinc-300"
                  >
                    {t('preserveTagSelection')}
                  </label>
                  {missingSelectedTagCount > 0
                    ? (
                        <div className="mt-0.5 text-[11px] leading-none text-zinc-500 dark:text-zinc-400">
                          {t('preservedMissingTags', { count: missingSelectedTagCount })}
                        </div>
                      )
                    : null}
                </div>
                <Switch
                  id="preserve-tag-selection"
                  checked={preserveTagSelection}
                  onCheckedChange={onPreserveTagSelectionChange}
                  className="h-4 w-8 shrink-0 data-[state=checked]:bg-zinc-900 data-[state=checked]:[&>span]:translate-x-4 dark:data-[state=checked]:bg-zinc-100 [&>span]:h-3 [&>span]:w-3"
                />
              </div>

              {/* 标签匹配模式只影响标签筛选，因此放在标签弹窗内部。 */}
              <div className="inline-flex rounded-md border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
                <HoverCard openDelay={80} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <Button
                      variant={tagFilterMode === 'or' ? 'default' : 'ghost'}
                      size="sm"
                      className={`h-7 px-2.5 text-xs ${tagFilterMode === 'or' ? '' : 'text-zinc-700 dark:text-zinc-300'}`}
                      onClick={() => onTagFilterModeChange('or')}
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
                      className={`h-7 px-2.5 text-xs ${tagFilterMode === 'and' ? '' : 'text-zinc-700 dark:text-zinc-300'}`}
                      onClick={() => onTagFilterModeChange('and')}
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

              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                <input
                  type="search"
                  value={tagSearch}
                  onChange={event => setTagSearch(event.target.value)}
                  placeholder={t('tagSearchPlaceholder')}
                  className="h-8 w-full rounded-md border border-input bg-zinc-50 pl-7 pr-8 text-xs text-zinc-900 outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:bg-zinc-800 dark:text-zinc-100 [&::-webkit-search-cancel-button]:appearance-none"
                />
                {tagSearch
                  ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setTagSearch('')}
                        className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )
                  : null}
              </div>

              <VirtualizedFilterList
                items={orderedFilteredTags}
                selectedItems={selectedTags}
                onSelectionChange={onSelectedTagsChange}
                idPrefix="tag"
                emptyMessage={t('noMatchingTags')}
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
                      id={`col-toggle-${column.id}`}
                      checked={columnVisibility[column.id] ?? true}
                      onCheckedChange={value => column.toggleVisibility(!!value)}
                      className="data-[state=checked]:bg-zinc-900 dark:data-[state=checked]:bg-zinc-100"
                    />
                    <label
                      htmlFor={`col-toggle-${column.id}`}
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
