/**
 * Pinia store for the cascading "Create Relic" dropdowns.
 * Replaces C# CreateRelicViewModel.
 *
 * Three cascading combo boxes: position → main affix → sub-affix 1 → sub-affix 2.
 * Changing an upstream selection resets all downstream selections.
 */
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { AffixType, RelicPosition } from '@/types/enums'
import type { AffixOption } from '@/types/ui'
import { configService } from '@/logic/ConfigService'
import { useLocaleStore } from './useLocaleStore'
import { useCharacterTemplateStore } from './useCharacterTemplateStore'

export const useCreateRelicStore = defineStore('createRelic', () => {
  const localeStore = useLocaleStore()
  const templateStore = useCharacterTemplateStore()

  const selectedPosition = ref<RelicPosition>(RelicPosition.Head)
  const designatedMainAffix = ref<AffixType | null>(null)
  const designatedSubAffix1 = ref<AffixType | null>(null)
  const designatedSubAffix2 = ref<AffixType | null>(null)

  // ---- Position options (all 6 equipment slots) ----

  /** Position options use a simple value/display pair distinct from AffixOption. */
  interface PositionOption {
    value: RelicPosition
    display: string
  }

  const positionOptions = computed<PositionOption[]>(() => {
    return [
      RelicPosition.Head,
      RelicPosition.Hands,
      RelicPosition.Body,
      RelicPosition.Feet,
      RelicPosition.Sphere,
      RelicPosition.Rope,
    ].map(pos => ({
      value: pos,
      display: localeStore.getPositionName(pos),
    }))
  })

  // ---- Whether the selected position has a fixed (single-option) main affix ----

  const isMainAffixFixed = computed<boolean>(() => {
    // Template lock takes precedence
    if (templateStore.isTemplateActive) {
      return templateStore.getTemplateMainAffix(selectedPosition.value) !== null
    }
    return configService.getAvailableMainAffixTypes(selectedPosition.value).length === 1
  })

  // ---- Available main affixes for selected position ----

  const availableMainAffixes = computed<AffixOption[]>(() => {
    const types = configService.getAvailableMainAffixTypes(selectedPosition.value)
    if (isMainAffixFixed.value) {
      return types.map(t => ({ value: t, display: localeStore.getAffixName(t) }))
    }
    return [
      { value: null, display: localeStore.t('ui.combo.random') },
      ...types.map(t => ({ value: t, display: localeStore.getAffixName(t) })),
    ]
  })

  // ---- Sub-affix 1: available types excluding the main affix ----

  const excludedForSub1 = computed<Set<AffixType>>(() => {
    const set = new Set<AffixType>()
    if (designatedMainAffix.value !== null) set.add(designatedMainAffix.value)
    return set
  })

  const availableSubAffixes1 = computed<AffixOption[]>(() => {
    if (designatedMainAffix.value === null) return []
    const types = configService.getAvailableSubAffixTypes(excludedForSub1.value)
    return [
      { value: null, display: localeStore.t('ui.combo.random') },
      ...types.map(t => ({ value: t, display: localeStore.getAffixName(t) })),
    ]
  })

  // ---- Sub-affix 2: available types excluding main + sub-affix 1 ----

  const excludedForSub2 = computed<Set<AffixType>>(() => {
    const set = new Set(excludedForSub1.value)
    if (designatedSubAffix1.value !== null) set.add(designatedSubAffix1.value)
    return set
  })

  const availableSubAffixes2 = computed<AffixOption[]>(() => {
    if (designatedSubAffix1.value === null) return []
    const types = configService.getAvailableSubAffixTypes(excludedForSub2.value)
    return [
      { value: null, display: localeStore.t('ui.combo.random') },
      ...types.map(t => ({ value: t, display: localeStore.getAffixName(t) })),
    ]
  })

  // ---- Visibility flags ----

  const isSubAffix1Visible = computed(
    () => designatedMainAffix.value !== null,
  )
  const isSubAffix2Visible = computed(() => designatedSubAffix1.value !== null)

  // ---- Cascading reset watchers ----

  watch(selectedPosition, () => {
    // Template lock takes precedence
    if (templateStore.isTemplateActive) {
      const templateAffix = templateStore.getTemplateMainAffix(selectedPosition.value)
      if (templateAffix !== null) {
        designatedMainAffix.value = templateAffix
        return
      }
    }
    // Fall back to existing behavior
    if (isMainAffixFixed.value) {
      const types = configService.getAvailableMainAffixTypes(selectedPosition.value)
      designatedMainAffix.value = types[0] ?? null
    } else {
      designatedMainAffix.value = null
    }
  })
  watch(designatedMainAffix, () => {
    designatedSubAffix1.value = null
  })
  watch(designatedSubAffix1, () => {
    designatedSubAffix2.value = null
  })

  // When template changes, re-apply the main affix for the current position
  watch(() => templateStore.selectedCharacter, () => {
    if (templateStore.isTemplateActive) {
      const templateAffix = templateStore.getTemplateMainAffix(selectedPosition.value)
      if (templateAffix !== null) {
        designatedMainAffix.value = templateAffix
      }
    }
    // On clear: leave designatedMainAffix unchanged per spec
  })

  // ---- Actions ----

  /** Gather the user-designated sub-affix types (max 2, nulls excluded). */
  function getDesignatedSubAffixTypes(): AffixType[] {
    const types: AffixType[] = []
    if (designatedSubAffix1.value !== null) types.push(designatedSubAffix1.value)
    if (designatedSubAffix2.value !== null) types.push(designatedSubAffix2.value)
    return types
  }

  return {
    selectedPosition,
    designatedMainAffix,
    designatedSubAffix1,
    designatedSubAffix2,
    isMainAffixFixed,
    positionOptions,
    availableMainAffixes,
    availableSubAffixes1,
    availableSubAffixes2,
    isSubAffix1Visible,
    isSubAffix2Visible,
    getDesignatedSubAffixTypes,
  }
})
