/**
 * Computes useful-hit statistics for a relic set.
 * Replaces C# StatisticsService.
 */
import { AffixType } from '@/types/enums'
import type { RelicSet } from '@/types/relic'
import type { RelicSetStatistics, CategoryHitCount, TotalValueItem, TotalValueStatistics } from '@/types/statistics'
import { configService } from './ConfigService'
import { calculateMainAffixValue, calculateSubAffixValue } from './AffixCalculator'

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

// ---- HP / ATK / DEF merge pairs ----

const MERGED_PAIRS: Array<{ flat: AffixType; pct: AffixType }> = [
  { flat: AffixType.Hp, pct: AffixType.HpPercentage },
  { flat: AffixType.Atk, pct: AffixType.AtkPercentage },
  { flat: AffixType.Def, pct: AffixType.DefPercentage },
]

function buildMergedFlatTypes(): Set<AffixType> {
  return new Set(MERGED_PAIRS.map(p => p.flat))
}


/**
 * Computes total affix values for a relic set, merging main and sub affixes
 * by type and combining HP/ATK/DEF flat + percentage variants into single rows.
 *
 * @param set                     - The relic set to analyze
 * @param usefulSubAffixes        - Set of affix types marked as "useful" sub-affixes
 * @param templateMainAffixTypes  - Set of affix types from the active template's
 *                                  main-affixes, or null when no template is selected
 * @param getAffixName            - Resolves AffixType → localized display name
 */
export function computeTotalValueStatistics(
  set: RelicSet,
  usefulSubAffixes: Set<AffixType>,
  templateMainAffixTypes: Set<AffixType> | null,
  getAffixName: (type: AffixType) => string,
): TotalValueStatistics {
  // ---- Step 1: accumulate raw values per AffixType ----
  const valueMap = new Map<AffixType, number>()

  for (const relic of set.relics.values()) {
    // Main affix
    const mainCfg = configService.getMainAffixConfig(relic.mainAffix.type)
    if (mainCfg) {
      const val = calculateMainAffixValue(relic.mainAffix, mainCfg)
      valueMap.set(relic.mainAffix.type, (valueMap.get(relic.mainAffix.type) ?? 0) + val)
    }

    // Sub affixes (skip inactive: enhanceCount <= 0)
    for (const sub of relic.subAffixes) {
      if (sub.enhanceCount <= 0) continue
      const subCfg = configService.getSubAffixConfig(sub.type)
      if (!subCfg) continue
      const val = calculateSubAffixValue(sub, subCfg)
      valueMap.set(sub.type, (valueMap.get(sub.type) ?? 0) + val)
    }
  }

  // ---- Step 2: helper — is a type "useful"? ----
  const isTypeUseful = (type: AffixType): boolean => {
    if (usefulSubAffixes.has(type)) return true
    if (templateMainAffixTypes !== null && templateMainAffixTypes.has(type)) return true
    return false
  }

  // ---- Step 3: build merged rows for HP, ATK, DEF ----
  const items: TotalValueItem[] = []
  const consumedTypes = new Set<AffixType>()
  const mergedFlatTypes = buildMergedFlatTypes()

  for (const pair of MERGED_PAIRS) {
    const flatVal = valueMap.get(pair.flat) ?? 0
    const pctVal = valueMap.get(pair.pct) ?? 0

    if (flatVal === 0 && pctVal === 0) continue

    items.push({
      styleType: pair.flat,
      displayName: getAffixName(pair.flat), // "HP", "ATK", "DEF"
      flatValue: flatVal,
      flatIsPercent: false,
      pctValue: pctVal,
      pctIsPercent: pctVal > 0,
      isUseful: isTypeUseful(pair.flat) || isTypeUseful(pair.pct),
    })

    consumedTypes.add(pair.flat)
    consumedTypes.add(pair.pct)
  }

  // ---- Step 4: build single-type rows for remaining types ----
  for (const [type, total] of valueMap) {
    if (consumedTypes.has(type)) continue
    if (total === 0) continue

    const mainCfg = configService.getMainAffixConfig(type)
    const subCfg = configService.getSubAffixConfig(type)
    const isPercent = mainCfg?.isPercent ?? subCfg?.isPercent ?? false

    items.push({
      styleType: type,
      displayName: getAffixName(type),
      flatValue: total,
      flatIsPercent: isPercent,
      pctValue: 0,
      pctIsPercent: false,
      isUseful: isTypeUseful(type),
    })
  }

  // ---- Step 5: sort — merged rows first (HP/ATK/DEF), then alphabetically ----
  const mergedCount = items.filter(i => mergedFlatTypes.has(i.styleType)).length
  const merged = items.slice(0, mergedCount)
  const singles = items.slice(mergedCount).sort((a, b) =>
    a.displayName.localeCompare(b.displayName),
  )

  return { items: [...merged, ...singles] }
}
