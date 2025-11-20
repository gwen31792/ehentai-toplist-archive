'use client'

import React, { useRef, useEffect } from 'react'

import { useVirtualizer } from '@tanstack/react-virtual'

import { Checkbox } from '@/components/ui/checkbox'

interface VirtualizedFilterListProps {
  items: string[]
  selectedItems: Set<string>
  onSelectionChange: (items: Set<string>) => void
  idPrefix: string
}

export function VirtualizedFilterList({
  items,
  selectedItems,
  onSelectionChange,
  idPrefix,
}: VirtualizedFilterListProps) {
  'use no memo'
  const parentRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28,
    overscan: 10,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      virtualizer.measure()
    }, 0)
    return () => clearTimeout(timer)
  }, [virtualizer])

  return (
    <div
      ref={parentRef}
      className="max-h-[300px] min-h-[200px] overflow-y-auto"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = items[virtualItem.index]
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              className="flex items-center space-x-2"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <Checkbox
                id={`${idPrefix}-${item}`}
                checked={selectedItems.has(item)}
                onCheckedChange={(checked: boolean | 'indeterminate') => {
                  const newSelectedItems = new Set(selectedItems)
                  if (checked === true) {
                    newSelectedItems.add(item)
                  }
                  else {
                    newSelectedItems.delete(item)
                  }
                  onSelectionChange(newSelectedItems)
                }}
              />
              <label
                htmlFor={`${idPrefix}-${item}`}
                className="text-sm font-normal text-zinc-700 dark:text-zinc-300 cursor-pointer flex-1"
              >
                {item}
              </label>
            </div>
          )
        })}
      </div>
    </div>
  )
}
