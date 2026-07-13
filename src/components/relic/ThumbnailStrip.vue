<template>
  <div
    v-if="relics.length > 0"
    class="flex gap-2 overflow-x-auto pb-1"
  >
    <RelicThumbnail
      v-for="relic in relics"
      :key="relic.id"
      :relic="relic"
      :is-focused="relic.id === relicStore.focusRelicId"
      @click="relicStore.focusRelicById(relic.id)"
    />
  </div>
  <div
    v-else
    class="text-text-muted text-xs text-center py-2"
  >
    {{ localeStore.t('ui.thumbnail.empty') }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRelicStore } from '@/stores/useRelicStore'
import { useLocaleStore } from '@/stores/useLocaleStore'
import RelicThumbnail from './RelicThumbnail.vue'

const relicStore = useRelicStore()
const localeStore = useLocaleStore()

const relics = computed(() => relicStore.positionRelics)
</script>
