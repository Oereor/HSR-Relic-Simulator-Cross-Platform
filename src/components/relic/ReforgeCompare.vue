<template>
  <div class="flex gap-3">
    <!-- Original column -->
    <div class="flex-1">
      <div class="text-text-muted text-[11px] font-bold mb-1 uppercase tracking-wide">
        {{ localeStore.t('ui.reforge.original_header') }}
      </div>
      <SubAffixRow
        v-for="(affix, idx) in originalSubs"
        :key="'orig-' + idx"
        :affix="affix"
        :index="idx"
        :is-blocked="idx === blockedIndex"
        :can-block="false"
      />
    </div>

    <!-- Pending column -->
    <div class="flex-1">
      <div class="text-pending-highlight text-[11px] font-bold mb-1 uppercase tracking-wide">
        {{ localeStore.t('ui.reforge.pending_header') }}
      </div>
      <SubAffixRow
        v-for="(affix, idx) in reforgedSubs"
        :key="'ref-' + idx"
        :affix="affix"
        :index="idx"
        :is-blocked="idx === blockedIndex"
        :can-block="false"
        :accent-border="true"
      />
    </div>
  </div>

  <!-- Action buttons -->
  <div class="flex gap-2 mt-3 justify-center">
    <GoldButton @click="$emit('accept')">{{ localeStore.t('ui.reforge.accept') }}</GoldButton>
    <AppButton @click="$emit('revert')">{{ localeStore.t('ui.reforge.revert') }}</AppButton>
  </div>
</template>

<script setup lang="ts">
import type { AffixData } from '@/types/relic'
import { useLocaleStore } from '@/stores/useLocaleStore'
import SubAffixRow from './SubAffixRow.vue'
import GoldButton from '@/components/ui/GoldButton.vue'
import AppButton from '@/components/ui/AppButton.vue'

const localeStore = useLocaleStore()

defineProps<{
  originalSubs: AffixData[]
  reforgedSubs: AffixData[]
  blockedIndex: number | null
}>()

defineEmits<{
  accept: []
  revert: []
}>()
</script>
