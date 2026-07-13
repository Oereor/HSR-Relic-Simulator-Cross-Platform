<template>
  <div class="min-h-screen bg-bg-dark text-text-primary">
    <!-- Main grid: sidebar + content -->
    <div class="flex flex-col md:flex-row h-[calc(100vh-36px)]">
      <!-- Left sidebar: 290px fixed on desktop, full-width on mobile -->
      <aside
        class="w-full md:w-[290px] flex-shrink-0 overflow-y-auto p-3 space-y-3
               bg-bg-dark"
      >
        <LeftPanel />
      </aside>

      <!-- Right main area -->
      <RightPanel class="flex-1 p-3" />
    </div>

    <!-- Bottom language bar -->
    <LanguageToggle />
  </div>
</template>

<script setup lang="ts">
import LeftPanel from '@/components/layout/LeftPanel.vue'
import RightPanel from '@/components/layout/RightPanel.vue'
import LanguageToggle from '@/components/layout/LanguageToggle.vue'
</script>
