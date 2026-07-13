<template>
  <div class="grid grid-cols-6 gap-1">
    <PositionBanner
      v-for="banner in banners"
      :key="banner.position"
      :position="banner.position"
      :display-name="banner.displayName"
      :count="banner.count"
      :is-selected="banner.position === relicStore.selectedPosition"
      @select="relicStore.selectPosition(banner.position)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RelicPosition } from '@/types/enums'
import { useRelicStore } from '@/stores/useRelicStore'
import { useLocaleStore } from '@/stores/useLocaleStore'
import PositionBanner from './PositionBanner.vue'

const relicStore = useRelicStore()
const localeStore = useLocaleStore()

interface BannerInfo {
  position: RelicPosition
  displayName: string
  count: number
}

const banners = computed<BannerInfo[]>(() => {
  return [
    RelicPosition.Head,
    RelicPosition.Hands,
    RelicPosition.Body,
    RelicPosition.Feet,
    RelicPosition.Sphere,
    RelicPosition.Rope,
  ].map(pos => ({
    position: pos,
    displayName: localeStore.getPositionName(pos),
    count: relicStore.positionCounts.get(pos) ?? 0,
  }))
})
</script>
