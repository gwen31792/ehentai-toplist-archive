'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import {
  defaultTablePreferences,
  serializeTablePreferences,
  TABLE_PREFERENCES_COOKIE,
  type TablePreferences,
  type TagFilterMode,
} from '@/lib/table-preferences'

import type { ColumnSizingState, VisibilityState } from '@tanstack/react-table'

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

function pickTablePreferences(state: Pick<TableState, 'pageSize' | 'columnVisibility' | 'columnSizing' | 'tagFilterMode'>): TablePreferences {
  return {
    pageSize: state.pageSize,
    columnVisibility: state.columnVisibility,
    columnSizing: state.columnSizing,
    tagFilterMode: state.tagFilterMode,
  }
}

function writeTablePreferencesCookie(preferences: TablePreferences) {
  if (typeof document === 'undefined') {
    return
  }

  // localStorage 负责客户端持久化，cookie 负责把同一份偏好带回 server render。
  document.cookie = `${TABLE_PREFERENCES_COOKIE}=${serializeTablePreferences(preferences)}; path=/; max-age=${60 * 60 * 24 * 365}`
}

export const useTableStore = create<TableState>()(
  persist(
    set => ({
      pageSize: defaultTablePreferences.pageSize,
      columnVisibility: defaultTablePreferences.columnVisibility,
      columnSizing: defaultTablePreferences.columnSizing,
      tagFilterMode: defaultTablePreferences.tagFilterMode,
      hasHydrated: false,

      setPageSize: pageSize => set((state) => {
        const nextPreferences = pickTablePreferences({
          ...state,
          pageSize,
        })
        writeTablePreferencesCookie(nextPreferences)
        return { pageSize }
      }),
      setColumnVisibility: updaterOrValue => set((state) => {
        const columnVisibility = typeof updaterOrValue === 'function'
          ? updaterOrValue(state.columnVisibility)
          : updaterOrValue
        writeTablePreferencesCookie(pickTablePreferences({
          ...state,
          columnVisibility,
        }))
        return { columnVisibility }
      }),
      setColumnSizing: updaterOrValue => set((state) => {
        const columnSizing = typeof updaterOrValue === 'function'
          ? updaterOrValue(state.columnSizing)
          : updaterOrValue
        writeTablePreferencesCookie(pickTablePreferences({
          ...state,
          columnSizing,
        }))
        return { columnSizing }
      }),
      setTagFilterMode: mode => set((state) => {
        writeTablePreferencesCookie(pickTablePreferences({
          ...state,
          tagFilterMode: mode,
        }))
        return { tagFilterMode: mode }
      }),
      setHasHydrated: hydrated => set({ hasHydrated: hydrated }),
    }),
    {
      name: 'data-table-store',
      storage: createJSONStorage(() => localStorage),
      partialize: state => pickTablePreferences(state),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 首次从 localStorage 恢复后，立刻补写 cookie，后续刷新才能让 SSR 直接命中用户偏好。
          writeTablePreferencesCookie(pickTablePreferences(state))
        }
        state?.setHasHydrated(true)
      },
      // 避免在 SSR 期间访问 localStorage
      skipHydration: true,
    },
  ),
)
