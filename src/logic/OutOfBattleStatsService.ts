/**
 * Pure-function service that computes a character's final out-of-battle stats
 * by combining base stats, trace/ascension bonuses, and relic contributions.
 *
 * Framework-agnostic — zero Vue or Pinia dependencies.
 */
import { AffixType, RelicPosition } from '@/types/enums'
import type { CharacterBaseStatEntry, ParsedBonusValue } from '@/types/config'
import type { OutOfBattleStats, OutOfBattleStatsItem } from '@/types/outOfBattleStats'
import type { RelicSet } from '@/types/relic'
import { configService } from './ConfigService'
import { calculateMainAffixValue, calculateSubAffixValue } from './AffixCalculator'
import outOfBattleStatsConfigRaw from '@/data/OutOfBattleStatsConfig.json'

// ---- Constants ----

/** All seven elemental DMG boost AffixType values. */
const ELEMENTAL_DMG_TYPES: AffixType[] = [
  AffixType.PhysicalDmgBoost,
  AffixType.FireDmgBoost,
  AffixType.IceDmgBoost,
  AffixType.WindDmgBoost,
  AffixType.LightningDmgBoost,
  AffixType.QuantumDmgBoost,
  AffixType.ImaginaryDmgBoost,
]

/** Map value-stat config keys to their flat / percentage relic AffixType pair. */
const VALUE_STAT_RELIC_MAP: Record<string, { flat: AffixType; pct: AffixType | null }> = {
  Hp: { flat: AffixType.Hp, pct: AffixType.HpPercentage },
  Atk: { flat: AffixType.Atk, pct: AffixType.AtkPercentage },
  Def: { flat: AffixType.Def, pct: AffixType.DefPercentage },
  Spd: { flat: AffixType.Spd, pct: null },
}

/** Flat ↔ percentage and elemental equivalence for unified display rows. */
const AFFIX_EQUIVALENCE: Partial<Record<AffixType, AffixType[]>> = {
  [AffixType.Hp]: [AffixType.HpPercentage],
  [AffixType.HpPercentage]: [AffixType.Hp],
  [AffixType.Atk]: [AffixType.AtkPercentage],
  [AffixType.AtkPercentage]: [AffixType.Atk],
  [AffixType.Def]: [AffixType.DefPercentage],
  [AffixType.DefPercentage]: [AffixType.Def],
}

// All 7 elemental DMG types are equivalent — only one row is shown,
// so marking any one as useful highlights the resolved element row.
for (const elem of ELEMENTAL_DMG_TYPES) {
  AFFIX_EQUIVALENCE[elem] = ELEMENTAL_DMG_TYPES.filter((t) => t !== elem)
}

/** Check whether an affix type is useful, considering flat↔percentage and elemental equivalence. */
function isAffixUseful(type: AffixType, usefulAffixes: Set<AffixType>): boolean {
  if (usefulAffixes.has(type)) return true
  const equivalents = AFFIX_EQUIVALENCE[type]
  if (equivalents) {
    return equivalents.some((t) => usefulAffixes.has(t))
  }
  return false
}

/** Config entry shape for a single stat row in OutOfBattleStatsConfig.json. */
interface StatConfigEntry {
  key: string
  order: number
  defaultValue?: number
}

// ---- Config data ----

const config = outOfBattleStatsConfigRaw as {
  valueStats: StatConfigEntry[]
  percentageStats: StatConfigEntry[]
}

// ---- Helpers ----

/** Resolve a config key (PascalCase AffixType enum name) to its numeric value. */
function resolveAffixType(key: string): AffixType {
  const value = (AffixType as Record<string, unknown>)[key]
  if (typeof value === 'number') return value as AffixType
  return AffixType.Unknown
}

/** Sum bonus-stat values filtered by isPercentage flag. */
function sumBonusValues(values: ParsedBonusValue[], isPercentage: boolean): number {
  return values
    .filter((v) => v.isPercentage === isPercentage)
    .reduce((sum, v) => sum + v.value, 0)
}

