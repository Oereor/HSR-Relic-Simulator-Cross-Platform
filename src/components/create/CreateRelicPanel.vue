<template>
  <div class="bg-bg-card border border-card-border rounded-md p-3 space-y-2">
    <SectionHeader>{{ localeStore.t('meta.create_relic') }}</SectionHeader>

    <!-- Position selector -->
    <div>
      <label class="text-text-muted text-[11px] block mb-0.5">
        {{ localeStore.t('meta.position') }}
      </label>
      <ComboBox
        :options="createStore.positionOptions"
        :model-value="createStore.selectedPosition"
        placeholder="—"
        @update:model-value="setSelectedPosition"
      />
    </div>

    <!-- Main affix selector -->
    <div>
      <label class="text-text-muted text-[11px] block mb-0.5">
        {{ localeStore.t('meta.main_affix') }}
      </label>
      <ComboBox
        :options="createStore.availableMainAffixes"
        :model-value="createStore.designatedMainAffix"
        :placeholder="createStore.isMainAffixFixed ? ' ' : localeStore.t('ui.combo.random')"
        @update:model-value="createStore.designatedMainAffix = $event"
      />
    </div>

    <!-- Sub-affix 1 -->
    <div v-if="createStore.isSubAffix1Visible">
      <label class="text-text-muted text-[11px] block mb-0.5">
        {{ localeStore.t('meta.sub_affix') }} 1
      </label>
      <ComboBox
        :options="createStore.availableSubAffixes1"
        :model-value="createStore.designatedSubAffix1"
        :placeholder="localeStore.t('ui.combo.random')"
        @update:model-value="createStore.designatedSubAffix1 = $event"
      />
    </div>

    <!-- Sub-affix 2 -->
    <div v-if="createStore.isSubAffix2Visible">
      <label class="text-text-muted text-[11px] block mb-0.5">
        {{ localeStore.t('meta.sub_affix') }} 2
      </label>
      <ComboBox
        :options="createStore.availableSubAffixes2"
        :model-value="createStore.designatedSubAffix2"
        :placeholder="localeStore.t('ui.combo.random')"
        @update:model-value="createStore.designatedSubAffix2 = $event"
      />
    </div>

    <!-- Create button -->
    <GoldButton class="w-full mt-2" @click="handleCreate">
      {{ localeStore.t('meta.create_relic') }}
    </GoldButton>
  </div>
</template>

<script setup lang="ts">
import { RelicPosition } from '@/types/enums'
import { useCreateRelicStore } from '@/stores/useCreateRelicStore'
import { useRelicStore } from '@/stores/useRelicStore'
import { useLocaleStore } from '@/stores/useLocaleStore'
import { createNewRelic } from '@/logic/RelicSystem'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import GoldButton from '@/components/ui/GoldButton.vue'
import ComboBox from '@/components/ui/ComboBox.vue'

const createStore = useCreateRelicStore()
const relicStore = useRelicStore()
const localeStore = useLocaleStore()

function setSelectedPosition(value: RelicPosition | null): void {
  if (value !== null) createStore.selectedPosition = value
}

function handleCreate(): void {
  const relic = createNewRelic(
    createStore.selectedPosition,
    undefined,                                    // rng: use shared
    createStore.designatedMainAffix ?? undefined,  // mainAffixType
    createStore.getDesignatedSubAffixTypes(),      // designatedSubAffixes
  )
  relicStore.addRelic(relic as any)
}
</script>
