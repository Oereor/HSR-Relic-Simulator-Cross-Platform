<template>
  <button
    class="flex flex-col items-center justify-center px-3 py-2 rounded
           text-xs cursor-pointer transition-colors border min-w-[100px]"
    :class="bannerClasses"
    @click="$emit('select')"
  >
    <span class="font-bold">{{ displayName }}</span>
    <span
      v-if="count > 0"
      class="text-[10px] mt-0.5"
      :class="isSelected ? 'text-bg-dark' : 'text-text-muted'"
    >
      {{ count }}
    </span>
    <span v-else class="text-[10px] mt-0.5 text-text-dim">—</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RelicPosition } from '@/types/enums'

const props = withDefaults(
  defineProps<{
    position: RelicPosition
    displayName: string
    count?: number
    isSelected?: boolean
  }>(),
  {
    count: 0,
    isSelected: false,
  },
)

defineEmits<{
  select: []
}>()

const bannerClasses = computed(() => {
  if (props.isSelected) {
    return 'bg-accent-gold text-bg-dark border-accent-gold'
  }
  if (props.count > 0) {
    return 'bg-bg-card text-text-primary border-card-border hover:border-accent-gold'
  }
  return 'bg-bg-dark text-text-dim border-control-border'
})
</script>
