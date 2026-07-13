<template>
  <button
    class="flex-shrink-0 w-[110px] rounded border p-2 text-left cursor-pointer
           transition-colors"
    :class="thumbnailClasses"
    @click="$emit('click')"
  >
    <!-- Position name + level -->
    <div class="flex justify-between items-center mb-1">
      <span class="text-[11px] font-bold" :class="isFocused ? 'text-bg-dark' : 'text-accent-gold'">
        {{ positionName }}
      </span>
      <span class="text-[10px]" :class="isFocused ? 'text-bg-dark' : 'text-text-muted'">
        +{{ relic.level }}
      </span>
    </div>

    <!-- Main affix -->
    <div class="text-[11px] truncate" :class="isFocused ? 'text-bg-dark' : 'text-text-primary'">
      {{ mainAffixDisplay }}
    </div>

    <!-- Useful hits -->
    <div class="text-[10px] mt-0.5" :class="isFocused ? 'text-bg-dark' : 'text-text-muted'">
      ★ {{ usefulHits }}
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RelicData } from '@/types/relic'
import { configService } from '@/logic/ConfigService'
import { calculateMainAffixValue, formatValue } from '@/logic/AffixCalculator'
import { useHighlightStore } from '@/stores/useHighlightStore'
import { useLocaleStore } from '@/stores/useLocaleStore'

const props = withDefaults(
  defineProps<{
    relic: RelicData
    isFocused?: boolean
  }>(),
  {
    isFocused: false,
  },
)

defineEmits<{
  click: []
}>()

const highlightStore = useHighlightStore()
const localeStore = useLocaleStore()

const positionName = computed(() => localeStore.getPositionName(props.relic.position))

const mainAffixDisplay = computed(() => {
  const config = configService.getMainAffixConfig(props.relic.mainAffix.type)
  if (!config) return ''
  const value = calculateMainAffixValue(props.relic.mainAffix, config)
  return `${localeStore.getAffixName(props.relic.mainAffix.type)} ${formatValue(value, config.isPercent)}`
})

const usefulHits = computed(() => {
  return props.relic.subAffixes.reduce((sum, sub) => {
    if (highlightStore.isUseful(sub.type)) return sum + sub.enhanceCount
    return sum
  }, 0)
})

const thumbnailClasses = computed(() => {
  if (props.isFocused) {
    return 'bg-accent-gold border-accent-gold'
  }
  return 'bg-bg-card border-card-border hover:border-accent-gold'
})
</script>
