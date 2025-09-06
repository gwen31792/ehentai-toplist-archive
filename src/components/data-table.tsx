'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
  VisibilityState,
  ColumnSizingState,
  ColumnFiltersState,
} from '@tanstack/react-table'
import Link from 'next/link'
import Image from 'next/image'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card'
import { Language, QueryResponseItem } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'
import { ImageWithSkeleton } from '@/components/image-with-skeleton'
import { TablePagination } from '@/components/table-pagination'
import { TableHeaderControls } from '@/components/table-header-controls'

interface DataTableProps {
  data: QueryResponseItem[]
  language: Language
  loading: boolean
}

// 隐藏图片预加载组件
const PreloadImage = ({ src }: { src: string }) => {
  return (
    <div className="pointer-events-none absolute opacity-0" style={{ width: 0, height: 0, overflow: 'hidden' }}>
      <Image
        src={src}
        alt="预加载图片"
        width={0}
        height={0}
        style={{ 
          width: '100%', 
          height: 'auto',
        }}
        sizes='100vw'
        quality={100}
        className='m-0'
      />
    </div>
  )
}

const columnHelper = createColumnHelper<QueryResponseItem>()
const allowedPageSizes = [10, 20, 50, 100]

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
    itemsPerPage: 'Items per page',
    page: 'Page',
    of: 'of',
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
    itemsPerPage: '每页项目数',
    page: '页',
    of: '/',
  },
} as const

