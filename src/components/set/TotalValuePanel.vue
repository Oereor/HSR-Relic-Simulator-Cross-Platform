<template>
  <div class="bg-bg-card border border-card-border rounded-md p-4">
    <h3 class="text-accent-gold font-bold text-sm mb-3">
      {{ localeStore.t('ui.statistics.total_values') }}
    </h3>

    <!-- Empty state -->
    <p v-if="items.length === 0" class="text-text-muted text-xs">
      {{ localeStore.t('ui.statistics.empty') }}
    </p>

    <!-- Row list -->
    <div v-else class="flex flex-col gap-0.5">
      <div
        v-for="(item, idx) in items"
        :key="idx"
        class="rounded px-1.5 py-0.5 flex items-center gap-2 text-xs"
        :style="{ backgroundColor: rowBackground(item), color: textColor(item) }"
      >
        <!-- Affix name -->
        <span class="flex-1 truncate">{{ item.displayName }}</span>

        <!-- Percentage value (HP/ATK/DEF only) -->
        <span
          v-if="item.pctValue > 0"
          class="flex-shrink-0 tabular-nums"
        >
          +{{ fmt(item.pctValue, item.pctIsPercent) }}
        </span>

        <!-- Flat value (always shown when non-zero) -->
        <span
          v-if="item.flatValue > 0"
          class="flex-shrink-0 tabular-nums"
        >
          +{{ fmt(item.flatValue, item.flatIsPercent) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TotalValueItem } from '@/types/statistics'
import { useLocaleStore } from '@/stores/useLocaleStore'
import { getRowBackground, getTextColor } from '@/logic/RelicCardStyling'
import { formatValue } from '@/logic/AffixCalculator'

defineProps<{
  items: TotalValueItem[]
}>()

const localeStore = useLocaleStore()

/** Returns CSS background color. All rows are "activated" (isActivated=true). */
function rowBackground(item: TotalValueItem): string {
  return getRowBackground(item.styleType, true, () => item.isUseful)
}

/** Returns CSS text color. */
function textColor(item: TotalValueItem): string {
  return getTextColor(true, item.styleType, () => item.isUseful)
}

/** Formats a value using the project-wide affix formatter (i18n-consistent). */
function fmt(value: number, isPercent: boolean): string {
  return formatValue(value, isPercent)
}
</script>
