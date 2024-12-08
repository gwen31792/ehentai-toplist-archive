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
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type DataItem = {
    id: number
    name: string
    value: number
    category: string
    date: string
}

type Language = 'en' | 'zh'

interface DataTableProps {
    data: DataItem[]
    language: Language
}

export function DataTable({ data, language }: DataTableProps) {
    const content = {
        en: {
            title: 'Sample Data',
            headers: {
                name: 'Name',
                value: 'Value',
                category: 'Category',
                date: 'Date',
            },
            itemsPerPage: 'Items per page',
            page: 'Page',
            of: 'of',
        },
        zh: {
            title: '示例数据',
            headers: {
                name: '名称',
                value: '数值',
                category: '类别',
                date: '日期',
            },
            itemsPerPage: '每页项目数',
            page: '页',
            of: '/',
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

    const columns: (keyof DataItem)[] = ['name', 'value', 'category', 'date'];

    return (
        <div className="w-full max-w-2xl mx-auto mt-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                {content[language].title}
            </h2>
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
                    {currentItems.map((item) => (
                        <TableRow key={item.id}>
                            {columns.map((column) => (
                                <TableCell key={column}>
                                    {item[column]}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
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
                        <SelectTrigger className="w-[70px]">
                            <SelectValue placeholder={itemsPerPage.toString()} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
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
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

