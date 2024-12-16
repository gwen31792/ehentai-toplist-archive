'use client'

// TODO: Image 样式优化，固定宽度？
// TODO: Image 边框收窄
// TODO: 各个列改为真正的内容
// TODO: 图片从 cloudflare r2 中读取，这需要先一步优化爬虫

import React, { useState } from 'react'
import Image from 'next/image'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Language, QueryResponseItem, ContentType } from '@/lib/types'
import { Skeleton } from "@/components/ui/skeleton"

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
                gallery_type: 'Value',
                published_time: 'Category',
                uploader: 'Date',
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
                gallery_type: '数值',
                published_time: '类别',
                uploader: '日期',
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

    const columns: (keyof QueryResponseItem)[] = ['rank', 'gallery_name', 'gallery_type', 'published_time', 'uploader'];

    // 加载状态下的骨架屏行
    const SkeletonRow = () => (
        <TableRow>
            <TableCell><Skeleton className="h-4 w-[100px] bg-gray-200" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[200px] bg-gray-200" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[200px] bg-gray-200" /></TableCell>
        </TableRow>
    )

    return (
        <div className="w-full max-w-2xl mx-auto mt-8">
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((column) => (
                            <TableHead key={column}>
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
                        </>) :
                        (
                            currentItems.map((item) => (
                                <TableRow key={item.gallery_id} className='dark:hover:bg-gray-700'>
                                    {columns.map((column) => (
                                        <TableCell key={column}>
                                            {column === 'gallery_name' ? (
                                                <HoverCard>
                                                    <HoverCardTrigger asChild>
                                                        <span className="cursor-pointer underline">{item[column]}</span>
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
            <div className="flex justify-between items-center mt-4">
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        {content[language].itemsPerPage}
                    </span>
                    <Select
                        value={itemsPerPage.toString()}
                        onValueChange={handleItemsPerPageChange}
                    >
                        <SelectTrigger className="w-[70px] bg-gray-50 dark:bg-gray-800">
                            <SelectValue placeholder={itemsPerPage.toString()} />
                        </SelectTrigger>
                        <SelectContent className='bg-gray-50 dark:bg-gray-800'>
                            <SelectItem value="5" className="dark:hover:bg-gray-700 dark:data-[highlighted]:bg-gray-700">5</SelectItem>
                            <SelectItem value="10" className="dark:hover:bg-gray-700 dark:data-[highlighted]:bg-gray-700">10</SelectItem>
                            <SelectItem value="20" className="dark:hover:bg-gray-700 dark:data-[highlighted]:bg-gray-700">20</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className='bg-gray-50 dark:bg-gray-800'
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        {content[language].page} {currentPage} {content[language].of} {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className='bg-gray-50 dark:bg-gray-800'
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

