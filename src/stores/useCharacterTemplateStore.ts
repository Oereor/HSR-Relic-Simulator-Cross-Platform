import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AffixType, RelicPosition } from '@/types/enums'
import type { CharacterTemplate } from '@/types/characterTemplate'
import { configService } from '@/logic/ConfigService'

export const useCharacterTemplateStore = defineStore('characterTemplate', () => {
  // ---- State ----

  /** Name of the selected character, or null if no template is active. */
  const selectedCharacter = ref<string | null>(null)

  // ---- Getters ----

  /** The full template object for the selected character. */
  const selectedTemplate = computed<CharacterTemplate | null>(() => {
    if (selectedCharacter.value === null) return null
    return configService.getCharacterTemplate(selectedCharacter.value) ?? null
  })

  /** Whether a character template is currently active. */
  const isTemplateActive = computed<boolean>(() => selectedTemplate.value !== null)

  /** All available templates for the dropdown. */
  const availableTemplates = computed<CharacterTemplate[]>(() =>
    configService.getAllCharacterTemplates(),
  )

  /**
   * Get the template-specified main affix for a given position.
   * Returns null for Head/Hands (not in template) or when no template is active.
   */
  function getTemplateMainAffix(position: RelicPosition): AffixType | null {
    const t = selectedTemplate.value
    if (!t) return null
    switch (position) {
      case RelicPosition.Body:  return t.mainAffixes.body
      case RelicPosition.Feet:  return t.mainAffixes.feet
      case RelicPosition.Sphere: return t.mainAffixes.sphere
      case RelicPosition.Rope:  return t.mainAffixes.rope
      default:                  return null  // Head, Hands, Unknown
    }
  }

  /**
   * Get the locked set of useful sub-affix types from the template.
   * Returns an empty set when no template is active.
   */
  function getTemplateUsefulSubAffixes(): Set<AffixType> {
    if (!selectedTemplate.value) return new Set()
    return new Set(selectedTemplate.value.effectiveSubAffixes)
  }

  // ---- Actions ----

  function selectCharacter(name: string): void {
    selectedCharacter.value = name
  }

  function clearTemplate(): void {
    selectedCharacter.value = null
  }

  return {
    selectedCharacter,
    selectedTemplate,
    isTemplateActive,
    availableTemplates,
    getTemplateMainAffix,
    getTemplateUsefulSubAffixes,
    selectCharacter,
    clearTemplate,
  }
})