/**
 * Iterate all 6 relic slots and accumulate computed affix values.
 * Main affixes and active sub-affixes (enhanceCount > 0) are included.
 */
function accumulateRelicValues(relicSet: RelicSet): Map<AffixType, number> {
  const map = new Map<AffixType, number>()

  const positions = [
    RelicPosition.Head,
    RelicPosition.Hands,
    RelicPosition.Body,
    RelicPosition.Feet,
    RelicPosition.Sphere,
    RelicPosition.Rope,
  ]

  for (const pos of positions) {
    const relic = relicSet.getRelic(pos)
    if (!relic) continue

    // Main affix
    const mainConfig = configService.getMainAffixConfig(relic.mainAffix.type)
    if (mainConfig) {
      const value = calculateMainAffixValue(relic.mainAffix, mainConfig)
      const prev = map.get(relic.mainAffix.type) ?? 0
      map.set(relic.mainAffix.type, prev + value)
    }

    // Active sub-affixes
    for (const sub of relic.subAffixes) {
      if (sub.enhanceCount <= 0) continue
      const subConfig = configService.getSubAffixConfig(sub.type)
      if (!subConfig) continue
      const value = calculateSubAffixValue(sub, subConfig)
      const prev = map.get(sub.type) ?? 0
      map.set(sub.type, prev + value)
    }
  }

  return map
}

/**
 * Value-stat formula (HP / ATK / DEF / SPD):
 *   final = base + base×(pctBonus/100) + base×(relicPct/100) + flatBonus + relicFlat
 */
function computeValueStat(
  baseValue: number,
  pctBonus: number,
  flatBonus: number,
  relicPct: number,
  relicFlat: number,
): number {
  return (
    baseValue +
    baseValue * (pctBonus / 100) +
    baseValue * (relicPct / 100) +
    flatBonus +
    relicFlat
  )
}

/**
 * Percentage-stat formula:
 *   final = defaultValue + bonusSum + relicVal
 */
function computePercentageStat(
  defaultValue: number,
  bonusSum: number,
  relicVal: number,
): number {
  return defaultValue + bonusSum + relicVal
}

/**
 * Two-pass elemental DMG boost resolution.
 * 1. If any element has positive bonus-stat contribution → return that element.
 * 2. Otherwise, return the element with the highest combined (bonus + relic) total > 0.
 * 3. If all totals are ≤ 0 → return null (hide the row).
 */
function resolveElementalDmgBoost(
  bonusStats: Record<string, ParsedBonusValue[]>,
  relicMap: Map<AffixType, number>,
): AffixType | null {
  // Pass 1: positive bonus contribution wins immediately
  for (const type of ELEMENTAL_DMG_TYPES) {
    const key = AffixType[type] // enum → string, e.g. "FireDmgBoost"
    const values = bonusStats[key]
    if (values && values.length > 0) {
      const sum = values.reduce((s, v) => s + v.value, 0)
      if (sum > 0) return type
    }
  }

  // Pass 2: highest combined total, must be > 0
  let bestType: AffixType | null = null
  let bestTotal = -Infinity

  for (const type of ELEMENTAL_DMG_TYPES) {
    const key = AffixType[type]
    const bonusSum =
      bonusStats[key]?.reduce((s, v) => s + v.value, 0) ?? 0
    const relicVal = relicMap.get(type) ?? 0
    const total = bonusSum + relicVal
    if (total > bestTotal) {
      bestTotal = total
      bestType = type
    }
  }

  return bestTotal > 0 ? bestType : null
}

// ---- Public API ----

