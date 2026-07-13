import { describe, it, expect } from 'vitest'
import { AffixType } from '@/types/enums'
import type { AffixData, MainAffixConfigEntry, SubAffixConfigEntry } from '@/types'
import { calculateMainAffixValue, calculateSubAffixValue, formatValue } from '../AffixCalculator'

describe('AffixCalculator', () => {
  const mainConfig: MainAffixConfigEntry = {
    type: AffixType.Hp,
    isPercent: false,
    baseValue: 112.896,
    levelUpStep: 39.5136,
  }

  const subConfig: SubAffixConfigEntry = {
    type: AffixType.CritRate,
    weight: 6,
    isPercent: true,
    baseValue: 2.59,
    extraEnhanceStep: 0.51,
  }

  it('calculateMainAffixValue uses BaseValue + Level * LevelUpStep', () => {
    const affix: AffixData = {
      type: AffixType.Hp,
      isMainAffix: true,
      mainAffixLevel: 5,
      enhanceCount: -1,
      extraEnhanceSteps: -1,
    }

    // 112.896 + 5 * 39.5136 = 112.896 + 197.568 = 310.464
    const result = calculateMainAffixValue(affix, mainConfig)
    expect(result).toBeCloseTo(310.464, 3)
  })

  it('calculateMainAffixValue at level 0 returns base value', () => {
    const affix: AffixData = {
      type: AffixType.Hp,
      isMainAffix: true,
      mainAffixLevel: 0,
      enhanceCount: -1,
      extraEnhanceSteps: -1,
    }

    expect(calculateMainAffixValue(affix, mainConfig)).toBeCloseTo(112.896, 3)
  })

  it('calculateMainAffixValue at level 15', () => {
    const affix: AffixData = {
      type: AffixType.Hp,
      isMainAffix: true,
      mainAffixLevel: 15,
      enhanceCount: -1,
      extraEnhanceSteps: -1,
    }

    // 112.896 + 15 * 39.5136 = 112.896 + 592.704 = 705.6
    expect(calculateMainAffixValue(affix, mainConfig)).toBeCloseTo(705.6, 3)
  })

  it('calculateSubAffixValue uses BaseValue * EnhanceCount + ExtraEnhanceStep * ExtraEnhanceSteps', () => {
    const affix: AffixData = {
      type: AffixType.CritRate,
      isMainAffix: false,
      mainAffixLevel: -1,
      enhanceCount: 3,
      extraEnhanceSteps: 4,
    }

    // 2.59 * 3 + 0.51 * 4 = 7.77 + 2.04 = 9.81
    const result = calculateSubAffixValue(affix, subConfig)
    expect(result).toBeCloseTo(9.81, 2)
  })

  it('calculateSubAffixValue with only base (enhanceCount=1, extra=0)', () => {
    const affix: AffixData = {
      type: AffixType.CritRate,
      isMainAffix: false,
      mainAffixLevel: -1,
      enhanceCount: 1,
      extraEnhanceSteps: 0,
    }

    expect(calculateSubAffixValue(affix, subConfig)).toBeCloseTo(2.59, 2)
  })

  it('formatValue formats percent values with one decimal', () => {
    expect(formatValue(9.81, true)).toBe('9.8%')
    expect(formatValue(2.59, true)).toBe('2.6%')
    expect(formatValue(0, true)).toBe('0.0%')
  })

  it('formatValue formats flat values as rounded integers', () => {
    expect(formatValue(310.464, false)).toBe('310')
    expect(formatValue(112.896, false)).toBe('113')
    expect(formatValue(705.6, false)).toBe('706')
  })
})
