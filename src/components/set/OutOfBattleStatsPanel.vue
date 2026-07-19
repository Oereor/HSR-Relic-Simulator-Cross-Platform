<template>
  <div class="bg-bg-card border border-card-border rounded-md p-4">
    <h3 class="text-accent-gold font-bold text-sm mb-3">
      {{ localeStore.t('ui.statistics.out_of_battle') }}
    </h3>

    <!-- Empty state: no template selected or no base stats available -->
    <p v-if="!stats || stats.items.length === 0" class="text-text-muted text-xs">
      {{ localeStore.t('ui.statistics.select_template_hint') }}
    </p>

    <!-- Stat rows -->
    <div v-else class="flex flex-col gap-0.5">
      <template v-for="(item, idx) in stats.items" :key="item.affixType">
        <!-- Separator between value stats and percentage stats -->
        <hr
          v-if="isFirstPctStat(idx)"
          class="border-card-border my-1"
        />

        <div
          class="rounded px-1.5 py-0.5 flex items-center gap-2 text-xs"
          :style="{ backgroundColor: rowBackground(item), color: textColor(item) }"
        >
          <span class="flex-1 truncate">{{ item.displayName }}</span>
          <span class="flex-shrink-0 tabular-nums">{{ fmt(item.value, item.isPercent) }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OutOfBattleStats, OutOfBattleStatsItem } from '@/types/outOfBattleStats'
import { useLocaleStore } from '@/stores/useLocaleStore'
import { getRowBackground, getTextColor } from '@/logic/RelicCardStyling'
import { formatValue } from '@/logic/AffixCalculator'

const props = withDefaults(
  defineProps<{
    stats: OutOfBattleStats | null
  }>(),
  {
    stats: null,
  },
)

const localeStore = useLocaleStore()

/** The index at which percentage stats start (after the 4 value stats). */
const PCT_START_INDEX = 4

/** Whether the item at this index is the first percentage stat (insert separator). */
function isFirstPctStat(idx: number): boolean {
  return idx === PCT_START_INDEX
}

/** Returns CSS background color. All rows are "activated" (isActivated=true). */
function rowBackground(item: OutOfBattleStatsItem): string {
  return getRowBackground(item.affixType, true, () => item.isUseful)
}

/** Returns CSS text color. */
function textColor(item: OutOfBattleStatsItem): string {
  return getTextColor(true, item.affixType, () => item.isUseful)
}

/** Formats a value using the project-wide affix formatter. */
function fmt(value: number, isPercent: boolean): string {
  return formatValue(value, isPercent)
}
</script>