/**
 * Compute the complete out-of-battle stats for a character with the current relic set.
 *
 * @param characterName  Display name of the character (for the result).
 * @param baseStatEntry  Parsed base + bonus stats from ConfigService, or undefined.
 * @param relicSet       The current 6-slot relic set.
 * @param usefulAffixes  Set of affix types considered "useful" for highlighting.
 * @param getAffixName   Function to resolve an AffixType to its localized display name.
 * @returns The stats ready for rendering, or null if no base stats are available.
 */
export function computeOutOfBattleStats(
  characterName: string,
  baseStatEntry: CharacterBaseStatEntry | undefined,
  relicSet: RelicSet,
  usefulAffixes: Set<AffixType>,
  getAffixName: (type: AffixType) => string,
): OutOfBattleStats | null {
  if (!baseStatEntry) return null

  const relicMap = accumulateRelicValues(relicSet)
  const bonusStats = baseStatEntry.bonusStats
  const items: OutOfBattleStatsItem[] = []

  // ---- Value stats (HP, ATK, DEF, SPD) ----
  for (const entry of config.valueStats.sort((a, b) => a.order - b.order)) {
    const affixType = resolveAffixType(entry.key)
    if (affixType === AffixType.Unknown) continue

    const relicPair = VALUE_STAT_RELIC_MAP[entry.key]
    if (!relicPair) continue

    // Base value from the character entry
    const baseKey = entry.key.charAt(0).toUpperCase() + entry.key.slice(1).toLowerCase()
    const baseValue =
      baseKey === 'Hp' ? baseStatEntry.baseStats.hp
      : baseKey === 'Atk' ? baseStatEntry.baseStats.atk
      : baseKey === 'Def' ? baseStatEntry.baseStats.def
      : baseKey === 'Spd' ? baseStatEntry.baseStats.spd
      : 0

    // Bonus contributions (percentage + flat separated by isPercentage flag)
    const bonusValues = bonusStats[entry.key] ?? []
    const bonusPct = sumBonusValues(bonusValues, true)
    const bonusFlat = sumBonusValues(bonusValues, false)

    // Relic contributions
    const relicPct = relicPair.pct !== null ? (relicMap.get(relicPair.pct) ?? 0) : 0
    const relicFlat = relicMap.get(relicPair.flat) ?? 0

    const value = computeValueStat(baseValue, bonusPct, bonusFlat, relicPct, relicFlat)

    items.push({
      affixType,
      displayName: getAffixName(affixType),
      value,
      isPercent: false,
      isUseful: isAffixUseful(affixType, usefulAffixes),
    })
  }

  // ---- Percentage stats ----
  for (const entry of config.percentageStats.sort((a, b) => a.order - b.order)) {
    // ElementalDmgBoost is a synthetic placeholder — resolve to a concrete element
    if (entry.key === 'ElementalDmgBoost') {
      const resolved = resolveElementalDmgBoost(bonusStats, relicMap)
      if (!resolved) continue // hide row entirely when no elemental DMG

      const bonusSum = (bonusStats[AffixType[resolved]] ?? []).reduce(
        (s, v) => s + v.value,
        0,
      )
      const relicVal = relicMap.get(resolved) ?? 0
      const value = computePercentageStat(entry.defaultValue ?? 0, bonusSum, relicVal)

      items.push({
        affixType: resolved,
        displayName: getAffixName(resolved),
        value,
        isPercent: true,
        isUseful: isAffixUseful(resolved, usefulAffixes),
      })
      continue
    }

    const affixType = resolveAffixType(entry.key)
    if (affixType === AffixType.Unknown) continue

    const bonusValues = bonusStats[entry.key] ?? []
    const bonusSum = bonusValues.reduce((s, v) => s + v.value, 0)
    const relicVal = relicMap.get(affixType) ?? 0
    const value = computePercentageStat(entry.defaultValue ?? 0, bonusSum, relicVal)

    items.push({
      affixType,
      displayName: getAffixName(affixType),
      value,
      isPercent: true,
      isUseful: isAffixUseful(affixType, usefulAffixes),
    })
  }

  return { characterName, items }
}
