// Content-Based Recommendation using Cosine Similarity
export function cosineSimilarity(tags1: string[], tags2: string[]): number {
  const allTags = [...new Set([...tags1, ...tags2])]
  
  const vector1 = allTags.map(tag => tags1.includes(tag) ? 1 : 0)
  const vector2 = allTags.map(tag => tags2.includes(tag) ? 1 : 0)
  
  const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0 as number)
  const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0 as number))
  const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0 as number))
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0
  return dotProduct / (magnitude1 * magnitude2)
}

// Get similar items based on tags
export function getSimilarItems<T extends { id: string; tags: string[] }>(
  currentItem: T,
  allItems: T[],
  limit: number = 3
): T[] {
  if (!Array.isArray(allItems)) return []
  return allItems
    .filter(item => item.id !== currentItem.id)
    .map(item => ({
      item,
      similarity: cosineSimilarity(currentItem.tags, item.tags)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .filter(result => result.similarity > 0)
    .map(result => result.item)
}

// Chronological Sorting
export function sortByDate<T extends { date: string }>(items: T[], order: 'asc' | 'desc' = 'desc'): T[] {
  if (!Array.isArray(items)) return []
  return [...items].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return order === 'desc' ? dateB - dateA : dateA - dateB
  })
}

// Group by Year/Month
export function groupByDate<T extends { date: string }>(items: T[]): Record<string, T[]> {
  if (!Array.isArray(items)) return {}
  const sorted = sortByDate(items)
  const groups: Record<string, T[]> = {}
  
  sorted.forEach(item => {
    const date = new Date(item.date)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  })
  
  return groups
}

// Tag-Based Clustering/Grouping
export function groupByTags<T extends { tags: string[] }>(items: T[]): Record<string, T[]> {
  if (!Array.isArray(items)) return {}
  const groups: Record<string, T[]> = {}
  
  items.forEach(item => {
    item.tags.forEach(tag => {
      if (!groups[tag]) groups[tag] = []
      if (!groups[tag].includes(item)) {
        groups[tag].push(item)
      }
    })
  })
  
  return groups
}

// Get recent vs old items
export function categorizeByRecency<T extends { date: string }>(
  items: T[],
  recentDays: number = 90
): { recent: T[]; old: T[] } {
  if (!Array.isArray(items)) return { recent: [], old: [] }
  const now = new Date()
  const cutoff = new Date(now.getTime() - recentDays * 24 * 60 * 60 * 1000)
  
  return items.reduce(
    (acc, item) => {
      const itemDate = new Date(item.date)
      if (itemDate >= cutoff) {
        acc.recent.push(item)
      } else {
        acc.old.push(item)
      }
      return acc
    },
    { recent: [] as T[], old: [] as T[] }
  )
}

// Format date for display
export function formatDateGroup(key: string): string {
  const [year, month] = key.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
}
