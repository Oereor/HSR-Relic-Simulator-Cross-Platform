/**
 * Composable providing reactive display properties for a single sub-affix row.
 * Replaces C# SubAffixRowViewModel.
 *
 * Each field is a computed ref — Vue only re-renders DOM nodes that actually
 * changed (e.g., leveling up doesn't rebuild the entire row list).
 */
import { computed } from 'vue'
import type { AffixData } from '@/types/relic'
import { configService } from '@/logic/ConfigService'
import { calculateSubAffixValue, formatValue } from '@/logic/AffixCalculator'
import { getRowBackground, getTextColor } from '@/logic/RelicCardStyling'
import { useHighlightStore } from '@/stores/useHighlightStore'
import { useLocaleStore } from '@/stores/useLocaleStore'

export function useSubAffixRow(affix: AffixData) {
  const highlightStore = useHighlightStore()
  const localeStore = useLocaleStore()

  const isActivated = computed(() => affix.enhanceCount > 0)

  const affixName = computed(() => localeStore.getAffixName(affix.type))

  const affixValue = computed(() => {
    const config = configService.getSubAffixConfig(affix.type)
    if (!config) return ''
    const value = calculateSubAffixValue(affix, config)
    return `+${formatValue(value, config.isPercent)}`
  })

  const enhanceBadge = computed(() => {
    if (!isActivated.value) return ''
    return `×${affix.enhanceCount - 1}`
  })

  const rowBackground = computed(() => {
    return getRowBackground(affix.type, isActivated.value, highlightStore.isUseful)
  })

  const textColor = computed(() => {
    return getTextColor(isActivated.value, affix.type, highlightStore.isUseful)
  })

  return {
    isActivated,
    affixName,
    affixValue,
    enhanceBadge,
    rowBackground,
    textColor,
  }
}
