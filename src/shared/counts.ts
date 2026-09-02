/**
 * One item per label, plus how many active. Also what `FilterStrip` renders
 * a list of — `active` is the one field `countBy` never sets, since deciding
 * which filter is selected is a UI concern, not a counting one.
 */
export type FilterItem = { label: string; count: number; active?: boolean }

/**
 * `Map` accumulate, then sort by count descending, ties broken alphabetically
 * by label. The writing module's tag counts and the repositories module's
 * language counts are this exact algorithm — they differ only in how many
 * keys a single item contributes, which `keysFor` captures: a post has many
 * tags, a repository has exactly one language.
 */
export function countBy<T>(items: T[], keysFor: (item: T) => string[]): FilterItem[] {
  const counts = new Map<string, number>()
  for (const item of items) {
    for (const key of keysFor(item)) counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}
