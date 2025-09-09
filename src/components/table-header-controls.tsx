'use client'

import React from 'react'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card'
import { Checkbox } from '@/components/ui/checkbox'
import { Settings, Filter } from 'lucide-react'
import { Language } from '@/lib/types'

type TagFilterMode = 'or' | 'and'

interface TableHeaderControlsProps<TData> {
  table: Table<TData>
  language: Language
  selectedTags: Set<string>
  extractedTags: string[]
  tagFilterMode: TagFilterMode
  onSelectedTagsChange: (tags: Set<string>) => void
  onTagFilterModeChange: (mode: TagFilterMode) => void
}

const CONTENT = {
  en: {
    headers: {
      rank: 'Rank',
      gallery_id: 'ID',
      gallery_name: 'Name',
      gallery_type: 'Type',
      tags: 'Tags',
      published_time: 'Published Date',
      uploader: 'Uploader',
      gallery_length: 'Length',
      points: 'Points',
      preview_url: 'Preview',
      gallery_url: 'URL',
      torrents_url: 'Torrents',
    },
    columns: 'Columns',
    toggleColumns: 'Toggle columns',
    tagFilter: 'Tag Filter',
    selectAllTags: 'Select All',
    deselectAllTags: 'Deselect All',
    tagsSelected: 'tags selected',
    matchAnyShort: 'Union',
    matchAllShort: 'Intersection',
    matchAnyHint: 'Union: show rows that match any selected tag',
    matchAllHint: 'Intersection: show rows that match all selected tags',
  },
  zh: {
    headers: {
      rank: '排名',
      gallery_id: 'ID',
      gallery_name: '名称',
      gallery_type: '类型',
      tags: '标签',
      published_time: '上传日期',
      uploader: '上传者',
      gallery_length: '长度',
      points: '积分',
      preview_url: '预览图',
      gallery_url: '链接',
      torrents_url: '种子',
    },
    columns: '列设置',
    toggleColumns: '选择显示的列',
    tagFilter: '标签筛选',
    selectAllTags: '全选',
    deselectAllTags: '全不选',
    tagsSelected: '个标签已选择',
    matchAnyShort: '并集',
    matchAllShort: '交集',
    matchAnyHint: '并集：命中任意选中标签即显示',
    matchAllHint: '交集：必须包含全部选中标签才显示',
  },
} as const

export function TableHeaderControls<TData>({
  table,
  language,
  selectedTags,
  extractedTags,
  tagFilterMode,
  onSelectedTagsChange,
  onTagFilterModeChange,
}: TableHeaderControlsProps<TData>) {
  const content = CONTENT[language]

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
                aria-label={content.matchAnyHint}
              >
                {content.matchAnyShort}
              </Button>
            </HoverCardTrigger>
            <HoverCardContent
              side="bottom"
              align="start"
              sideOffset={6}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs leading-tight text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {content.matchAnyHint}
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
                aria-label={content.matchAllHint}
              >
                {content.matchAllShort}
              </Button>
            </HoverCardTrigger>
            <HoverCardContent
              side="bottom"
              align="start"
              sideOffset={6}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs leading-tight text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {content.matchAllHint}
            </HoverCardContent>
          </HoverCard>
        </div>

        {/* 标签筛选器 */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="bg-zinc-50 dark:bg-zinc-800"
            >
              <Filter className="mr-2 h-4 w-4" />
              {content.tagFilter}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[300px] bg-zinc-50 dark:bg-zinc-800 max-h-[400px] overflow-y-auto">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium leading-none text-zinc-900 dark:text-zinc-100">
                  {content.tagFilter}
                </h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectedTagsChange(new Set(extractedTags))}
                    className="h-6 text-xs"
                  >
                    {content.selectAllTags}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectedTagsChange(new Set())}
                    className="h-6 text-xs"
                  >
                    {content.deselectAllTags}
                  </Button>
                </div>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {extractedTags.map(tag => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={selectedTags.has(tag)}
                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                        const newSelectedTags = new Set(selectedTags)
                        if (checked === true) {
                          newSelectedTags.add(tag)
                        }
                        else {
                          newSelectedTags.delete(tag)
                        }
                        onSelectedTagsChange(newSelectedTags)
                      }}
                    />
                    <label
                      htmlFor={`tag-${tag}`}
                      className="text-sm font-normal text-zinc-700 dark:text-zinc-300 cursor-pointer flex-1"
                    >
                      {tag}
                    </label>
                  </div>
                ))}
              </div>
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
              {content.columns}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[200px] bg-zinc-50 dark:bg-zinc-800">
            <div className="space-y-2">
              <h4 className="font-medium leading-none text-zinc-900 dark:text-zinc-100">
                {content.toggleColumns}
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
                      {content.headers[column.id as keyof typeof content.headers]}
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
