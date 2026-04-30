'use client'

import React, { useRef } from 'react'

import { useVirtualizer } from '@tanstack/react-virtual'

import { Checkbox } from '@/components/ui/checkbox'

interface VirtualizedFilterListProps {
  items: string[]
  selectedItems: Set<string>
  onSelectionChange: (items: Set<string>) => void
  idPrefix: string
  emptyMessage?: string
}

export function VirtualizedFilterList({
  items,
  selectedItems,
  onSelectionChange,
  idPrefix,
  emptyMessage,
}: VirtualizedFilterListProps) {
  'use no memo'
  const parentRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28,
    overscan: 10,
  })

  if (items.length === 0 && emptyMessage) {
    return (
      <div
        ref={parentRef}
        className="flex max-h-[300px] min-h-[200px] items-center justify-center overflow-y-auto rounded-md border border-dashed border-zinc-200 px-4 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
      >
        {emptyMessage}
      </div>
    )
  }

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
              ref={virtualizer.measureElement}
              className="flex items-center space-x-2 py-1"
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
