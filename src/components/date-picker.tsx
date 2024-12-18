"use client"
// TODO: 大的翻页按钮，一次走一年
// 这个问题有点复杂，claude 3.5 和 gpt-4o 都搞不定，之后用 o1 试试
// TODO: 暗黑模式下的颜色调整

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from 'lucide-react'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Matcher } from "react-day-picker"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Language } from "@/lib/types"

interface DatePickerProps {
    onDateChange: (date: Date) => void,
    language: Language
}

export function DatePicker({ onDateChange, language }: DatePickerProps) {
    const [date, setDate] = React.useState<Date>()
    // 添加新的 state 来保存当前查看的月份
    const [month, setMonth] = React.useState<Date>(new Date())
    const dateText = {
        en: 'Pick a date',
        zh: '选择日期'
    };

    // 禁止查看没有数据的日期
    const disabledDays: Matcher = {
        // 禁止 2023-11-15 之前的日期
        before: new Date(2023, 11, 15),
        after: new Date(),
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[280px] justify-start text-left font-normal bg-zinc-50 dark:bg-zinc-800",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>{dateText[language]}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto p-0 bg-zinc-50 dark:bg-zinc-800"
                side="bottom"
                align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                        setDate(newDate)
                        onDateChange(newDate as Date)
                    }}
                    defaultMonth={month}
                    onMonthChange={setMonth}
                    modifiers={{ disabled: disabledDays }}
                    modifiersStyles={{
                        disabled: { opacity: 0.5, cursor: 'not-allowed' }
                    }}
                    initialFocus
                    fixedWeeks
                />
            </PopoverContent>
        </Popover>
    )
}

