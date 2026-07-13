/**
 * Pure functions for calculating affix values.
 * Replaces C# AffixCalculator. Zero framework dependencies.
 */
import type { AffixData } from '@/types/relic'
import type { MainAffixConfigEntry, SubAffixConfigEntry } from '@/types/config'
import { formatAffixValue } from '@/utils/format'

/**
 * Calculates the current value of a main affix.
 * Formula: BaseValue + MainAffixLevel × LevelUpStep
 * Matches C# AffixCalculator.CalculateMainAffixValue()
 */
export function calculateMainAffixValue(
  affix: AffixData,
  config: MainAffixConfigEntry,
): number {
  return config.baseValue + affix.mainAffixLevel * config.levelUpStep
}

/**
 * Calculates the current value of a sub-affix.
 * Formula: BaseValue × EnhanceCount + ExtraEnhanceStep × ExtraEnhanceSteps
 * Matches C# AffixCalculator.CalculateSubAffixValue()
 */
export function calculateSubAffixValue(
  affix: AffixData,
  config: SubAffixConfigEntry,
): number {
  return config.baseValue * affix.enhanceCount + config.extraEnhanceStep * affix.extraEnhanceSteps
}

/**
 * Formats an affix value for display.
 * Percent types → "X.X%", flat types → rounded integer string.
 * Matches C# AffixCalculator.FormatValue()
 */
export { formatAffixValue as formatValue }
