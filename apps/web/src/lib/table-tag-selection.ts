// 筛选 intent 可能包含当前榜单不存在的历史值；这里取两者交集，得到仍属于当前榜单的已选值。
export function getSelectedCurrentItems(selectedItems: Set<string>, extractedItems: string[]): string[] {
  return extractedItems.filter(item => selectedItems.has(item))
}

// 计数只统计当前榜单里被选中的值，供筛选按钮和弹窗展示 current/total。
export function getSelectedCurrentItemCount(selectedItems: Set<string>, extractedItems: string[]): number {
  return getSelectedCurrentItems(selectedItems, extractedItems).length
}

// 长筛选列表里需要保留原本排序的可预测性，只把当前已选项稳定地提到弹窗顶部。
export function prioritizeSelectedItems(items: string[], selectedItems: Set<string>): string[] {
  const selected: string[] = []
  const unselected: string[] = []

  for (const item of items) {
    if (selectedItems.has(item)) {
      selected.push(item)
    }
    else {
      unselected.push(item)
    }
  }

  return [...selected, ...unselected]
}

// selectedItems 可以有当前榜单外的保留项，extractedItems 只代表当前榜单完整候选列表；
// 这个判断只关心当前榜单中的值是否全部被选中，不要求 selectedItems 刚好等于 extractedItems。
export function areAllCurrentItemsSelected(selectedItems: Set<string>, extractedItems: string[]): boolean {
  return extractedItems.length > 0
    && getSelectedCurrentItemCount(selectedItems, extractedItems) === extractedItems.length
}

// 这里要求“当前榜单全选”且“没有额外保留项”，用于识别无需保存显式筛选意图的普通全选状态。
export function areAllAndOnlyCurrentItemsSelected(selectedItems: Set<string>, extractedItems: string[]): boolean {
  return areAllCurrentItemsSelected(selectedItems, extractedItems)
    && selectedItems.size === extractedItems.length
}

// selectedTags 是用户当前筛选意图，开启“保留标签筛选”后可能包含当前榜单不存在的历史标签；
// extractedTags 是当前榜单、当前语言下实际提取出的可筛选标签。这里取两者交集，得到仍属于当前榜单的已选标签。
export function getSelectedCurrentTags(selectedTags: Set<string>, extractedTags: string[]): string[] {
  return getSelectedCurrentItems(selectedTags, extractedTags)
}

// selectedTags 可能比当前榜单多出跨榜单保留项，extractedTags 只代表当前榜单标签；
// 因此计数时只统计当前榜单里被选中的标签，供筛选按钮和弹窗展示 current/total。
export function getSelectedCurrentTagCount(selectedTags: Set<string>, extractedTags: string[]): number {
  return getSelectedCurrentItemCount(selectedTags, extractedTags)
}

// 长标签列表里需要保留原本排序的可预测性，只把当前已选项稳定地提到弹窗顶部。
export function prioritizeSelectedTags(tags: string[], selectedTags: Set<string>): string[] {
  return prioritizeSelectedItems(tags, selectedTags)
}

// selectedTags 里可以有当前榜单外的保留标签，extractedTags 是当前榜单的完整标签列表；
// 这个判断只关心当前榜单中的标签是否全部被选中，不要求 selectedTags 刚好等于 extractedTags。
export function areAllCurrentTagsSelected(selectedTags: Set<string>, extractedTags: string[]): boolean {
  return areAllCurrentItemsSelected(selectedTags, extractedTags)
}

// selectedTags 是准备保存或应用的标签选择，extractedTags 是当前榜单的全部候选标签；
// 这里要求“当前榜单全选”且“没有额外保留标签”，用于识别无需保存显式筛选意图的普通全选状态。
export function areAllAndOnlyCurrentTagsSelected(selectedTags: Set<string>, extractedTags: string[]): boolean {
  return areAllAndOnlyCurrentItemsSelected(selectedTags, extractedTags)
}
