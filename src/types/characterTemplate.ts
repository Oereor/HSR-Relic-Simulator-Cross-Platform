import { AffixType } from './enums'

/**
 * Maps relic positions to their template-specified main affix.
 * Only Body, Feet, Sphere, Rope are included — Head and Hands
 * have fixed main affixes that cannot be changed.
 */
export interface CharacterTemplateMainAffixes {
  body: AffixType
  feet: AffixType
  sphere: AffixType
  rope: AffixType
}

export interface CharacterTemplate {
  /** Display name of the character (e.g. "Firefly"). */
  character: string
  /** Locked main affixes per position. */
  mainAffixes: CharacterTemplateMainAffixes
  /** Locked set of sub-affix types considered "useful." */
  effectiveSubAffixes: AffixType[]
}
