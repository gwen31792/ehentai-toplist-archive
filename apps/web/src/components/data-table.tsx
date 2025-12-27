'use client'

import React, { useState, useEffect, useMemo } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
  ColumnFiltersState,
} from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { ImageWithSkeleton } from '@/components/image-with-skeleton'
import { TableHeaderControls } from '@/components/table-header-controls'
import { TablePagination } from '@/components/table-pagination'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTableStore } from '@/lib/stores/table-store'
import { QueryResponseItem } from '@/lib/types'

interface DataTableProps {
  data: QueryResponseItem[]
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
        sizes="100vw"
        quality={100}
        className="m-0"
      />
    </div>
  )
}

const columnHelper = createColumnHelper<QueryResponseItem>()

export function DataTable({ data, loading }: DataTableProps) {
  const t = useTranslations('components.dataTable')
  const [pageIndex, setPageIndex] = useState(0)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const tagFilterMode = useTableStore(s => s.tagFilterMode)
  const setTagFilterMode = useTableStore(s => s.setTagFilterMode)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set())
  const [hasTypeUserInteracted, setHasTypeUserInteracted] = useState(false)

  // 来自全局表格偏好的持久化状态
  const pageSize = useTableStore(s => s.pageSize)
  const setPageSize = useTableStore(s => s.setPageSize)
  const columnVisibility = useTableStore(s => s.columnVisibility)
  const setColumnVisibility = useTableStore(s => s.setColumnVisibility)
  const columnSizing = useTableStore(s => s.columnSizing)
  const setColumnSizing = useTableStore(s => s.setColumnSizing)
  // 读取 hasHydrated 可用于占位渲染（当前不需要直接使用）
  // const hasHydrated = useTableStore(s => s.hasHydrated)

  // 触发持久化状态水合（skipHydration: true）
  useEffect(() => {
    ;(useTableStore as unknown as { persist?: { rehydrate?: () => void } }).persist?.rehydrate?.()
  }, [])

  // 对数据引用进行 memo
  const memoData = useMemo(() => data, [data])

  // 提取所有唯一标签
  const extractedTags = useMemo(() => {
    const tagSet = new Set<string>()
    data.forEach((item) => {
      if (item.tags) {
        item.tags.split(/\s*,\s*/).forEach((tag) => {
          if (tag.trim()) {
            tagSet.add(tag.trim())
          }
        })
      }
    })
    return Array.from(tagSet).sort()
  }, [data])

  // 提取所有唯一类型
  const extractedTypes = useMemo(() => {
    const typeSet = new Set<string>()
    data.forEach((item) => {
      if (item.gallery_type && item.gallery_type.trim()) {
        typeSet.add(item.gallery_type.trim())
      }
    })
    return Array.from(typeSet).sort()
  }, [data])

  // 初始化标签状态（每次数据变化时重置为全选）
  useEffect(() => {
    if (extractedTags.length > 0) {
      setSelectedTags(new Set(extractedTags))
      setHasUserInteracted(false)
    }
  }, [extractedTags])

  // 当用户操作时标记已交互
  useEffect(() => {
    if (selectedTags.size > 0 || hasUserInteracted) {
      setHasUserInteracted(true)
    }
  }, [selectedTags, hasUserInteracted])

  // 初始化类型状态（每次数据变化时重置为全选）
  useEffect(() => {
    if (extractedTypes.length > 0) {
      setSelectedTypes(new Set(extractedTypes))
      setHasTypeUserInteracted(false)
    }
  }, [extractedTypes])

  // 当用户操作类型筛选时标记已交互
  useEffect(() => {
    if (selectedTypes.size > 0 || hasTypeUserInteracted) {
      setHasTypeUserInteracted(true)
    }
  }, [selectedTypes, hasTypeUserInteracted])

  // 更新列过滤器（加入模式与全选状态，切换 OR/AND/全选都会触发重算）
  useEffect(() => {
    const filters: ColumnFiltersState = [
      {
        id: 'tags',
        value: {
          values: Array.from(selectedTags),
          allSelected: selectedTags.size > 0 && selectedTags.size === extractedTags.length,
          mode: tagFilterMode,
        },
      },
      {
        id: 'gallery_type',
        value: {
          values: Array.from(selectedTypes),
          allSelected: selectedTypes.size > 0 && selectedTypes.size === extractedTypes.length,
        },
      },
    ]
    setColumnFilters(filters)
  }, [selectedTags, tagFilterMode, extractedTags.length, selectedTypes, extractedTypes.length])
  // 数据变化时重置页码，避免跨数据集残留页码
  useEffect(() => {
    setPageIndex(0)
  }, [memoData])

  const CellWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="whitespace-normal break-all text-sm">
      {children}
    </div>
  )

  const columns = useMemo(() => ([
    columnHelper.accessor('rank', {
      header: () => t('headers.rank'),
      cell: info => <CellWrapper>{info.getValue()}</CellWrapper>,
      size: 80,
    }),
    columnHelper.accessor('gallery_id', {
      header: () => t('headers.gallery_id'),
      cell: info => <CellWrapper>{info.getValue()}</CellWrapper>,
      size: 100,
    }),
    columnHelper.accessor('preview_url', {
      header: () => t('headers.preview_url'),
      cell: (info) => {
        const url = info.getValue() as string
        if (url === 'unavailable') {
          return (
            <CellWrapper>
              <div className="flex aspect-3/4 w-full items-center justify-center rounded bg-zinc-100 text-xs text-zinc-400 dark:bg-zinc-800">
                No Preview
              </div>
            </CellWrapper>
          )
        }
        return (
          <CellWrapper>
            <div className="w-full">
              <ImageWithSkeleton
                src={url}
                alt="预览图"
                className="w-full rounded"
              />
            </div>
          </CellWrapper>
        )
      },
      size: 120,
    }),
    columnHelper.accessor('gallery_name', {
      header: () => t('headers.gallery_name'),
      cell: (info) => {
        const isPreviewColumnVisible = info.table.getColumn('preview_url')?.getIsVisible() ?? true
        const previewUrl = info.row.original.preview_url
        const hasPreview = previewUrl && previewUrl !== 'unavailable'

        if (isPreviewColumnVisible || !hasPreview) {
          return (
            <CellWrapper>
              <Link
                href={info.row.original.gallery_url as string}
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
                    href={info.row.original.gallery_url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full break-all"
                  >
                    {info.getValue()}
                  </Link>
                  <PreloadImage src={previewUrl} />
                </div>
              </HoverCardTrigger>
              <HoverCardContent side="left" className="p-1">
                <ImageWithSkeleton
                  src={previewUrl}
                  alt={info.getValue() as string}
                />
              </HoverCardContent>
            </HoverCard>
          </CellWrapper>
        )
      },
      size: 250,
    }),
    columnHelper.accessor('gallery_type', {
      header: () => t('headers.gallery_type'),
      cell: info => <CellWrapper>{info.getValue()}</CellWrapper>,
      size: 100,
      filterFn: (row, columnId, filterValue: { values: string[], allSelected: boolean }) => {
        const type = row.getValue(columnId) as string
        if (!type) return false

        const selected = new Set(filterValue.values)

        // 全选：显示所有行；空选：不显示任何行
        if (filterValue.allSelected) return true
        if (selected.size === 0) return false

        return selected.has(type.trim())
      },
    }),
    columnHelper.accessor('tags', {
      header: () => t('headers.tags'),
      cell: info => <CellWrapper>{info.getValue()}</CellWrapper>,
      size: 300,
      filterFn: (row, columnId, filterValue: { values: string[], allSelected: boolean, mode: 'or' | 'and' }) => {
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
      header: () => t('headers.published_time'),
      cell: info => <CellWrapper>{info.getValue()}</CellWrapper>,
      size: 120,
    }),
    columnHelper.accessor('uploader', {
      header: () => t('headers.uploader'),
      cell: info => <CellWrapper>{info.getValue()}</CellWrapper>,
      size: 120,
    }),
    columnHelper.accessor('gallery_length', {
      header: () => t('headers.gallery_length'),
      cell: info => <CellWrapper>{info.getValue()}</CellWrapper>,
      size: 80,
    }),
    columnHelper.accessor('points', {
      header: () => t('headers.points'),
      cell: info => <CellWrapper>{info.getValue()}</CellWrapper>,
      size: 80,
    }),
    columnHelper.accessor('torrents_url', {
      header: () => t('headers.torrents_url'),
      cell: info => (
        <CellWrapper>
          {info.getValue()
            ? (
                <Link
                  href={info.getValue() as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-hover-underline text-blue-600 dark:text-blue-400"
                >
                  {t('headers.torrents_url')}
                </Link>
              )
            : '-'}
        </CellWrapper>
      ),
      size: 80,
    }),
  ]), [t])

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table's useReactTable returns stable function references
  const table = useReactTable({
    data: memoData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function'
        ? updater({ pageIndex, pageSize })
        : updater
      if (next.pageSize !== pageSize) {
        setPageSize(next.pageSize)
        setPageIndex(0)
      }
      else {
        setPageIndex(next.pageIndex)
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onColumnFiltersChange: setColumnFilters,
    columnResizeMode: 'onChange',
    state: {
      pagination: { pageIndex, pageSize },
      columnVisibility,
      columnSizing,
      columnFilters,
    },
    manualPagination: false,
  })

  const SkeletonRow = () => (
    <TableRow>
      {table.getVisibleLeafColumns().map(col => (
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
        columnVisibility={columnVisibility}
        selectedTags={selectedTags}
        extractedTags={extractedTags}
        tagFilterMode={tagFilterMode}
        onSelectedTagsChange={setSelectedTags}
        onTagFilterModeChange={setTagFilterMode}
        selectedTypes={selectedTypes}
        extractedTypes={extractedTypes}
        onSelectedTypesChange={setSelectedTypes}
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
                              header.getContext(),
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
            {loading
              ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                )
              : table.getFilteredRowModel().rows.length === 0
                ? (
                    <TableRow>
                      <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-24 text-center">
                        {t('noData')}
                      </TableCell>
                    </TableRow>
                  )
                : (
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
        key={`${pageSize}-${pageIndex}-${table.getFilteredRowModel().rows.length}`}
        table={table}
        content={{
          itemsPerPage: t('itemsPerPage'),
          page: t('page'),
          of: t('of'),
        }}
      />
    </div>
  )
}
