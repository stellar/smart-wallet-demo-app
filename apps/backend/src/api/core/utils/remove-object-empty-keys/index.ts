const isObjectEmpty = (item: unknown): boolean => {
  if (typeof item !== 'object') return false
  return Object.keys(item as object).length === 0
}

export const removeObjectEmptyKeys = (object: Record<string, unknown>): Record<string, unknown> => {
  return Object.fromEntries(
    Object.entries(object).filter(([_, value]) => value !== null && value !== undefined && !isObjectEmpty(value))
  )
}
