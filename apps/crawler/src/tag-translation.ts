const TAG_BATCH_SIZE = 100

// 统一处理 tags 字符串的拆分，避免不同调用点各自处理空值和空白。
function splitTags(tagsString: string | null): string[] {
  if (!tagsString) {
    return []
  }

  return tagsString
    .split(', ')
    .map(tag => tag.trim())
    .filter(Boolean)
}

// 从 KV 批量读取标签翻译，并先去重以减少不必要的读取次数。
export async function getTagTranslationMap(
  kv: KVNamespace,
  tags: Iterable<string>,
): Promise<Map<string, string>> {
  const uniqueTags = [...new Set(Array.from(tags).filter(Boolean))]
  const translationMap = new Map<string, string>()

  for (let i = 0; i < uniqueTags.length; i += TAG_BATCH_SIZE) {
    const batchKeys = uniqueTags.slice(i, i + TAG_BATCH_SIZE)
    const batchResult = await kv.get(batchKeys, 'text')

    for (const [key, value] of batchResult.entries()) {
      if (value !== null) {
        translationMap.set(key, value)
      }
    }
  }

  return translationMap
}

// 使用已读取好的翻译表转换 tags，适合一个批次内复用同一份 KV 查询结果。
export function translateTagsWithMap(
  tagsString: string | null,
  translationMap: ReadonlyMap<string, string>,
): string | null {
  const tags = splitTags(tagsString)

  if (tags.length === 0) {
    return null
  }

  const translatedTags = tags.map((tag) => {
    const translation = translationMap.get(tag)
    if (translation) {
      const colonIndex = tag.indexOf(':')
      const namespace = colonIndex > -1 ? tag.substring(0, colonIndex) : ''
      return namespace ? `${namespace}:${translation}` : translation
    }

    return tag
  })

  return translatedTags.join(', ')
}

// 单次翻译入口：内部会先读取 KV，再返回与原 tags 格式一致的翻译结果。
export async function translateTags(
  kv: KVNamespace,
  tagsString: string | null,
): Promise<string | null> {
  const tags = splitTags(tagsString)

  if (tags.length === 0) {
    return null
  }

  const translationMap = await getTagTranslationMap(kv, tags)
  return translateTagsWithMap(tagsString, translationMap)
}
