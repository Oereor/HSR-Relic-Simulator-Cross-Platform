import { describe, it, expect } from 'vitest'
import { AffixType, RelicPosition } from '@/types/enums'
import { RelicSet } from '@/types/relic'
import type { RelicData, AffixData } from '@/types/relic'
import { computeStatistics } from '../StatisticsService'

function makeMockRelic(
  position: RelicPosition,
  subTypes: AffixType[],
  subEnhanceCounts: number[],
): RelicData {
  const subAffixes: AffixData[] = subTypes.map((type, i) => ({
    type,
    isMainAffix: false,
    mainAffixLevel: -1,
    enhanceCount: subEnhanceCounts[i] ?? 1,
    extraEnhanceSteps: 0,
  }))

  return {
    id: crypto.randomUUID(),
    position,
    level: 15,
    isFourInitSubAffixes: true,
    mainAffix: {
      type: AffixType.Hp,
      isMainAffix: true,
      mainAffixLevel: 15,
      enhanceCount: -1,
      extraEnhanceSteps: -1,
    },
    subAffixes,
  }
}

function mockGetAffixName(type: AffixType): string {
  return AffixType[type]
}

describe('StatisticsService', () => {
  it('returns zero totals for an empty set', () => {
    const set = new RelicSet()
    const useful = new Set([AffixType.CritRate])
    const stats = computeStatistics(set, useful, mockGetAffixName)

    expect(stats.totalUsefulHits).toBe(0)
    expect(stats.categoryHits).toHaveLength(0)
  })

  it('counts EnhanceCount for useful sub-affixes', () => {
    const set = new RelicSet()
    const relic = makeMockRelic(
      RelicPosition.Head,
      [AffixType.CritRate, AffixType.Hp, AffixType.Atk, AffixType.Spd],
      [3, 2, 1, 1],
    )
    set.relics.set(RelicPosition.Head, relic)

    const useful = new Set([AffixType.CritRate])
    const stats = computeStatistics(set, useful, mockGetAffixName)

    expect(stats.totalUsefulHits).toBe(3)
    expect(stats.categoryHits).toHaveLength(1)
    expect(stats.categoryHits[0].type).toBe(AffixType.CritRate)
    expect(stats.categoryHits[0].count).toBe(3)
  })

  it('sums across multiple relics and multiple useful types', () => {
    const set = new RelicSet()
    set.relics.set(
      RelicPosition.Head,
      makeMockRelic(RelicPosition.Head, [AffixType.CritRate, AffixType.Hp, AffixType.Atk, AffixType.Spd], [3, 2, 1, 1]),
    )
    set.relics.set(
      RelicPosition.Hands,
      makeMockRelic(RelicPosition.Hands, [AffixType.CritRate, AffixType.CritDmg, AffixType.Atk, AffixType.Spd], [2, 4, 1, 1]),
    )

    const useful = new Set([AffixType.CritRate, AffixType.CritDmg])
    const stats = computeStatistics(set, useful, mockGetAffixName)

    // Head: CritRate=3, Hands: CritRate=2 + CritDmg=4 => total = 9
    expect(stats.totalUsefulHits).toBe(9)
    expect(stats.categoryHits).toHaveLength(2)

    // Should be sorted descending
    expect(stats.categoryHits[0].count).toBeGreaterThanOrEqual(stats.categoryHits[1].count)
  })

  it('non-activated subs (enhanceCount=0) contribute 0', () => {
    const set = new RelicSet()
    const relic = makeMockRelic(
      RelicPosition.Feet,
      [AffixType.CritRate, AffixType.Hp, AffixType.Atk, AffixType.Spd],
      [0, 2, 1, 1], // 4th sub inactive (3-init pattern)
    )
    relic.isFourInitSubAffixes = false
    set.relics.set(RelicPosition.Feet, relic)

    const useful = new Set([AffixType.CritRate, AffixType.Hp, AffixType.Spd])
    const stats = computeStatistics(set, useful, mockGetAffixName)

    // CritRate=0, Hp=2, Spd=1 => total = 3
    expect(stats.totalUsefulHits).toBe(3)
  })
})
