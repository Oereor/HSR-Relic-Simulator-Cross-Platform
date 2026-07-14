<template>
  <div class="bg-bg-card border border-card-border rounded-md p-3 space-y-2">
    <SectionHeader>{{ localeStore.t('ui.template.header') }}</SectionHeader>

    <!-- Template selector combo -->
    <ComboBox
      :options="templateOptions"
      :model-value="templateStore.selectedCharacter"
      :placeholder="localeStore.t('ui.template.none')"
      @update:model-value="handleSelect"
    />

    <!-- Clear button (only visible when a template is active) -->
    <DarkButton
      v-if="templateStore.isTemplateActive"
      class="w-full"
      @click="templateStore.clearTemplate()"
    >
      {{ localeStore.t('ui.template.clear') }}
    </DarkButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCharacterTemplateStore } from '@/stores/useCharacterTemplateStore'
import { useLocaleStore } from '@/stores/useLocaleStore'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import ComboBox from '@/components/ui/ComboBox.vue'
import DarkButton from '@/components/ui/DarkButton.vue'

const templateStore = useCharacterTemplateStore()
const localeStore = useLocaleStore()

interface TemplateOption {
  value: string | null
  display: string
}

const templateOptions = computed<TemplateOption[]>(() => {
  return [
    { value: null, display: localeStore.t('ui.template.none') },
    ...templateStore.availableTemplates.map(t => ({
      value: t.character,
      display: localeStore.getCharacterName(t.character),
    })),
  ]
})

function handleSelect(value: string | null): void {
  if (value === null) {
    templateStore.clearTemplate()
  } else {
    templateStore.selectCharacter(value)
  }
}
</script>
