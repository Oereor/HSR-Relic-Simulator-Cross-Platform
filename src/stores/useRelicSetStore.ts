/**
 * Pinia store for the relic set management view.
 * Replaces C# RelicSetViewModel + StatisticsViewModel.
 *
 * Provides computed statistics, save/load integration, and slot management.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AffixType } from '@/types/enums'
import type { RelicPosition } from '@/types/enums'
import type { RelicSetStatistics, TotalValueStatistics } from '@/types/statistics'
import type { OutOfBattleStats } from '@/types/outOfBattleStats'
import { computeStatistics, computeTotalValueStatistics } from '@/logic/StatisticsService'
import { computeOutOfBattleStats } from '@/logic/OutOfBattleStatsService'
import { configService } from '@/logic/ConfigService'
import { serialize, deserialize } from '@/logic/SaveLoadService'
import { RelicSet } from '@/types/relic'
import { useRelicStore } from './useRelicStore'
import { useHighlightStore } from './useHighlightStore'
import { useLocaleStore } from './useLocaleStore'
import { useCharacterTemplateStore } from './useCharacterTemplateStore'

export const useRelicSetStore = defineStore('relicSet', () => {
  const statusText = ref<string>('')
  const relicStore = useRelicStore()
  const highlightStore = useHighlightStore()
  const localeStore = useLocaleStore()
  const templateStore = useCharacterTemplateStore()

  /** Computed statistics for the current relic set. */
  const statistics = computed<RelicSetStatistics>(() => {
    return computeStatistics(
      relicStore.currentSet,
      highlightStore.usefulAffixes,
      (type) => localeStore.getAffixName(type),
    )
  })

  /** Computed total affix values for the current relic set. */
  const totalValueStatistics = computed<TotalValueStatistics>(() => {
    const templateTypes: Set<AffixType> | null = templateStore.isTemplateActive
      ? new Set(Object.values(templateStore.selectedTemplate!.mainAffixes))
      : null

    return computeTotalValueStatistics(
      relicStore.currentSet,
      highlightStore.usefulAffixes,
      templateTypes,
      (type) => localeStore.getAffixName(type),
    )
  })

  /** Computed out-of-battle stats for the selected character template. */
  const outOfBattleStats = computed<OutOfBattleStats | null>(() => {
    if (!templateStore.isTemplateActive || !templateStore.selectedCharacter) return null
    const baseStats = configService.getCharacterBaseStats(templateStore.selectedCharacter)

    // Merge template main affixes (Body/Feet/Sphere/Rope) into the useful set
    // so they receive gold highlighting — same logic as totalValueStatistics.
    const templateMainAffixTypes: AffixType[] = templateStore.selectedTemplate
      ? Object.values(templateStore.selectedTemplate.mainAffixes)
      : []
    const combinedUseful = new Set([...highlightStore.usefulAffixes, ...templateMainAffixTypes])

    return computeOutOfBattleStats(
      templateStore.selectedCharacter,
      baseStats,
      relicStore.currentSet,
      combinedUseful,
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
    totalValueStatistics,
    outOfBattleStats,
    serializeSet,
    deserializeSet,
    removeRelicFromSet,
  }
})
