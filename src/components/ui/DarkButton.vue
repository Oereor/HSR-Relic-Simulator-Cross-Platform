<template>
  <button
    class="bg-[#2A3A5E] border border-[#3A4A6E] text-text-primary
           px-2 py-1 rounded text-[11px] cursor-pointer
           hover:bg-button-hover
           disabled:opacity-50 disabled:cursor-not-allowed"
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
