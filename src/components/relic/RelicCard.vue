<template>
  <CardBorder v-if="relic" class="w-full max-w-[500px] mx-auto">
    <!-- Header: position + "In Set" badge + level -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <span class="text-accent-gold font-bold text-sm">
          {{ localeStore.getPositionName(relic.position) }}
        </span>
        <span
          v-if="isAssignedToSet"
          class="bg-accent-gold text-set-tag-text text-[10px] font-bold
                 px-1.5 py-0.5 rounded"
        >
          {{ localeStore.t('ui.relic_set.in_set') }}
        </span>
      </div>
      <span class="text-text-muted text-sm font-mono">+{{ relic.level }}</span>
    </div>

    <!-- Main affix bar -->
    <div class="bg-main-affix-bar rounded px-2 py-1.5 flex justify-between items-center">
      <span class="text-text-primary text-xs">{{ mainAffixName }}</span>
      <span class="text-accent-gold text-xs font-bold tabular-nums">{{ mainAffixValue }}</span>
    </div>

    <!-- Separator -->
    <hr class="border-card-border my-2" />

    <!-- Normal mode: sub-affix rows -->
    <template v-if="!hasPendingReforge">
      <SubAffixRow
        v-for="(affix, idx) in relic.subAffixes"
        :key="idx"
        :affix="affix"
        :index="idx"
        :is-blocked="blockedIndex === idx"
        :can-block="isMaxLevel && !hasPendingReforge"
        @toggle-block="toggleBlock(idx)"
      />
    </template>

    <!-- Reforge mode: compare view -->
    <template v-else>
      <ReforgeCompare
        :original-subs="preReforgeSubs"
        :reforged-subs="relic.subAffixes"
        :blocked-index="blockedIndex"
        @accept="acceptReforge"
        @revert="revertReforge"
      />
    </template>

    <!-- Action buttons row -->
    <div class="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-card-border">
      <!-- Level up buttons (hidden during reforge) -->
      <template v-if="!hasPendingReforge">
        <DarkButton :disabled="isMaxLevel" @click="levelUpX1">
          {{ localeStore.t('ui.level_up.x1') }}
        </DarkButton>
        <DarkButton :disabled="isMaxLevel" @click="levelUpToNextNode">
          {{ localeStore.t('ui.level_up.to_node') }}
        </DarkButton>
        <DarkButton :disabled="isMaxLevel" @click="levelUpToMax">
          {{ localeStore.t('ui.level_up.to_max') }}
        </DarkButton>

        <!-- Reforge button (only at max level) -->
        <GoldButton :disabled="!isMaxLevel" @click="executeReforge">
          {{ blockedIndex !== null
              ? localeStore.t('ui.reforge.button_blocked', blockedIndex + 1)
              : localeStore.t('ui.reforge.button') }}
        </GoldButton>

        <!-- Decompose button -->
        <DarkButton
          class="text-blocked-red hover:text-red-400"
          @click="handleDecompose"
        >
          {{ localeStore.t('ui.relic.decompose') }}
        </DarkButton>
      </template>

      <!-- Assign / Remove from set -->
      <AppButton
        v-if="!isAssignedToSet"
        class="ml-auto"
        @click="assignToSet"
      >
        {{ localeStore.t('ui.relic_set.assign') }}
      </AppButton>
      <AppButton
        v-else
        class="ml-auto"
        @click="removeFromSet"
      >
        {{ localeStore.t('ui.relic_set.remove') }}
      </AppButton>
    </div>
  </CardBorder>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RelicData } from '@/types/relic'
import { configService } from '@/logic/ConfigService'
import { calculateMainAffixValue, formatValue } from '@/logic/AffixCalculator'
import { useRelicCard } from '@/composables/useRelicCard'
import { useLocaleStore } from '@/stores/useLocaleStore'
import { useRelicStore } from '@/stores/useRelicStore'
import CardBorder from '@/components/ui/CardBorder.vue'
import DarkButton from '@/components/ui/DarkButton.vue'
import GoldButton from '@/components/ui/GoldButton.vue'
import AppButton from '@/components/ui/AppButton.vue'
import SubAffixRow from './SubAffixRow.vue'
import ReforgeCompare from './ReforgeCompare.vue'

const props = defineProps<{
  relic: RelicData
}>()

defineEmits<{
  modified: []
}>()

const localeStore = useLocaleStore()
const relicStore = useRelicStore()

const {
  isMaxLevel,
  hasPendingReforge,
  preReforgeSubs,
  blockedIndex,
  levelUpX1,
  levelUpToNextNode,
  levelUpToMax,
  executeReforge,
  acceptReforge,
  revertReforge,
  toggleBlock,
  assignToSet,
  removeFromSet,
  isAssignedToSet,
} = useRelicCard(props.relic as any)

function handleDecompose(): void {
  if (isAssignedToSet.value) {
    relicStore.removeFromSet(props.relic)
  }
  relicStore.deleteRelic(props.relic.id)
}

// --- Main affix display ---

const mainAffixName = computed(() =>
  localeStore.getAffixName(props.relic.mainAffix.type),
)

const mainAffixValue = computed(() => {
  const config = configService.getMainAffixConfig(props.relic.mainAffix.type)
  if (!config) return ''
  const value = calculateMainAffixValue(props.relic.mainAffix, config)
  return formatValue(value, config.isPercent)
})
</script>
