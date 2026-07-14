<template>
  <aside class="space-y-3">
    <CharacterTemplateSelector />
    <CreateRelicPanel />
    <HighlightConfigPanel />
    <AppButton class="w-full" @click="handleCreateRandomSet">
      {{ templateStore.isTemplateActive
          ? localeStore.t('ui.create.suitable_set_button')
          : localeStore.t('ui.create.random_set_button') }}
    </AppButton>
    <RouterLink to="/relic-set" class="block">
      <GoldButton class="w-full">
        {{ localeStore.t('ui.relic_set.open_button') }}
      </GoldButton>
    </RouterLink>
  </aside>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { AffixType, RelicPosition } from '@/types/enums'
import { useLocaleStore } from '@/stores/useLocaleStore'
import { useRelicStore } from '@/stores/useRelicStore'
import { useCharacterTemplateStore } from '@/stores/useCharacterTemplateStore'
import { createNewRelic } from '@/logic/RelicSystem'
import CreateRelicPanel from '@/components/create/CreateRelicPanel.vue'
import HighlightConfigPanel from '@/components/highlight/HighlightConfigPanel.vue'
import CharacterTemplateSelector from '@/components/template/CharacterTemplateSelector.vue'
import GoldButton from '@/components/ui/GoldButton.vue'
import AppButton from '@/components/ui/AppButton.vue'

const localeStore = useLocaleStore()
const relicStore = useRelicStore()
const templateStore = useCharacterTemplateStore()

const ALL_POSITIONS: RelicPosition[] = [
  RelicPosition.Head,
  RelicPosition.Hands,
  RelicPosition.Body,
  RelicPosition.Feet,
  RelicPosition.Sphere,
  RelicPosition.Rope,
]

function handleCreateRandomSet(): void {
  for (const pos of ALL_POSITIONS) {
    let mainAffixType = AffixType.Unknown
    if (templateStore.isTemplateActive) {
      const templateAffix = templateStore.getTemplateMainAffix(pos)
      if (templateAffix !== null) {
        mainAffixType = templateAffix
      }
    }
    const relic = createNewRelic(pos, undefined, mainAffixType)
    relicStore.addRelic(relic as any)
  }
}
</script>
