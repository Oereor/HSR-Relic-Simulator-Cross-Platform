<template>
  <div class="bg-bg-card border border-card-border rounded-md p-3">
    <SectionHeader>
      {{ localeStore.t('meta.useful_sub_affixes') }}
      <span v-if="highlightStore.isLocked" class="text-accent-gold text-[10px]">
        ({{ localeStore.t('ui.template.locked') }})
      </span>
    </SectionHeader>
    <div class="flex flex-wrap gap-x-3 gap-y-1">
      <label
        v-for="item in highlightStore.items"
        :key="item.type"
        class="flex items-center gap-1 cursor-pointer text-xs
               hover:text-accent-gold transition-colors"
      >
        <input
          type="checkbox"
          :checked="item.isChecked"
          :disabled="highlightStore.isLocked"
          class="w-3 h-3 accent-accent-gold cursor-pointer"
          :class="{ 'opacity-50 cursor-not-allowed': highlightStore.isLocked }"
          @change="highlightStore.setUseful(item.type, ($event.target as HTMLInputElement).checked)"
        />
        <span>{{ item.displayName }}</span>
      </label>
    </div>
    <p v-if="highlightStore.items.length === 0" class="text-text-muted text-xs">
      {{ localeStore.t('ui.highlight.none') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useHighlightStore } from '@/stores/useHighlightStore'
import { useLocaleStore } from '@/stores/useLocaleStore'
import SectionHeader from '@/components/ui/SectionHeader.vue'

const highlightStore = useHighlightStore()
const localeStore = useLocaleStore()
</script>
