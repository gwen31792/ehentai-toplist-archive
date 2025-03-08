'use client'

import * as React from 'react'
import { ChevronLeft, ChevronsLeft, ChevronRight, ChevronsRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  language?: string
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const startDate = new Date(2023, 10, 15)
  const today = new Date()
  const [month, setMonth] = React.useState(today)
  
  const handlePreviousYear = () => {
    setMonth((prev) => {
      const newDate = new Date(prev)
      newDate.setFullYear(newDate.getFullYear() - 1)
      return newDate
    })
  }

  const handleNextYear = () => {
    setMonth((prev) => {
      const newDate = new Date(prev)
      newDate.setFullYear(newDate.getFullYear() + 1)
      return newDate
    })
  }

  const handlePreviousMonth = () => {
    setMonth((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() - 1)
      return newDate
    })
  }

  const handleNextMonth = () => {
    setMonth((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + 1)
      return newDate
    })
  }

  return (
    <DayPicker
      month={month}
      onMonthChange={setMonth}
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell:
          'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
        ),
        day_range_end: 'day-range-end',
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        day_today: 'bg-accent text-accent-foreground',
        day_outside:
          'day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Caption: ({ displayMonth }) => {
          const isPrevMonthDisabled = displayMonth < startDate
          const isNextMonthDisabled = displayMonth > today
          const isPrevYearDisabled = displayMonth < startDate
          const isNextYearDisabled = displayMonth > today
          return (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handlePreviousYear}
                disabled={isPrevYearDisabled}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'h-7 w-7 bg-transparent p-0',
                  isPrevYearDisabled ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:opacity-100',
                )}
              >
                <ChevronsLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={handlePreviousMonth}
                disabled={isPrevMonthDisabled}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'h-7 w-7 bg-transparent p-0',
                  isPrevMonthDisabled ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:opacity-100',
                )}
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-sm font-medium">
                {displayMonth.toLocaleString(props.language || 'default', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                disabled={isNextMonthDisabled}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'h-7 w-7 bg-transparent p-0',
                  isNextMonthDisabled ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:opacity-100',
                )}
              >
                <ChevronRight className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleNextYear}
                disabled={isNextYearDisabled}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'h-7 w-7 bg-transparent p-0',
                  isNextYearDisabled ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:opacity-100',
                )}
              >
                <ChevronsRight className="size-4" />
              </button>
            </div>
          )},
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
