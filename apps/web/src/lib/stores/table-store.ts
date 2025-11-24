'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import type { ColumnSizingState, VisibilityState } from '@tanstack/react-table'

export type TagFilterMode = 'or' | 'and'

interface TableState {
  // 持久化偏好
  pageSize: number
  columnVisibility: VisibilityState
  columnSizing: ColumnSizingState
  tagFilterMode: TagFilterMode

  // 水合标记（避免 SSR 与客户端初始值不一致）
  hasHydrated: boolean

  // actions
  setPageSize: (pageSize: number) => void
  setColumnVisibility: (updaterOrValue: VisibilityState | ((old: VisibilityState) => VisibilityState)) => void
  setColumnSizing: (updaterOrValue: ColumnSizingState | ((old: ColumnSizingState) => ColumnSizingState)) => void
  setTagFilterMode: (mode: TagFilterMode) => void
  setHasHydrated: (hydrated: boolean) => void
}

const defaultColumnVisibility: VisibilityState = {
  rank: true,
  gallery_id: false,
  preview_url: true,
  gallery_name: true,
  gallery_type: false,
  tags: true,
  published_time: false,
  uploader: false,
  gallery_length: false,
  points: false,
  torrents_url: false,
}

export const useTableStore = create<TableState>()(
  persist(
    set => ({
      pageSize: 10,
      columnVisibility: defaultColumnVisibility,
      columnSizing: {},
      tagFilterMode: 'or',
      hasHydrated: false,

      setPageSize: pageSize => set({ pageSize }),
      setColumnVisibility: updaterOrValue => set((state) => {
        const columnVisibility = typeof updaterOrValue === 'function'
          ? updaterOrValue(state.columnVisibility)
          : updaterOrValue
        return { columnVisibility }
      }),
      setColumnSizing: updaterOrValue => set((state) => {
        const columnSizing = typeof updaterOrValue === 'function'
          ? updaterOrValue(state.columnSizing)
          : updaterOrValue
        return { columnSizing }
      }),
      setTagFilterMode: mode => set({ tagFilterMode: mode }),
      setHasHydrated: hydrated => set({ hasHydrated: hydrated }),
    }),
    {
      name: 'data-table-store',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        pageSize: state.pageSize,
        columnVisibility: state.columnVisibility,
        columnSizing: state.columnSizing,
        tagFilterMode: state.tagFilterMode,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
      // 避免在 SSR 期间访问 localStorage
      skipHydration: true,
    },
  ),
)
