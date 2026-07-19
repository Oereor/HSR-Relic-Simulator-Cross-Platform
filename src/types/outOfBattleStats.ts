import type { AffixType } from './enums'

/** One row in the Out-of-Battle Stats panel. */
export interface OutOfBattleStatsItem {
  affixType: AffixType
  displayName: string
  value: number
  isPercent: boolean
  isUseful: boolean
}

/** Complete out-of-battle stats result for a single character. */
export interface OutOfBattleStats {
  characterName: string
  items: OutOfBattleStatsItem[]
}
