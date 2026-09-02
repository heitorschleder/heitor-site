/**
 * One item per label, plus how many carry it. Which facet is *selected* is not
 * here on purpose: that is a UI concern the browsing component owns, and
 * putting it on the counted item is what let the strip render a hardcoded
 * `active: true` on "All" and look like a control while being a label.
 */
export type FilterItem = { label: string; count: number }

/** The facet that applies no filter. One spelling, so no caller invents another. */
export const ALL_FILTER = 'All'

/**
 * Prepends the "no filter" facet, whose count is the whole collection rather
 * than any one label's tally.
 */
export function withAllFacet(total: number, facets: FilterItem[]): FilterItem[] {
  return [{ label: ALL_FILTER, count: total }, ...facets]
}

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
