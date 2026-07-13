import { describe, it, expect, beforeEach } from 'vitest'
import { AffixType, RelicPosition } from '@/types/enums'
import { createRelicData, createAffixData, enhanceAffix, resetAffixEnhance } from '../RelicData'
import { resetSharedRng } from '../RngService'

function makeSubAffixes(isFourInit: boolean) {
  const types = [AffixType.CritRate, AffixType.Hp, AffixType.Atk, AffixType.Spd]
  return types.map((type, i) => {
    const affix = createAffixData(type, false)
    if (i === 3 && !isFourInit) {
      affix.enhanceCount = 0
      affix.extraEnhanceSteps = 0
    }
    return affix
  })
}

describe('RelicData', () => {

  beforeEach(() => {
    resetSharedRng(42)
  })

  it('creates a relic with level 0', () => {
    const mainAffix = createAffixData(AffixType.Hp, true)
    const relic = createRelicData(RelicPosition.Head, mainAffix, makeSubAffixes(true), true)

    expect(relic.level).toBe(0)
    expect(relic.id).toBeTruthy()
    expect(relic.position).toBe(RelicPosition.Head)
    expect(relic.mainAffix.type).toBe(AffixType.Hp)
    expect(relic.subAffixes).toHaveLength(4)
  })

  it('levelUp increments level and main affix level', () => {
    const relic = createRelicData(RelicPosition.Head, createAffixData(AffixType.Hp, true), makeSubAffixes(true), true)

    relic.levelUp()
    expect(relic.level).toBe(1)
    expect(relic.mainAffix.mainAffixLevel).toBe(1)
  })

  it('at level 3, enhances a random sub-affix for 4-init relics', () => {
    const relic = createRelicData(RelicPosition.Head, createAffixData(AffixType.Hp, true), makeSubAffixes(true), true)

    // Level up to 3
    relic.levelUp() // 1
    relic.levelUp() // 2
    relic.levelUp() // 3 → enhance triggers

    expect(relic.level).toBe(3)
    // At least one sub should have enhanceCount > 1
    const enhanced = relic.subAffixes.some(s => s.enhanceCount > 1)
    expect(enhanced).toBe(true)
  })

  it('at level 3, activates 4th sub for 3-init relics', () => {
    const relic = createRelicData(RelicPosition.Head, createAffixData(AffixType.Hp, true), makeSubAffixes(false), false)

    // 4th sub should start inactive
    expect(relic.subAffixes[3].enhanceCount).toBe(0)

    // Level to 3
    relic.levelUp() // 1
    relic.levelUp() // 2
    relic.levelUp() // 3 → 4th sub activates

    expect(relic.subAffixes[3].enhanceCount).toBe(1)
  })

  it('at level 6, 9, 12, 15 always enhances random sub', () => {
    const relic = createRelicData(RelicPosition.Head, createAffixData(AffixType.Hp, true), makeSubAffixes(true), true)

    // Level to 6
    relic.levelUpBy(6)

    expect(relic.level).toBe(6)
    // Sum of enhanceCounts should be at least 4 (base) + 2 (level 3 + level 6) = 6
    const totalEnhance = relic.subAffixes.reduce((sum, s) => sum + s.enhanceCount, 0)
    expect(totalEnhance).toBeGreaterThanOrEqual(6)
  })

  it('levelUp does nothing at max level', () => {
    const relic = createRelicData(RelicPosition.Head, createAffixData(AffixType.Hp, true), makeSubAffixes(true), true)

    relic.levelUpToMax()
    expect(relic.level).toBe(15)

    const enhanceBefore = relic.subAffixes.map(s => s.enhanceCount)
    relic.levelUp()
    expect(relic.subAffixes.map(s => s.enhanceCount)).toEqual(enhanceBefore)
  })

  it('levelUpToNextNode jumps to next multiple of 3', () => {
    const relic = createRelicData(RelicPosition.Head, createAffixData(AffixType.Hp, true), makeSubAffixes(true), true)

    relic.levelUpToNextNode() // 0 → 3
    expect(relic.level).toBe(3)

    relic.levelUpToNextNode() // 3 → 6
    expect(relic.level).toBe(6)
  })

  it('levelUpToMax reaches 15', () => {
    const relic = createRelicData(RelicPosition.Head, createAffixData(AffixType.Hp, true), makeSubAffixes(true), true)

    relic.levelUpToMax()
    expect(relic.level).toBe(15)
    expect(relic.isMaxLevel).toBe(true)
  })

  it('enhanceRandomSubAffixExcluding avoids the excluded index', () => {
    const relic = createRelicData(RelicPosition.Head, createAffixData(AffixType.Hp, true), makeSubAffixes(true), true)

    const beforeEnhance = relic.subAffixes[0].enhanceCount
    // Call many times — index 0 should never be enhanced
    for (let i = 0; i < 50; i++) {
      relic.enhanceRandomSubAffixExcluding(0)
    }
    expect(relic.subAffixes[0].enhanceCount).toBe(beforeEnhance)
    // At least one other sub should be enhanced
    const othersEnhanced = relic.subAffixes.slice(1).some(s => s.enhanceCount > beforeEnhance)
    expect(othersEnhanced).toBe(true)
  })
})

describe('AffixData helpers', () => {
  it('createAffixData sets correct defaults for main affix', () => {
    const affix = createAffixData(AffixType.Spd, true)
    expect(affix.isMainAffix).toBe(true)
    expect(affix.mainAffixLevel).toBe(0)
    expect(affix.enhanceCount).toBe(-1)
    expect(affix.extraEnhanceSteps).toBe(-1)
  })

  it('createAffixData sets correct defaults for sub-affix', () => {
    const affix = createAffixData(AffixType.CritRate, false)
    expect(affix.isMainAffix).toBe(false)
    expect(affix.mainAffixLevel).toBe(-1)
    expect(affix.enhanceCount).toBe(1)
    expect(affix.extraEnhanceSteps).toBe(0)
  })

  it('enhanceAffix increments counts', () => {
    const affix = createAffixData(AffixType.CritRate, false)
    enhanceAffix(affix, 2)
    expect(affix.enhanceCount).toBe(2)
    expect(affix.extraEnhanceSteps).toBe(2)
  })

  it('resetAffixEnhance resets to base', () => {
    const affix = createAffixData(AffixType.CritRate, false)
    enhanceAffix(affix, 2)
    enhanceAffix(affix, 1)
    resetAffixEnhance(affix, 1)
    expect(affix.enhanceCount).toBe(1)
    expect(affix.extraEnhanceSteps).toBe(1)
  })
})
