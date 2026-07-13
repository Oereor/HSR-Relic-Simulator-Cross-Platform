/**
 * Formats a numeric affix value for display.
 * Percent types show one decimal place with % suffix.
 * Non-percent types show rounded integer.
 */
export function formatAffixValue(value: number, isPercent: boolean): string {
  if (isPercent) {
    return `${value.toFixed(1)}%`
  }
  return `${Math.round(value)}`
}
