<template>
  <main class="flex-1 flex flex-col min-w-0">
    <!-- Position banners row -->
    <PositionBannerRow class="mb-3" />

    <!-- Focus relic card: scrollable if content overflows -->
    <div class="flex-1 overflow-y-auto">
      <RelicCard
        v-if="relicStore.focusRelic"
        :relic="relicStore.focusRelic"
        :key="relicStore.focusRelic.id"
        @modified="onModified"
      />
      <div v-else class="text-text-muted text-center mt-12">
        {{ localeStore.t('ui.relic_set.empty_slot') }}
      </div>
    </div>

    <!-- Thumbnail strip: bottom, horizontal scroll -->
    <ThumbnailStrip class="mt-3 border-t border-card-border pt-2" />
  </main>
</template>

<script setup lang="ts">
import { useRelicStore } from '@/stores/useRelicStore'
import { useLocaleStore } from '@/stores/useLocaleStore'
import PositionBannerRow from '@/components/relic/PositionBannerRow.vue'
import RelicCard from '@/components/relic/RelicCard.vue'
import ThumbnailStrip from '@/components/relic/ThumbnailStrip.vue'

const relicStore = useRelicStore()
const localeStore = useLocaleStore()

function onModified(): void {
  // Relic was modified (level-up, reforge, etc.).
  // Vue reactivity handles the UI update automatically.
  // This hook allows future extensibility (e.g., analytics, undo history).
}
</script>
