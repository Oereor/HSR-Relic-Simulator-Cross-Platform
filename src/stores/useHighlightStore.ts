/**
 * Pinia store for the highlight/checkbox grid.
 * Replaces C# HighlightConfigViewModel + HighlightService.
 *
 * Tracks which sub-affix types are "useful" and provides
 * the checkbox grid items for the HighlightConfigPanel.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AffixType } from '@/types/enums'
import { configService } from '@/logic/ConfigService'
import { useLocaleStore } from './useLocaleStore'

export interface HighlightCheckItem {
  type: AffixType
  displayName: string
  isChecked: boolean
}

export const useHighlightStore = defineStore('highlight', () => {
  const localeStore = useLocaleStore()

  /** Set of affix types the user has marked as "useful". */
  const usefulAffixes = ref<Set<AffixType>>(new Set())

  /** Items for the checkbox grid UI. */
  const items = computed<HighlightCheckItem[]>(() => {
    const validTypes = configService.getAllSubAffixTypes()
    return Array.from(validTypes)
      .filter(t => t !== AffixType.Unknown)
      .map(type => ({
        type,
        displayName: localeStore.getAffixName(type),
        isChecked: usefulAffixes.value.has(type),
      }))
  })

  function isUseful(type: AffixType): boolean {
    return usefulAffixes.value.has(type)
  }

  function setUseful(type: AffixType, useful: boolean): void {
    if (useful) {
      usefulAffixes.value.add(type)
    } else {
      usefulAffixes.value.delete(type)
    }
    // Trigger reactivity on the Set
    usefulAffixes.value = new Set(usefulAffixes.value)
  }

  return { usefulAffixes, items, isUseful, setUseful }
})
