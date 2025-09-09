'use client'

import React from 'react'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface TablePaginationProps<T = unknown> {
  table: Table<T>
  content: {
    itemsPerPage: string
    page: string
    of: string
  }
  allowedPageSizes: number[]
}

export function TablePagination<T = unknown>({ table, content, allowedPageSizes }: TablePaginationProps<T>) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-zinc-700 dark:text-zinc-300">
          {content.itemsPerPage}
        </span>
        <Select
          value={table.getState().pagination.pageSize.toString()}
          onValueChange={(value) => {
            table.setPageSize(Number(value))
            table.setPageIndex(0)
          }}
        >
          <SelectTrigger className="w-[70px] bg-zinc-50 dark:bg-zinc-800">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-50 dark:bg-zinc-800">
            {allowedPageSizes.map(size => (
              <SelectItem
                key={size}
                value={String(size)}
                className="dark:hover:bg-zinc-700 dark:data-highlighted:bg-zinc-700"
              >
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="bg-zinc-50 dark:bg-zinc-800"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm text-zinc-700 dark:text-zinc-300">
          {content.page}
          {' '}
          {table.getState().pagination.pageIndex + 1}
          {' '}
          {content.of}
          {' '}
          {table.getPageCount()}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="bg-zinc-50 dark:bg-zinc-800"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
