import { describe, it, expect, beforeEach } from 'vitest'
import { AffixType, RelicPosition } from '@/types/enums'
import { RandomWrapper } from '../RandomWrapper'
import { createNewRelic, reforgeRelicSubAffixes, populateSubAffixes } from '../RelicSystem'
import { createAffixData, createRelicData, enhanceAffix } from '../RelicData'
import { resetSharedRng } from '../RngService'

describe('RelicSystem', () => {
  let rng: RandomWrapper

  beforeEach(() => {
    rng = new RandomWrapper(42)
    resetSharedRng(42)
  })

  describe('createNewRelic', () => {
    it('creates a relic with valid structure', () => {
      const relic = createNewRelic(RelicPosition.Head, rng)

      expect(relic.position).toBe(RelicPosition.Head)
      expect(relic.level).toBe(0)
      expect(relic.mainAffix.isMainAffix).toBe(true)
      expect(relic.subAffixes).toHaveLength(4)
      expect(relic.id).toBeTruthy()
    })

    it('produces same relic with same seed', () => {
      const rng1 = new RandomWrapper(12345)
      const rng2 = new RandomWrapper(12345)

      const relic1 = createNewRelic(RelicPosition.Head, rng1)
      const relic2 = createNewRelic(RelicPosition.Head, rng2)

      expect(relic1.mainAffix.type).toBe(relic2.mainAffix.type)
      expect(relic1.subAffixes.map(s => s.type)).toEqual(relic2.subAffixes.map(s => s.type))
      expect(relic1.isFourInitSubAffixes).toBe(relic2.isFourInitSubAffixes)
    })

    it('uses designated main affix when specified', () => {
      const relic = createNewRelic(RelicPosition.Body, rng, AffixType.CritDmg)

      expect(relic.mainAffix.type).toBe(AffixType.CritDmg)
    })

    it('always creates 4 sub-affix slots', () => {
      const relic = createNewRelic(RelicPosition.Feet, rng)
      expect(relic.subAffixes).toHaveLength(4)
    })

    it('sub-affixes exclude the main affix type', () => {
      const relic = createNewRelic(RelicPosition.Head, rng, AffixType.Hp)

      // No sub-affix should be Hp (same as main)
      const hasMainTypeInSubs = relic.subAffixes.some(s => s.type === AffixType.Hp)
      expect(hasMainTypeInSubs).toBe(false)
    })

    it('respects designated sub-affixes', () => {
      const relic = createNewRelic(
        RelicPosition.Hands,
        rng,
        AffixType.Atk,
        [AffixType.CritRate, AffixType.CritDmg],
      )

      const subTypes = relic.subAffixes.map(s => s.type)
      expect(subTypes).toContain(AffixType.CritRate)
      expect(subTypes).toContain(AffixType.CritDmg)
      // Should all be unique
      expect(new Set(subTypes).size).toBe(4)
    })
  })

  describe('reforgeRelicSubAffixes', () => {
    it('throws if relic is not max level', () => {
      const relic = createRelicData(
        RelicPosition.Head,
        createAffixData(AffixType.Hp, true),
        [AffixType.CritRate, AffixType.Atk, AffixType.Spd, AffixType.HpPercentage].map(t => createAffixData(t, false)),
        true,
      )

      expect(() => reforgeRelicSubAffixes(relic)).toThrow('not at max level')
    })

    it('returns pre-reforge snapshot and modifies subs', () => {
      const relic = createRelicData(
        RelicPosition.Head,
        createAffixData(AffixType.Hp, true),
        [AffixType.CritRate, AffixType.Atk, AffixType.Spd, AffixType.HpPercentage].map(t => createAffixData(t, false)),
        true,
      )

      // Level to max (15)
      relic.levelUpToMax()
      expect(relic.level).toBe(15)

      // Save original state
      const originalTypes = relic.subAffixes.map(s => s.type)

      const snapshot = reforgeRelicSubAffixes(relic)

      // Snapshot should have same types as original
      expect(snapshot.map(s => s.type)).toEqual(originalTypes)

      // All sub types should be the same (reforge keeps types, resets values)
      expect(relic.subAffixes.map(s => s.type)).toEqual(originalTypes)

      // Each sub should have enhanceCount = 1 after reset
      for (const sub of relic.subAffixes) {
        expect(sub.enhanceCount).toBeGreaterThanOrEqual(1)
      }
    })

    it('respects excluded sub-affix index', () => {
      const relic = createRelicData(
        RelicPosition.Head,
        createAffixData(AffixType.Hp, true),
        [AffixType.CritRate, AffixType.Atk, AffixType.Spd, AffixType.HpPercentage].map(t => createAffixData(t, false)),
        true,
      )

      // Manually enhance sub[0] many times so it has high enhanceCount
      for (let i = 0; i < 10; i++) {
        enhanceAffix(relic.subAffixes[0], 2)
      }
      const sub0TotalBefore = relic.subAffixes[0].enhanceCount

      relic.level = 15 // Bypass level-up to test reforge directly
      relic.mainAffix.mainAffixLevel = 15

      // Reforge excluding index 0
      reforgeRelicSubAffixes(relic, 0)

      // Sub 0 should have been reset (enhanceCount = 1) since it was excluded from re-enhance
      // But it still got reset by ResetEnhance
      expect(relic.subAffixes[0].enhanceCount).toBe(1)
    })
  })

  describe('populateSubAffixes', () => {
    it('always returns 4 entries', () => {
      const subs = populateSubAffixes(AffixType.Hp, true, rng)
      expect(subs).toHaveLength(4)
    })

    it('excludes main affix type', () => {
      const subs = populateSubAffixes(AffixType.Hp, true, rng)
      const hasHp = subs.some(s => s.type === AffixType.Hp)
      expect(hasHp).toBe(false)
    })

    it('3-init makes 4th sub inactive', () => {
      const subs = populateSubAffixes(AffixType.Hp, false, rng)
      expect(subs).toHaveLength(4)
      expect(subs[3].enhanceCount).toBe(0)
    })

    it('4-init makes all subs active', () => {
      const subs = populateSubAffixes(AffixType.Hp, true, rng)
      expect(subs[3].enhanceCount).toBe(1)
    })

    it('all sub types are unique', () => {
      const subs = populateSubAffixes(AffixType.Hp, true, rng)
      const types = subs.map(s => s.type)
      expect(new Set(types).size).toBe(4)
    })
  })
})
