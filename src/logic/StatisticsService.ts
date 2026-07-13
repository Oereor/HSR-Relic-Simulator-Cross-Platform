/**
 * Computes useful-hit statistics for a relic set.
 * Replaces C# StatisticsService.
 */
import type { RelicSet } from '@/types/relic'
import type { RelicSetStatistics, CategoryHitCount } from '@/types/statistics'
import type { AffixType } from '@/types/enums'

/**
 * Computes statistics for a relic set based on which sub-affix types
 * the user has marked as "useful" in the highlight config.
 *
 * TotalUsefulHits = sum of EnhanceCount across all sub-affixes whose
 * type is in the useful set. Each EnhanceCount >= 1 counts as at least 1 hit.
 *
 * CategoryHits = per-affix-type breakdown, sorted descending by count.
 *
 * @param set - The relic set to analyze
 * @param usefulAffixes - Set of affix types the user considers useful
 * @param getAffixName - Function to resolve affix type to localized display name
 */
export function computeStatistics(
  set: RelicSet,
  usefulAffixes: Set<AffixType>,
  getAffixName: (type: AffixType) => string,
): RelicSetStatistics {
  let totalUsefulHits = 0
  const categoryMap = new Map<AffixType, number>()

  for (const relic of set.relics.values()) {
    for (const sub of relic.subAffixes) {
      if (usefulAffixes.has(sub.type)) {
        const hits = sub.enhanceCount
        totalUsefulHits += hits

        const current = categoryMap.get(sub.type) ?? 0
        categoryMap.set(sub.type, current + hits)
      }
    }
  }

  // Sort categories descending by count
  const categoryHits: CategoryHitCount[] = Array.from(categoryMap.entries())
    .map(([type, count]) => ({
      type,
      count,
      displayName: getAffixName(type),
    }))
    .sort((a, b) => b.count - a.count)

  return { totalUsefulHits, categoryHits }
}
