import { AffixType, RelicPosition } from './enums'

// ============================================================
// TODO: Full interfaces are documented in DESIGN.md Section 10.
// The JSON configs use kebab-case field names like "is-percent",
// "base-value", "level-up-step". The ConfigService should handle
// the mapping from raw JSON shape to these camelCase interfaces.
// ============================================================

export interface MainAffixConfigEntry {
  type: AffixType
  isPercent: boolean
  baseValue: number
  levelUpStep: number
}

export interface SubAffixConfigEntry {
  type: AffixType
  weight: number
  isPercent: boolean
  baseValue: number
  extraEnhanceStep: number
}

export interface MainAffixProbabilityEntry {
  position: RelicPosition
  availableMainAffixes: MainAffixOption[]
}

export interface MainAffixOption {
  type: AffixType
  probability: number
}
