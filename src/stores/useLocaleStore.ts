/**
 * Pinia store wrapping LocalizationService with Vue reactivity.
 * Replaces C# LocalizationService INotifyPropertyChanged pattern.
 *
 * When currentLanguage changes, all computed properties that call
 * getAffixName() or getPositionName() automatically re-evaluate.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { localizationService } from '@/logic/LocalizationService'
import type { AffixType, RelicPosition } from '@/types/enums'

export const useLocaleStore = defineStore('locale', () => {
  const currentLanguage = ref<string>(localizationService.currentLanguage)

  const availableLanguages = computed<string[]>(() =>
    localizationService.availableLanguages,
  )

  /**
   * Localized string lookup with optional format args.
   * Usage in templates: {{ localeStore.t('ui.window.title') }}
   */
  function t(key: string, ...args: unknown[]): string {
    void currentLanguage.value
    return localizationService.get(key, ...args)
  }

  function getAffixName(type: AffixType): string {
    void currentLanguage.value
    return localizationService.getAffixName(type)
  }

  function getPositionName(pos: RelicPosition): string {
    void currentLanguage.value
    return localizationService.getPositionName(pos)
  }

  function setLanguage(code: string): void {
    localizationService.currentLanguage = code
    currentLanguage.value = code
  }

  return {
    currentLanguage,
    availableLanguages,
    t,
    getAffixName,
    getPositionName,
    setLanguage,
  }
})
