import { AffixType } from './enums'

export interface RelicSetStatistics {
  totalUsefulHits: number
  categoryHits: CategoryHitCount[]
}

export interface CategoryHitCount {
  type: AffixType
  count: number
  displayName: string
}

/**
 * Represents one row in the total-value statistics panel.
 *
 * HP/ATK/DEF are "merged" rows: flat and percentage values combined
 * into a single row displaying both components.
 *
 * All other affix types are "single" rows: the value is carried in
 * `flatValue` regardless of whether it represents a percentage.
 */
export interface TotalValueItem {
  /** AffixType used for styling (background/text color via RelicCardStyling). */
  styleType: AffixType

  /** Display label, e.g. "HP", "SPD", "CRIT Rate". */
  displayName: string

  /**
   * Primary numeric value (always present).
   * For single-type rows this is the only value.
   * For HP/ATK/DEF merged rows this is the flat (non-%) component.
   */
  flatValue: number

  /** Whether flatValue should be formatted with a "%" suffix. */
  flatIsPercent: boolean

  /**
   * Secondary numeric value — only used for HP/ATK/DEF merged rows.
   * This is the percentage component. 0 when not applicable.
   */
  pctValue: number

  /** Whether pctValue should be formatted with a "%" suffix. */
  pctIsPercent: boolean

  /** Whether this row should receive gold-highlight styling. */
  isUseful: boolean
}

export interface TotalValueStatistics {
  items: TotalValueItem[]
}
