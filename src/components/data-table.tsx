'use client'

import React, { useState } from 'react'
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
            hoverCardTitle: 'Item Details',
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
            hoverCardTitle: '项目详情',
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
                                <TableRow key={item.gallery_id}>
                                    {columns.map((column) => (
                                        <TableCell key={column}>
                                            {column === 'gallery_name' ? (
                                                <HoverCard>
                                                    <HoverCardTrigger asChild>
                                                        <span className="cursor-pointer underline">{item[column]}</span>
                                                    </HoverCardTrigger>
                                                    <HoverCardContent className="w-80">
                                                        <div className="space-y-2">
                                                            <h4 className="text-sm font-semibold">{content[language].hoverCardTitle}</h4>
                                                            {/* <p className="text-sm">
                                                                <span className="font-medium">{content[language].headers.name}:</span> {item.name}
                                                            </p>
                                                            <p className="text-sm">
                                                                <span className="font-medium">{content[language].headers.value}:</span> {item.value}
                                                            </p>
                                                            <p className="text-sm">
                                                                <span className="font-medium">{content[language].headers.category}:</span> {item.category}
                                                            </p>
                                                            <p className="text-sm">
                                                                <span className="font-medium">{content[language].headers.date}:</span> {item.date}
                                                            </p> */}
                                                        </div>
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

