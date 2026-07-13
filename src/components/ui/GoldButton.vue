<template>
  <button
    class="bg-[#8B7332] border border-accent-gold text-accent-gold
           font-bold px-4 py-1.5 rounded text-xs cursor-pointer
           hover:bg-button-hover hover:border-accent-gold
           active:bg-button-pressed
           disabled:text-text-muted disabled:opacity-50 disabled:cursor-not-allowed"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  disabled?: boolean
}>()
</script>
