<template>
  <div class="bg-bg-card border border-card-border rounded-md p-4">
    <h3 class="text-accent-gold font-bold text-sm mb-3">
      {{ localeStore.t('ui.statistics.title') }}
    </h3>

    <div class="flex items-start gap-4">
      <!-- Circular total display -->
      <div
        class="w-20 h-20 rounded-full border-2 border-accent-gold
               flex items-center justify-center flex-shrink-0
               bg-bg-dark"
      >
        <span class="text-accent-gold text-xl font-bold tabular-nums">
          {{ totalUsefulHits }}
        </span>
      </div>

      <!-- Category capsules -->
      <div class="flex flex-wrap gap-1.5 flex-1">
        <div
          v-for="cat in categoryHits"
          :key="cat.type"
          class="bg-sub-row-bg border border-card-border rounded-full
                 px-2.5 py-1 text-xs flex items-center gap-1.5"
        >
          <span class="text-text-primary">{{ cat.displayName }}</span>
          <span class="text-accent-gold font-bold tabular-nums">{{ cat.count }}</span>
        </div>
        <p v-if="categoryHits.length === 0" class="text-text-muted text-xs">
          {{ localeStore.t('ui.statistics.empty') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CategoryHitCount } from '@/types/statistics'
import { useLocaleStore } from '@/stores/useLocaleStore'

withDefaults(
  defineProps<{
    totalUsefulHits?: number
    categoryHits?: CategoryHitCount[]
  }>(),
  {
    totalUsefulHits: 0,
    categoryHits: () => [],
  },
)

const localeStore = useLocaleStore()
</script>
