"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from 'lucide-react'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
    const dateText = {
        en: 'Pick a date',
        zh: '选择日期'
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[280px] justify-start text-left font-normal bg-gray-50 dark:bg-gray-950",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>{dateText[language]}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-gray-50 dark:bg-gray-950">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                        setDate(newDate)
                        onDateChange(newDate as Date)
                    }}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}