export function DataTable({ data, language, loading }: DataTableProps) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [allTags, setAllTags] = useState<string[]>([])
  type TagFilterMode = 'or' | 'and'
  const [tagFilterMode, setTagFilterMode] = useState<TagFilterMode>('or')
  
  // 基于语言进行 memo，保持引用稳定
  const content = useMemo(() => CONTENT[language], [language])
  // 对数据引用进行 memo
  const memoData = useMemo(() => data, [data])
  
  // 提取所有唯一标签
  const extractedTags = useMemo(() => {
    const tagSet = new Set<string>()
    data.forEach(item => {
      if (item.tags) {
  item.tags.split(/\s*,\s*/).forEach(tag => {
          if (tag.trim()) {
            tagSet.add(tag.trim())
          }
        })
      }
    })
    return Array.from(tagSet).sort()
  }, [data])
  
  // 初始化标签状态
  useEffect(() => {
    setAllTags(extractedTags)
    if (extractedTags.length > 0 && selectedTags.size === 0) {
      setSelectedTags(new Set(extractedTags))
    }
  }, [extractedTags])
  
  // 更新列过滤器（加入模式与全选状态，切换 OR/AND/全选都会触发重算）
  useEffect(() => {
    setColumnFilters([
      {
        id: 'tags',
        value: {
          values: Array.from(selectedTags),
    allSelected: selectedTags.size > 0 && selectedTags.size === extractedTags.length,
          mode: tagFilterMode,
        },
      },
    ])
  }, [selectedTags, tagFilterMode, extractedTags.length])
  // 数据变化时重置页码，避免跨数据集残留页码
  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [memoData])
  
  // 初始化列宽
  useEffect(() => {
    const savedSizing = localStorage.getItem('table-column-sizing')
    if (savedSizing) {
      try {
        setColumnSizing(JSON.parse(savedSizing))
      } catch {
        console.warn('Failed to parse saved column sizing')
      }
    }
  }, [])

  // 持久化列宽
  const saveColumnSizing = useDebouncedCallback((sizing: ColumnSizingState) => {
    try {
      localStorage.setItem('table-column-sizing', JSON.stringify(sizing))
    } catch {
      console.warn('Failed to save column sizing')
    }
  }, 200)

  useEffect(() => {
    if (Object.keys(columnSizing).length === 0) return
    saveColumnSizing(columnSizing)
  }, [columnSizing, saveColumnSizing])

  // 初始化：列可见性
  useEffect(() => {
    const saved = localStorage.getItem('table-column-visibility')
    if (saved) {
      try {
        setColumnVisibility(JSON.parse(saved))
      } catch {
        console.warn('Failed to parse saved column visibility')
      }
    } else {
      // 设置默认显示的列：排名、预览图、名称、标签
      const defaultVisibility: VisibilityState = {
        rank: true,
        gallery_id: false,
        preview_url: true,
        gallery_name: true,
        gallery_type: false,
        tags: true,
        published_time: false,
        uploader: false,
        gallery_length: false,
        points: false,
        torrents_url: false,
      }
      setColumnVisibility(defaultVisibility)
    }
  }, [])

  // 持久化：列可见性
  const saveColumnVisibility = useDebouncedCallback((visibility: VisibilityState) => {
    try {
      localStorage.setItem('table-column-visibility', JSON.stringify(visibility))
    } catch {
      console.warn('Failed to save column visibility')
    }
  }, 200)

  useEffect(() => {
    if (Object.keys(columnVisibility).length === 0) return
    saveColumnVisibility(columnVisibility)
  }, [columnVisibility, saveColumnVisibility])

  // 初始化：每页条数
  useEffect(() => {
    const saved = localStorage.getItem('table-page-size')
    if (!saved) return
    const parsed = Number(saved)
    if (!Number.isNaN(parsed) && allowedPageSizes.includes(parsed)) {
      setPagination(p => ({ ...p, pageSize: parsed }))
    }
  }, [])

  // 持久化：每页条数
  const savePageSize = useDebouncedCallback((pageSize: number) => {
    try {
      localStorage.setItem('table-page-size', String(pageSize))
    } catch {
      console.warn('Failed to save page size')
    }
  }, 200)

  useEffect(() => {
    savePageSize(pagination.pageSize)
  }, [pagination.pageSize, savePageSize])

  // 初始化与持久化：标签筛选模式（OR/AND），默认 OR
  useEffect(() => {
    const saved = localStorage.getItem('table-tag-filter-mode')
    if (saved === 'or' || saved === 'and') {
      setTagFilterMode(saved)
    }
  }, [])

  const saveTagFilterMode = useDebouncedCallback((mode: TagFilterMode) => {
    try {
      localStorage.setItem('table-tag-filter-mode', mode)
    } catch {
      console.warn('Failed to save tag filter mode')
    }
  }, 200)

  useEffect(() => {
    saveTagFilterMode(tagFilterMode)
  }, [tagFilterMode, saveTagFilterMode])

  const CellWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="whitespace-normal break-words text-sm">
      {children}
    </div>
  )

  const columns = useMemo(() => ([
    columnHelper.accessor('rank', {
      header: () => content.headers.rank,
      cell: info => <CellWrapper>{info.getValue()}</CellWrapper>,
      size: 80,
    }),
    columnHelper.accessor('gallery_id', {
      header: () => content.headers.gallery_id,
      cell: info => <CellWrapper>{info.getValue()}</CellWrapper>,
      size: 100,
    }),
    columnHelper.accessor('preview_url', {
      header: () => content.headers.preview_url,
      cell: info => (
        <CellWrapper>
          <div className="w-full">
            <ImageWithSkeleton
              src={info.getValue()}
              alt="预览图"
              className="w-full rounded"
            />
          </div>
        </CellWrapper>
      ),
      size: 120,
    }),
    columnHelper.accessor('gallery_name', {
      header: () => content.headers.gallery_name,
      cell: info => {
        const isPreviewColumnVisible = info.table.getColumn('preview_url')?.getIsVisible() ?? true
        const previewUrl = info.row.original.preview_url
        
        if (isPreviewColumnVisible || !previewUrl) {
          return (
            <CellWrapper>
              <Link 
                href={info.row.original.gallery_url} 
                target="_blank" 
                rel="noopener noreferrer" 
              >
                {info.getValue()}
              </Link>
            </CellWrapper>
          )
        }
        
        return (
          <CellWrapper>
            <HoverCard openDelay={50} closeDelay={100}>
              <HoverCardTrigger asChild>
                <div className="w-full">
                  <Link 
                    href={info.row.original.gallery_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block w-full break-words"
                  >
                    {info.getValue()}
                  </Link>
                  <PreloadImage src={previewUrl} />
                </div>
              </HoverCardTrigger>
              <HoverCardContent side='left' className="p-1">
                <ImageWithSkeleton 
                  src={previewUrl} 
                  alt={info.getValue()} 
                />
              </HoverCardContent>
            </HoverCard>
          </CellWrapper>
        )
      },
      size: 250,
    }),
    columnHelper.accessor('gallery_type', {
      header: () => content.headers.gallery_type,
      cell: info => <CellWrapper>{info.getValue()}</CellWrapper>,
      size: 100,
    }),
    columnHelper.accessor('tags', {
      header: () => content.headers.tags,
      cell: info => <CellWrapper>{info.getValue()}</CellWrapper>,
      size: 300,
      filterFn: (row, columnId, filterValue: { values: string[]; allSelected: boolean; mode: 'or' | 'and' }) => {
        const tags = row.getValue(columnId) as string
        if (!tags) return false

        const itemTags = tags
          .split(/\s*,\s*/)
          .map(tag => tag.trim())
          .filter(tag => tag)

        const selected = new Set(filterValue.values)

        // 全选：显示所有行；空选：不显示任何行
        if (filterValue.allSelected) return true
        if (selected.size === 0) return false

        if (filterValue.mode === 'or') {
          // 这一行的标签里，有任意一个被选中就展示这一行
          for (const t of itemTags) {
            if (selected.has(t)) return true
          }
          return false
        }
        // AND：这一行的标签里，全部被选中才展示这一行
        for (const t of itemTags) {
          if (!selected.has(t)) return false
        }
        return true
      },
    }),
    columnHelper.accessor('published_time', {
      header: () => content.headers.published_time,
      cell: info => <CellWrapper>{info.getValue()}</CellWrapper>,
      size: 120,
    }),
    columnHelper.accessor('uploader', {
      header: () => content.headers.uploader,
      cell: info => <CellWrapper>{info.getValue()}</CellWrapper>,
      size: 120,
    }),
    columnHelper.accessor('gallery_length', {
      header: () => content.headers.gallery_length,
      cell: info => <CellWrapper>{info.getValue()}</CellWrapper>,
      size: 80,
    }),
    columnHelper.accessor('points', {
      header: () => content.headers.points,
      cell: info => <CellWrapper>{info.getValue()}</CellWrapper>,
      size: 80,
    }),
    columnHelper.accessor('torrents_url', {
      header: () => content.headers.torrents_url,
      cell: info => (
        <CellWrapper>
          {info.getValue() ? (
            <Link 
              href={info.getValue()} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="link-hover-underline text-blue-600 dark:text-blue-400"
            >
              {content.headers.torrents_url}
            </Link>
          ) : '-'}
        </CellWrapper>
      ),
      size: 80,
    }),
  ]), [content])

  const table = useReactTable({
    data: memoData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onColumnFiltersChange: setColumnFilters,
    columnResizeMode: 'onChange',
    state: {
      pagination,
      columnVisibility,
      columnSizing,
      columnFilters,
    },
    manualPagination: false,
  })

  const SkeletonRow = () => (
    <TableRow>
      {table.getVisibleLeafColumns().map((col) => (
        <TableCell key={col.id}>
          <Skeleton className="h-4 w-full bg-zinc-200 dark:bg-zinc-800" />
        </TableCell>
      ))}
    </TableRow>
  )

  return (
    <div className="mx-auto mt-8 w-full max-w-[95%]">
      <TableHeaderControls
        table={table}
        language={language}
        selectedTags={selectedTags}
        allTags={allTags}
        tagFilterMode={tagFilterMode}
        onSelectedTagsChange={setSelectedTags}
        onTagFilterModeChange={setTagFilterMode}
      />
      
      <div className="w-full overflow-x-auto">
        <Table className="w-full" style={{ tableLayout: 'fixed' }}>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead 
                    key={header.id} 
                    className="whitespace-nowrap relative select-none"
                    style={{
                      width: header.getSize(),
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </span>
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`absolute right-0 top-0 h-full w-2 cursor-col-resize bg-transparent hover:bg-blue-500 transition-colors ${
                            header.column.getIsResizing() ? 'bg-blue-500' : ''
                          } z-10`}
                          style={{
                            userSelect: 'none',
                            transform: 'translateX(50%)',
                          }}
                        />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : table.getFilteredRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-24 text-center">
                  {language === 'zh' ? '无数据，请换个日期再试' : 'No data, please try another date'}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="dark:hover:bg-zinc-700">
                  {row.getVisibleCells().map(cell => (
                    <TableCell 
                      key={cell.id} 
                      className="align-top py-2"
                      style={{
                        width: cell.column.getSize(),
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <TablePagination<QueryResponseItem> 
        table={table} 
        content={{
          itemsPerPage: content.itemsPerPage,
          page: content.page,
          of: content.of,
  }} 
  allowedPageSizes={allowedPageSizes}
      />
    </div>
  )
}