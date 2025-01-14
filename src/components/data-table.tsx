'use client'

// TODO: Image 样式优化，固定宽度？
// TODO: Image 边框收窄
// TODO: 图片从 cloudflare r2 中读取，这需要先一步优化爬虫
// TODO: 优化各列宽度，在加载时，有数据时，无数据时保持一致

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Language, QueryResponseItem, ContentType } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'

interface DataTableProps {
    data: QueryResponseItem[]
    language: Language
    loading: boolean
}

export function DataTable({ data, language, loading }: DataTableProps) {
  const content: ContentType = {
    en: {
      headers: {
        rank: 'Rank',
        gallery_name: 'Name',
        gallery_type: 'Type',
        published_time: 'Published Date',
        tags: 'Tags',
      },
      itemsPerPage: 'Items per page',
      page: 'Page',
      of: 'of',
      description: 'Description',
    },
    zh: {
      headers: {
        rank: '排名',
        gallery_name: '名称',
        gallery_type: '类型',
        published_time: '上传日期',
        tags: '标签',
      },
      itemsPerPage: '每页项目数',
      page: '页',
      of: '/',
      description: '描述',
    },
  }

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(data.length / itemsPerPage)

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  const columns: (keyof QueryResponseItem)[] = ['rank', 'gallery_name', 'gallery_type', 'published_time', 'tags'];

  // 加载状态下的骨架屏行
  const SkeletonRow = () => (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-[80px] bg-zinc-200 dark:bg-zinc-800" /></TableCell>
      <TableCell><Skeleton className="h-4 w-[300px] bg-zinc-200 dark:bg-zinc-800" /></TableCell>
      <TableCell><Skeleton className="h-4 w-[120px] bg-zinc-200 dark:bg-zinc-800" /></TableCell>
      <TableCell><Skeleton className="h-4 w-[150px] bg-zinc-200 dark:bg-zinc-800" /></TableCell>
      <TableCell><Skeleton className="h-4 w-[500px] bg-zinc-200 dark:bg-zinc-800" /></TableCell>
    </TableRow>
  )

  return (
    <div className="mx-auto mt-8 w-full max-w-4xl">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column}
                className={`
                                    ${column === 'rank' ? 'w-[80px]' : ''}
                                    ${column === 'gallery_name' ? 'w-[300px]' : ''}
                                    ${column === 'gallery_type' ? 'w-[120px]' : ''}
                                    ${column === 'published_time' ? 'w-[150px]' : ''}
                                    ${column === 'tags' ? 'w-[500px]' : ''}
                                `}
              >
                {content[language].headers[column]}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>) :
            (
              currentItems.map((item) => (
                <TableRow key={item.gallery_id} className='dark:hover:bg-zinc-700'>
                  {columns.map((column) => (
                    <TableCell
                      key={column}
                      className={`
                                                ${column === 'rank' ? 'w-[80px]' : ''}
                                                ${column === 'gallery_name' ? 'w-[300px]' : ''}
                                                ${column === 'gallery_type' ? 'w-[120px]' : ''}
                                                ${column === 'published_time' ? 'w-[150px]' : ''}
                                                ${column === 'tags' ? 'w-[500px]' : ''}
                                            `}
                    >
                      {column === 'gallery_name' ? (
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Link href={item.gallery_url} target="_blank" rel="noopener noreferrer">
                              {item[column]}
                            </Link>
                          </HoverCardTrigger>
                          <HoverCardContent side='left'>
                            <Image
                              src={item.preview_url}
                              alt={item.gallery_name}
                              width={0}
                              height={0}
                              style={{ width: '100%', height: 'auto' }}
                              sizes='100vw'
                              quality={100}
                              className='m-0'
                            />
                          </HoverCardContent>
                        </HoverCard>
                      ) : (
                        item[column]
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )
          }

        </TableBody>
      </Table>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            {content[language].itemsPerPage}
          </span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={handleItemsPerPageChange}
          >
            <SelectTrigger className="w-[70px] bg-zinc-50 dark:bg-zinc-800">
              <SelectValue placeholder={itemsPerPage.toString()} />
            </SelectTrigger>
            <SelectContent className='bg-zinc-50 dark:bg-zinc-800'>
              <SelectItem value="5" className="dark:hover:bg-zinc-700 dark:data-[highlighted]:bg-zinc-700">5</SelectItem>
              <SelectItem value="10" className="dark:hover:bg-zinc-700 dark:data-[highlighted]:bg-zinc-700">10</SelectItem>
              <SelectItem value="20" className="dark:hover:bg-zinc-700 dark:data-[highlighted]:bg-zinc-700">20</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className='bg-zinc-50 dark:bg-zinc-800'
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            {content[language].page} {currentPage} {content[language].of} {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className='bg-zinc-50 dark:bg-zinc-800'
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

