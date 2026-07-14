/**
 * Pinia store for the highlight/checkbox grid.
 * Replaces C# HighlightConfigViewModel + HighlightService.
 *
 * Tracks which sub-affix types are "useful" and provides
 * the checkbox grid items for the HighlightConfigPanel.
 */
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { AffixType } from '@/types/enums'
import { configService } from '@/logic/ConfigService'
import { useLocaleStore } from './useLocaleStore'
import { useCharacterTemplateStore } from './useCharacterTemplateStore'

export interface HighlightCheckItem {
  type: AffixType
  displayName: string
  isChecked: boolean
}

export const useHighlightStore = defineStore('highlight', () => {
  const localeStore = useLocaleStore()
  const templateStore = useCharacterTemplateStore()

  /** Set of affix types the user has marked as "useful". */
  const usefulAffixes = ref<Set<AffixType>>(new Set())

  /** Whether the highlight panel is locked by a character template. */
  const isLocked = computed<boolean>(() => templateStore.isTemplateActive)

  // When a template is selected, lock useful affixes to the template's set.
  // On clear, leave usefulAffixes unchanged per spec.
  watch(() => templateStore.selectedCharacter, (newChar) => {
    if (newChar !== null) {
      usefulAffixes.value = templateStore.getTemplateUsefulSubAffixes()
    }
  })

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
    if (templateStore.isTemplateActive) return  // locked by template
    if (useful) {
      usefulAffixes.value.add(type)
    } else {
      usefulAffixes.value.delete(type)
    }
    // Trigger reactivity on the Set
    usefulAffixes.value = new Set(usefulAffixes.value)
  }

  return { usefulAffixes, items, isUseful, setUseful, isLocked }
})
