/**
 * Pure functions for determining sub-affix row styling.
 * Replaces C# RelicCardStyling. Returns CSS color strings.
 *
 * Color mapping (from C# WPF Brushes):
 *   DefaultActivatedBgBrush = #1E2D4A  → sub-row-bg
 *   DimmedBgBrush          = #16213E  → row-dimmed-bg
 *   HighlightBrush         = #E2C275  → row-highlight-bg (gold)
 *   DarkTextBrush          = #1A1A2E  → bg-dark (for contrast on gold bg)
 *   ActivatedTextBrush     = #EAEAEA  → text-primary
 *   DimmedTextBrush        = #555555  → text-dim
 */
import type { AffixType } from '@/types/enums'

/**
 * Returns the CSS background color for a sub-affix row.
 *
 * Rules (matching C# GetRowBackground):
 *   1. Not activated → dimmed (#16213E)
 *   2. Activated + useful → gold highlight (#E2C275)
 *   3. Activated + not useful → default (#1E2D4A)
 */
export function getRowBackground(
  type: AffixType,
  isActivated: boolean,
  isUseful: (type: AffixType) => boolean,
): string {
  if (!isActivated) return '#16213E'
  if (isUseful(type)) return '#E2C275'
  return '#1E2D4A'
}

/**
 * Returns the CSS text color for a sub-affix row.
 *
 * Rules (matching C# GetTextBrush):
 *   1. Not activated → dimmed (#555555)
 *   2. Activated + useful → dark (#1A1A2E)  (for contrast on gold)
 *   3. Activated + not useful → bright (#EAEAEA)
 */
export function getTextColor(
  isActivated: boolean,
  type: AffixType,
  isUseful: (type: AffixType) => boolean,
): string {
  if (!isActivated) return '#555555'
  if (isUseful(type)) return '#1A1A2E'
  return '#EAEAEA'
}
