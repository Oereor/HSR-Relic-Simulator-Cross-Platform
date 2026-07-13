<template>
  <div
    class="rounded px-1.5 py-0.5 my-0.5 flex items-center gap-2 text-xs"
    :style="computedStyle"
    :class="{
      'border-l-[3px] border-l-blocked-red': isBlocked,
      'border-l-[3px] border-l-pending-highlight': accentBorder && !isBlocked,
    }"
  >
    <!-- Block toggle button -->
    <button
      v-if="canBlock"
      class="w-5 h-4 p-0 text-xs leading-none flex-shrink-0
             bg-transparent border-0 cursor-pointer"
      @click="$emit('toggle-block')"
    >
      <span v-if="isBlocked" class="text-blocked-red">&#9940;</span>
    </button>

    <span :style="{ color: textColor }" class="flex-1 truncate">{{ affixName }}</span>
    <span :style="{ color: textColor }" class="flex-shrink-0 tabular-nums">{{ affixValue }}</span>
    <span
      v-if="enhanceBadge"
      class="text-text-muted text-[11px] flex-shrink-0"
    >
      {{ enhanceBadge }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AffixData } from '@/types/relic'
import { useSubAffixRow } from '@/composables/useSubAffixRow'

const props = withDefaults(
  defineProps<{
    affix: AffixData
    index: number
    isBlocked?: boolean
    canBlock?: boolean
    accentBorder?: boolean
  }>(),
  {
    isBlocked: false,
    canBlock: false,
    accentBorder: false,
  },
)

defineEmits<{
  'toggle-block': []
}>()

const { isActivated, affixName, affixValue, enhanceBadge, rowBackground, textColor } =
  useSubAffixRow(props.affix)

const computedStyle = computed(() => ({
  backgroundColor: rowBackground.value,
}))
</script>
