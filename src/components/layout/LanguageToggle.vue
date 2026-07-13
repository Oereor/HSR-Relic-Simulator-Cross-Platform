<template>
  <div class="flex justify-center gap-2 py-1.5 border-t border-card-border bg-bg-dark">
    <button
      v-for="lang in localeStore.availableLanguages"
      :key="lang"
      class="px-3 py-0.5 rounded text-xs cursor-pointer transition-colors"
      :class="{
        'bg-accent-gold text-bg-dark font-bold': lang === localeStore.currentLanguage,
        'bg-bg-card text-text-muted hover:text-accent-gold': lang !== localeStore.currentLanguage,
      }"
      @click="localeStore.setLanguage(lang)"
    >
      {{ lang.toUpperCase() }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useLocaleStore } from '@/stores/useLocaleStore'

const localeStore = useLocaleStore()
</script>
