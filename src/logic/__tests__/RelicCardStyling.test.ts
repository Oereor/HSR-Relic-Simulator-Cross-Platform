import { describe, it, expect } from 'vitest'
import { AffixType } from '@/types/enums'
import { getRowBackground, getTextColor } from '../RelicCardStyling'

describe('RelicCardStyling', () => {
  const isUseful = (type: AffixType) => type === AffixType.CritRate

  describe('getRowBackground', () => {
    it('returns dimmed bg when not activated', () => {
      expect(getRowBackground(AffixType.CritRate, false, isUseful)).toBe('#16213E')
    })

    it('returns gold highlight when activated and useful', () => {
      expect(getRowBackground(AffixType.CritRate, true, isUseful)).toBe('#E2C275')
    })

    it('returns default bg when activated but not useful', () => {
      expect(getRowBackground(AffixType.Hp, true, isUseful)).toBe('#1E2D4A')
    })

    it('returns dimmed bg when not activated even if useful', () => {
      expect(getRowBackground(AffixType.CritRate, false, isUseful)).toBe('#16213E')
    })
  })

  describe('getTextColor', () => {
    it('returns dimmed text when not activated', () => {
      expect(getTextColor(false, AffixType.CritRate, isUseful)).toBe('#555555')
    })

    it('returns dark text when activated and useful (contrast on gold)', () => {
      expect(getTextColor(true, AffixType.CritRate, isUseful)).toBe('#1A1A2E')
    })

    it('returns bright text when activated but not useful', () => {
      expect(getTextColor(true, AffixType.Hp, isUseful)).toBe('#EAEAEA')
    })
  })
})
