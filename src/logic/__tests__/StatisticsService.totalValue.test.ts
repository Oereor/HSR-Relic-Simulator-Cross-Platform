import { describe, it, expect } from 'vitest'
import { AffixType, RelicPosition } from '@/types/enums'
import { RelicSet } from '@/types/relic'
import type { RelicData, AffixData } from '@/types/relic'
import { computeTotalValueStatistics } from '../StatisticsService'
import { configService } from '../ConfigService'
import { calculateMainAffixValue, calculateSubAffixValue } from '../AffixCalculator'

function makeRelic(
  position: RelicPosition,
  mainType: AffixType,
  mainLevel: number,
  subTypes: AffixType[],
  subEnhanceCounts: number[],
): RelicData {
  const mainAffix: AffixData = {
    type: mainType,
    isMainAffix: true,
    mainAffixLevel: mainLevel,
    enhanceCount: -1,
    extraEnhanceSteps: -1,
  }

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
    level: mainLevel,
    isFourInitSubAffixes: true,
    mainAffix,
    subAffixes,
  }
}

function mockGetAffixName(type: AffixType): string {
  return AffixType[type]
}

describe('computeTotalValueStatistics', () => {
  // ---- Test 1: Empty set ----
  it('returns empty items for an empty set', () => {
    const set = new RelicSet()
    const result = computeTotalValueStatistics(
      set,
      new Set(),
      null,
      mockGetAffixName,
    )

    expect(result.items).toHaveLength(0)
  })

  // ---- Test 2: Single relic with main + sub affixes ----
  it('correctly sums main and sub affix values per type', () => {
    const set = new RelicSet()
    const relic = makeRelic(
      RelicPosition.Head,
      AffixType.Hp,        // main affix
      15,                   // main level
      [AffixType.CritRate, AffixType.Atk, AffixType.Spd],
      [3, 2, 1],
    )
    set.relics.set(RelicPosition.Head, relic)

    const result = computeTotalValueStatistics(
      set,
      new Set(),
      null,
      mockGetAffixName,
    )

    // Should have items for Hp (main), CritRate (sub), Atk (sub), Spd (sub)
    // Plus main affix Atk and Spd might not exist, only sub values
    const hpItem = result.items.find(i => i.styleType === AffixType.Hp)
    expect(hpItem).toBeDefined()

    // Compute expected HP main affix value
    const hpCfg = configService.getMainAffixConfig(AffixType.Hp)
    expect(hpCfg).toBeDefined()
    const expectedHp = calculateMainAffixValue(relic.mainAffix, hpCfg!)
    expect(hpItem!.flatValue).toBe(expectedHp)

    // CritRate should be from sub only
    const critItem = result.items.find(i => i.styleType === AffixType.CritRate)
    expect(critItem).toBeDefined()
    const critCfg = configService.getSubAffixConfig(AffixType.CritRate)
    expect(critCfg).toBeDefined()
    const expectedCrit = calculateSubAffixValue(
      { type: AffixType.CritRate, isMainAffix: false, mainAffixLevel: -1, enhanceCount: 3, extraEnhanceSteps: 0 },
      critCfg!,
    )
    expect(critItem!.flatValue).toBe(expectedCrit)
  })

  // ---- Test 3: HP flat + HP% merged ----
  it('merges Hp flat and HpPercentage into a single row', () => {
    const set = new RelicSet()
    // Head: main Hp (flat)
    set.relics.set(
      RelicPosition.Head,
      makeRelic(RelicPosition.Head, AffixType.Hp, 15, [AffixType.HpPercentage], [3]),
    )
    // Hands: main HpPercentage
    set.relics.set(
      RelicPosition.Hands,
      makeRelic(RelicPosition.Hands, AffixType.HpPercentage, 15, [AffixType.Hp], [2]),
    )

    const result = computeTotalValueStatistics(
      set,
      new Set(),
      null,
      mockGetAffixName,
    )

    const hpItem = result.items.find(i => i.styleType === AffixType.Hp)
    expect(hpItem).toBeDefined()
    expect(hpItem!.flatValue).toBeGreaterThan(0)  // flat HP from main + sub
    expect(hpItem!.flatIsPercent).toBe(false)
    expect(hpItem!.pctValue).toBeGreaterThan(0)   // HP% from main + sub
    expect(hpItem!.pctIsPercent).toBe(true)

    // Should NOT have a separate HpPercentage row
    const hpPctItem = result.items.find(i => i.styleType === AffixType.HpPercentage)
    expect(hpPctItem).toBeUndefined()
  })

  // ---- Test 4: ATK flat + ATK% merged ----
  it('merges Atk flat and AtkPercentage into a single row', () => {
    const set = new RelicSet()
    set.relics.set(
      RelicPosition.Head,
      makeRelic(RelicPosition.Head, AffixType.Atk, 15, [AffixType.AtkPercentage], [3]),
    )

    const result = computeTotalValueStatistics(
      set,
      new Set(),
      null,
      mockGetAffixName,
    )

    const atkItem = result.items.find(i => i.styleType === AffixType.Atk)
    expect(atkItem).toBeDefined()
    expect(atkItem!.flatValue).toBeGreaterThan(0)
    expect(atkItem!.flatIsPercent).toBe(false)
    expect(atkItem!.pctValue).toBeGreaterThan(0)
    expect(atkItem!.pctIsPercent).toBe(true)

    const atkPctItem = result.items.find(i => i.styleType === AffixType.AtkPercentage)
    expect(atkPctItem).toBeUndefined()
  })

  // ---- Test 5: DEF flat + DEF% merged ----
  it('merges Def flat and DefPercentage into a single row', () => {
    const set = new RelicSet()
    // Def has no main affix config, so provide both as sub-affixes
    set.relics.set(
      RelicPosition.Head,
      makeRelic(RelicPosition.Head, AffixType.Hp, 15, [AffixType.Def, AffixType.DefPercentage], [2, 3]),
    )

    const result = computeTotalValueStatistics(
      set,
      new Set(),
      null,
      mockGetAffixName,
    )

    const defItem = result.items.find(i => i.styleType === AffixType.Def)
    expect(defItem).toBeDefined()
    expect(defItem!.flatValue).toBeGreaterThan(0)
    expect(defItem!.flatIsPercent).toBe(false)
    expect(defItem!.pctValue).toBeGreaterThan(0)
    expect(defItem!.pctIsPercent).toBe(true)

    const defPctItem = result.items.find(i => i.styleType === AffixType.DefPercentage)
    expect(defPctItem).toBeUndefined()
  })

  // ---- Test 6: HP only (no HP%) ----
  it('creates HP row with pctValue=0 when only flat HP exists', () => {
    const set = new RelicSet()
    set.relics.set(
      RelicPosition.Head,
      makeRelic(RelicPosition.Head, AffixType.Hp, 15, [AffixType.CritRate], [1]),
    )

    const result = computeTotalValueStatistics(
      set,
      new Set(),
      null,
      mockGetAffixName,
    )

    const hpItem = result.items.find(i => i.styleType === AffixType.Hp)
    expect(hpItem).toBeDefined()
    expect(hpItem!.flatValue).toBeGreaterThan(0)
    expect(hpItem!.pctValue).toBe(0)
    expect(hpItem!.pctIsPercent).toBe(false)
  })

  // ---- Test 7: Inactive sub-affix excluded ----
  it('excludes sub-affixes with enhanceCount=0', () => {
    const set = new RelicSet()
    const relic = makeRelic(
      RelicPosition.Head,
      AffixType.Hp,
      15,
      [AffixType.CritRate, AffixType.Atk],
      [0, 2], // CritRate is inactive (0), Atk is active (2)
    )
    set.relics.set(RelicPosition.Head, relic)

    const result = computeTotalValueStatistics(
      set,
      new Set(),
      null,
      mockGetAffixName,
    )

    // Atk should appear (from sub)
    const atkItem = result.items.find(i => i.styleType === AffixType.Atk)
    expect(atkItem).toBeDefined()

    // CritRate should NOT appear (inactive sub)
    const critItem = result.items.find(i => i.styleType === AffixType.CritRate)
    expect(critItem).toBeUndefined()
  })

  // ---- Test 8: Useful highlighting WITH template ----
  it('marks rows as useful when matching template main-affixes or useful sub-affixes', () => {
    const set = new RelicSet()
    set.relics.set(
      RelicPosition.Head,
      makeRelic(RelicPosition.Head, AffixType.Hp, 15,
        [AffixType.CritRate, AffixType.CritDmg, AffixType.Spd],
        [3, 2, 1]),
    )
    set.relics.set(
      RelicPosition.Body,
      makeRelic(RelicPosition.Body, AffixType.CritDmg, 15,
        [AffixType.HpPercentage],
        [2]),
    )

    // Template main affixes: CritDmg (body), HpPercentage (feet), etc.
    const templateMainTypes = new Set([AffixType.CritDmg, AffixType.HpPercentage])
    // Useful sub-affixes: CritRate, Spd
    const usefulSubs = new Set([AffixType.CritRate, AffixType.Spd])

    const result = computeTotalValueStatistics(
      set,
      usefulSubs,
      templateMainTypes,
      mockGetAffixName,
    )

    // HP should be useful (HpPercentage is in template main affixes)
    const hpItem = result.items.find(i => i.styleType === AffixType.Hp)
    expect(hpItem).toBeDefined()
    expect(hpItem!.isUseful).toBe(true) // HpPercentage is template main affix

    // CritRate should be useful (in useful sub-affixes)
    const critRateItem = result.items.find(i => i.styleType === AffixType.CritRate)
    expect(critRateItem).toBeDefined()
    expect(critRateItem!.isUseful).toBe(true)

    // CritDmg should be useful (in template main affixes)
    const critDmgItem = result.items.find(i => i.styleType === AffixType.CritDmg)
    expect(critDmgItem).toBeDefined()
    expect(critDmgItem!.isUseful).toBe(true)

    // Spd should be useful (in useful sub-affixes)
    const spdItem = result.items.find(i => i.styleType === AffixType.Spd)
    expect(spdItem).toBeDefined()
    expect(spdItem!.isUseful).toBe(true)

    // Atk should NOT be useful (only appears from sub on Head via makeRelic, but Atk sub count was 2 in test 7...)
    // Actually in this test we don't have Atk sub. Let's check: all items should be useful here.
    const nonUsefulItems = result.items.filter(i => !i.isUseful)
    // Some items may be non-useful if they exist but aren't in either set
    // All items in this test should be useful since every type present is covered
  })

  // ---- Test 9: Useful highlighting WITHOUT template ----
  it('marks rows as useful only from usefulSubAffixes when template is null', () => {
    const set = new RelicSet()
    set.relics.set(
      RelicPosition.Head,
      makeRelic(RelicPosition.Head, AffixType.Hp, 15,
        [AffixType.CritRate, AffixType.Atk],
        [3, 2]),
    )
    set.relics.set(
      RelicPosition.Body,
      makeRelic(RelicPosition.Body, AffixType.CritDmg, 15,
        [AffixType.Spd],
        [1]),
    )

    // Only CritRate is a useful sub-affix
    const usefulSubs = new Set([AffixType.CritRate])

    const result = computeTotalValueStatistics(
      set,
      usefulSubs,
      null, // no template
      mockGetAffixName,
    )

    // CritRate should be useful
    const critRateItem = result.items.find(i => i.styleType === AffixType.CritRate)
    expect(critRateItem).toBeDefined()
    expect(critRateItem!.isUseful).toBe(true)

    // CritDmg (main affix on Body) should NOT be useful (no template)
    const critDmgItem = result.items.find(i => i.styleType === AffixType.CritDmg)
    expect(critDmgItem).toBeDefined()
    expect(critDmgItem!.isUseful).toBe(false)

    // Atk should NOT be useful
    const atkItem = result.items.find(i => i.styleType === AffixType.Atk)
    expect(atkItem).toBeDefined()
    expect(atkItem!.isUseful).toBe(false)

    // HP should NOT be useful
    const hpItem = result.items.find(i => i.styleType === AffixType.Hp)
    expect(hpItem).toBeDefined()
    expect(hpItem!.isUseful).toBe(false)
  })

  // ---- Test 10: Non-appearing type excluded ----
  it('excludes affix types with zero total value', () => {
    const set = new RelicSet()
    // Only HP main affix, no other types
    set.relics.set(
      RelicPosition.Head,
      makeRelic(RelicPosition.Head, AffixType.Hp, 15, [], []),
    )

    const result = computeTotalValueStatistics(
      set,
      new Set(),
      null,
      mockGetAffixName,
    )

    // Should only have HP
    const allTypes = result.items.map(i => i.styleType)
    expect(allTypes).toContain(AffixType.Hp)
    expect(allTypes).not.toContain(AffixType.Atk)
    expect(allTypes).not.toContain(AffixType.Def)
    expect(allTypes).not.toContain(AffixType.CritRate)
    expect(allTypes).not.toContain(AffixType.Spd)
  })

  // ---- Test 11: Sort order — merged rows first, then alphabetically ----
  it('sorts merged rows (HP/ATK/DEF) first, then alphabetically', () => {
    const set = new RelicSet()
    // Create relics with various types scattered across positions
    set.relics.set(
      RelicPosition.Head,
      makeRelic(RelicPosition.Head, AffixType.Hp, 15,
        [AffixType.CritRate, AffixType.Spd],
        [3, 1]),
    )
    set.relics.set(
      RelicPosition.Hands,
      makeRelic(RelicPosition.Hands, AffixType.Atk, 15,
        [AffixType.BreakEffect],
        [2]),
    )
    set.relics.set(
      RelicPosition.Body,
      makeRelic(RelicPosition.Body, AffixType.CritDmg, 15,
        [AffixType.Def],
        [1]),
    )

    const result = computeTotalValueStatistics(
      set,
      new Set(),
      null,
      mockGetAffixName,
    )

    const names = result.items.map(i => i.displayName)
    // First three should be HP, ATK, DEF (merged rows)
    expect(names[0]).toBe('Hp')       // AffixType[1] = "Hp"
    expect(names[1]).toBe('Atk')      // AffixType[2] = "Atk"
    expect(names[2]).toBe('Def')      // AffixType[3] = "Def"

    // Remaining should be alphabetically sorted
    const remaining = names.slice(3)
    const sortedRemaining = [...remaining].sort((a, b) => a.localeCompare(b))
    expect(remaining).toEqual(sortedRemaining)
  })
})
