import type { ColumnSizingState, VisibilityState } from '@tanstack/react-table'

export type TagFilterMode = 'or' | 'and'

export interface TablePreferences {
  pageSize: number
  columnVisibility: VisibilityState
  columnSizing: ColumnSizingState
  tagFilterMode: TagFilterMode
  preserveTagSelection: boolean
}

// 让 server render 也能拿到表格偏好，避免首屏先按默认列渲染再闪回用户配置。
export const TABLE_PREFERENCES_COOKIE = 'data-table-preferences'

export const defaultColumnVisibility: VisibilityState = {
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

export const defaultTablePreferences: TablePreferences = {
  pageSize: 10,
  columnVisibility: defaultColumnVisibility,
  columnSizing: {},
  tagFilterMode: 'or',
  preserveTagSelection: false,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function normalizeTablePreferences(value: unknown): TablePreferences {
  if (!isRecord(value)) {
    return defaultTablePreferences
  }

  const pageSize = typeof value.pageSize === 'number'
    ? value.pageSize
    : defaultTablePreferences.pageSize

  const columnVisibility = isRecord(value.columnVisibility)
    ? value.columnVisibility as VisibilityState
    : defaultTablePreferences.columnVisibility

  const columnSizing = isRecord(value.columnSizing)
    ? value.columnSizing as ColumnSizingState
    : defaultTablePreferences.columnSizing

  const tagFilterMode = value.tagFilterMode === 'and' || value.tagFilterMode === 'or'
    ? value.tagFilterMode
    : defaultTablePreferences.tagFilterMode

  const preserveTagSelection = typeof value.preserveTagSelection === 'boolean'
    ? value.preserveTagSelection
    : defaultTablePreferences.preserveTagSelection

  // 读取旧 cookie / 非完整对象时，缺失字段自动回退到默认值，避免配置升级后炸掉。
  return {
    pageSize,
    columnVisibility: {
      ...defaultTablePreferences.columnVisibility,
      ...columnVisibility,
    },
    columnSizing,
    tagFilterMode,
    preserveTagSelection,
  }
}

export function serializeTablePreferences(preferences: TablePreferences): string {
  // cookie 里只放轻量偏好，不放当前筛选结果和数据本身。
  return encodeURIComponent(JSON.stringify(preferences))
}

export function deserializeTablePreferences(value: string | undefined): TablePreferences {
  if (!value) {
    return defaultTablePreferences
  }

  try {
    return normalizeTablePreferences(JSON.parse(decodeURIComponent(value)))
  }
  catch {
    return defaultTablePreferences
  }
}
