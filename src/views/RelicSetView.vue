<template>
  <div class="min-h-screen bg-bg-dark text-text-primary p-4">
    <!-- Back navigation -->
    <RouterLink to="/" class="text-accent-gold text-sm mb-4 inline-block hover:underline">
      &larr; {{ localeStore.t('ui.window.title') }}
    </RouterLink>

    <h1 class="text-accent-gold text-xl font-bold mb-4">
      {{ localeStore.t('ui.relic_set.title') }}
      <span v-if="templateStore.isTemplateActive" class="text-text-muted text-base font-normal">
        — {{ localeStore.getCharacterName(templateStore.selectedCharacter!) }}
      </span>
    </h1>

    <!-- 6-slot grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <RelicSetSlot
        v-for="pos in positions"
        :key="pos"
        :position="pos"
        :relic="relicStore.currentSet.getRelic(pos) ?? null"
        @remove="relicSetStore.removeRelicFromSet(pos)"
      />
    </div>

    <!-- Statistics -->
    <StatisticsPanel
      :total-useful-hits="relicSetStore.statistics.totalUsefulHits"
      :category-hits="relicSetStore.statistics.categoryHits"
    />

    <!-- Out-of-Battle Stats (only when a character template is active) -->
    <OutOfBattleStatsPanel
      v-if="templateStore.isTemplateActive"
      :stats="relicSetStore.outOfBattleStats"
      class="mt-4"
    />

    <!-- Save / Load -->
    <div class="flex flex-wrap gap-4 mt-6 items-center">
      <GoldButton @click="handleSave">
        {{ localeStore.t('ui.relic_set.save') }}
      </GoldButton>
      <AppButton @click="handleLoad">
        {{ localeStore.t('ui.relic_set.load') }}
      </AppButton>
      <span class="text-text-muted text-sm">{{ relicSetStore.statusText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { RelicPosition } from '@/types/enums'
import { useRelicStore } from '@/stores/useRelicStore'
import { useRelicSetStore } from '@/stores/useRelicSetStore'
import { useLocaleStore } from '@/stores/useLocaleStore'
import { useCharacterTemplateStore } from '@/stores/useCharacterTemplateStore'
import { saveToFile, loadFromFile } from '@/utils/fileIO'
import RelicSetSlot from '@/components/set/RelicSetSlot.vue'
import StatisticsPanel from '@/components/set/StatisticsPanel.vue'
import OutOfBattleStatsPanel from '@/components/set/OutOfBattleStatsPanel.vue'
import GoldButton from '@/components/ui/GoldButton.vue'
import AppButton from '@/components/ui/AppButton.vue'

const relicStore = useRelicStore()
const relicSetStore = useRelicSetStore()
const localeStore = useLocaleStore()
const templateStore = useCharacterTemplateStore()

const positions = [
  RelicPosition.Head,
  RelicPosition.Hands,
  RelicPosition.Body,
  RelicPosition.Feet,
  RelicPosition.Sphere,
  RelicPosition.Rope,
]

async function handleSave(): Promise<void> {
  try {
    const json = relicSetStore.serializeSet()
    const name = await saveToFile(json, 'relic_set.json')
    relicSetStore.statusText = localeStore.t('ui.relic_set.save_success', name)
  } catch (err) {
    relicSetStore.statusText = localeStore.t('ui.relic_set.save_failed')
    console.error('Save failed:', err)
  }
}

async function handleLoad(): Promise<void> {
  try {
    const json = await loadFromFile()
    relicSetStore.deserializeSet(json)
    relicSetStore.statusText = localeStore.t('ui.relic_set.load_success')
  } catch (err) {
    relicSetStore.statusText = localeStore.t('ui.relic_set.load_failed')
    console.error('Load failed:', err)
  }
}
</script>
