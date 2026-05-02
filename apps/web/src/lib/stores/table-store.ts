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
  preserveTagSelection: boolean

  // 会话内状态，不进入 localStorage/cookie，避免把用户选择的大量标签写进持久化偏好。
  tagSelectionIntent: string[] | null
  // intent 保存的是当前语言下的展示文本，恢复前必须确认语言一致。
  tagSelectionIntentLocale: string | null

  // 水合标记（避免 SSR 与客户端初始值不一致）
  hasHydrated: boolean

  // actions
  setPageSize: (pageSize: number) => void
  setColumnVisibility: (updaterOrValue: VisibilityState | ((old: VisibilityState) => VisibilityState)) => void
  setColumnSizing: (updaterOrValue: ColumnSizingState | ((old: ColumnSizingState) => ColumnSizingState)) => void
  setTagFilterMode: (mode: TagFilterMode) => void
  setPreserveTagSelection: (preserve: boolean) => void
  setTagSelectionIntent: (intent: string[] | null, locale?: string | null) => void
  setHasHydrated: (hydrated: boolean) => void
}

function pickTablePreferences(state: Pick<TableState, 'pageSize' | 'columnVisibility' | 'columnSizing' | 'tagFilterMode' | 'preserveTagSelection'>): TablePreferences {
  return {
    pageSize: state.pageSize,
    columnVisibility: state.columnVisibility,
    columnSizing: state.columnSizing,
    tagFilterMode: state.tagFilterMode,
    preserveTagSelection: state.preserveTagSelection,
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
      preserveTagSelection: defaultTablePreferences.preserveTagSelection,
      tagSelectionIntent: null,
      tagSelectionIntentLocale: null,
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
      setPreserveTagSelection: preserve => set((state) => {
        writeTablePreferencesCookie(pickTablePreferences({
          ...state,
          preserveTagSelection: preserve,
        }))
        return {
          preserveTagSelection: preserve,
          tagSelectionIntent: preserve ? state.tagSelectionIntent : null,
          tagSelectionIntentLocale: preserve ? state.tagSelectionIntentLocale : null,
        }
      }),
      setTagSelectionIntent: (intent, locale = null) => set({
        tagSelectionIntent: intent,
        tagSelectionIntentLocale: intent === null ? null : locale,
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

let tableStoreHydrationPromise: Promise<void> | undefined

// DataTable 会因查询条件变化而 remount；这里把持久化状态恢复收敛为客户端一次，避免重复读写 storage。
export function hydrateTableStoreOnce(): Promise<void> {
  if (useTableStore.persist.hasHydrated()) {
    return tableStoreHydrationPromise ?? Promise.resolve()
  }

  tableStoreHydrationPromise ??= Promise.resolve(useTableStore.persist.rehydrate())
    .finally(() => {
      tableStoreHydrationPromise = undefined
    })

  return tableStoreHydrationPromise
}
