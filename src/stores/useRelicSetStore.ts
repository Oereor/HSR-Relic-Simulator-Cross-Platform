/**
 * Pinia store for the relic set management view.
 * Replaces C# RelicSetViewModel + StatisticsViewModel.
 *
 * Provides computed statistics, save/load integration, and slot management.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RelicPosition } from '@/types/enums'
import type { RelicSetStatistics } from '@/types/statistics'
import { computeStatistics } from '@/logic/StatisticsService'
import { serialize, deserialize } from '@/logic/SaveLoadService'
import { RelicSet } from '@/types/relic'
import { useRelicStore } from './useRelicStore'
import { useHighlightStore } from './useHighlightStore'
import { useLocaleStore } from './useLocaleStore'

export const useRelicSetStore = defineStore('relicSet', () => {
  const statusText = ref<string>('')
  const relicStore = useRelicStore()
  const highlightStore = useHighlightStore()
  const localeStore = useLocaleStore()

  /** Computed statistics for the current relic set. */
  const statistics = computed<RelicSetStatistics>(() => {
    return computeStatistics(
      relicStore.currentSet,
      highlightStore.usefulAffixes,
      (type) => localeStore.getAffixName(type),
    )
  })

  function serializeSet(): string {
    return serialize(relicStore.currentSet)
  }

  function deserializeSet(json: string): void {
    const set = deserialize(json, RelicSet)
    relicStore.loadSet(set)
  }

  function removeRelicFromSet(pos: RelicPosition): void {
    relicStore.currentSet.removeRelic(pos)
    relicStore.currentSet = relicStore.currentSet.clone()
  }

  return {
    statusText,
    statistics,
    serializeSet,
    deserializeSet,
    removeRelicFromSet,
  }
})
