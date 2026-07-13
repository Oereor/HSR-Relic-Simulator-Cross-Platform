<template>
  <CardBorder>
    <!-- Empty slot -->
    <div v-if="!relic" class="text-center py-6">
      <div class="text-accent-gold text-sm font-bold mb-1">
        {{ localeStore.getPositionName(position) }}
      </div>
      <div class="text-text-dim text-xs">{{ localeStore.t('ui.relic_set.empty_slot') }}</div>
    </div>

    <!-- Filled slot -->
    <template v-else>
      <!-- Header: position + level -->
      <div class="flex justify-between items-center mb-2">
        <span class="text-accent-gold font-bold text-sm">
          {{ localeStore.getPositionName(position) }}
        </span>
        <span class="text-text-muted text-sm font-mono">+{{ relic.level }}</span>
      </div>

      <!-- Main affix bar -->
      <div class="bg-main-affix-bar rounded px-2 py-1.5 flex justify-between items-center mb-2">
        <span class="text-text-primary text-xs">{{ mainAffixName }}</span>
        <span class="text-accent-gold text-xs font-bold tabular-nums">{{ mainAffixValue }}</span>
      </div>

      <!-- Sub-affix rows -->
      <SubAffixRow
        v-for="(affix, idx) in relic.subAffixes"
        :key="idx"
        :affix="affix"
        :index="idx"
        :can-block="false"
      />

      <!-- Useful hits and remove -->
      <div class="flex justify-between items-center mt-2 pt-2 border-t border-card-border">
        <span class="text-text-muted text-xs">
          ★ {{ usefulHits }} {{ localeStore.t('ui.relic_set.useful_hits') }}
        </span>
        <AppButton @click="$emit('remove')">
          {{ localeStore.t('ui.relic_set.remove') }}
        </AppButton>
      </div>
    </template>
  </CardBorder>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RelicData } from '@/types/relic'
import { RelicPosition } from '@/types/enums'
import { configService } from '@/logic/ConfigService'
import { calculateMainAffixValue, formatValue } from '@/logic/AffixCalculator'
import { useHighlightStore } from '@/stores/useHighlightStore'
import { useLocaleStore } from '@/stores/useLocaleStore'
import CardBorder from '@/components/ui/CardBorder.vue'
import AppButton from '@/components/ui/AppButton.vue'
import SubAffixRow from '@/components/relic/SubAffixRow.vue'

const props = withDefaults(
  defineProps<{
    position: RelicPosition
    relic: RelicData | null
  }>(),
  {
    relic: null,
  },
)

defineEmits<{
  remove: []
}>()

const highlightStore = useHighlightStore()
const localeStore = useLocaleStore()

const mainAffixName = computed(() => {
  if (!props.relic) return ''
  return localeStore.getAffixName(props.relic.mainAffix.type)
})

const mainAffixValue = computed(() => {
  if (!props.relic) return ''
  const config = configService.getMainAffixConfig(props.relic.mainAffix.type)
  if (!config) return ''
  const value = calculateMainAffixValue(props.relic.mainAffix, config)
  return formatValue(value, config.isPercent)
})

const usefulHits = computed(() => {
  if (!props.relic) return 0
  return props.relic.subAffixes.reduce((sum, sub) => {
    if (highlightStore.isUseful(sub.type)) return sum + sub.enhanceCount
    return sum
  }, 0)
})
</script>
