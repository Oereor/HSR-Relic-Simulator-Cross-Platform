<template>
  <div
    ref="containerRef"
    class="relative inline-block w-full"
  >
    <!-- Trigger -->
    <button
      class="w-full bg-control-bg border border-control-border text-text-primary
             text-xs px-2 py-1.5 rounded flex items-center justify-between
             hover:border-accent-gold cursor-pointer"
      @click="toggleOpen"
    >
      <span :class="{ 'text-text-muted': !selectedDisplay }">
        {{ selectedDisplay || placeholder }}
      </span>
      <span class="text-text-muted ml-1">&#x25BC;</span>
    </button>

    <!-- Dropdown popover -->
    <div
      v-if="isOpen"
      class="absolute z-50 mt-0.5 w-full max-h-48 overflow-y-auto
             bg-dropdown-bg border border-control-border rounded shadow-lg"
    >
      <div
        v-for="option in options"
        :key="String(option.value)"
        class="px-2 py-1 cursor-pointer text-xs
               hover:bg-button-hover"
        :class="{
          'text-accent-gold': option.value === modelValue,
          'text-text-primary': option.value !== modelValue,
        }"
        @click="selectOption(option.value)"
      >
        {{ option.display }}
      </div>
      <div
        v-if="options.length === 0"
        class="px-2 py-1 text-text-muted text-xs"
      >
        No options
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Option<T> {
  value: T
  display: string
}

const props = defineProps<{
  options: Option<T>[]
  modelValue: T | null
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: T | null]
}>()

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const selectedDisplay = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined) return null
  const found = props.options.find(o => o.value === props.modelValue)
  return found?.display ?? null
})

function toggleOpen(): void {
  isOpen.value = !isOpen.value
}

function selectOption(value: T | null): void {
  emit('update:modelValue', value)
  isOpen.value = false
}

function onDocumentClick(event: MouseEvent): void {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>
