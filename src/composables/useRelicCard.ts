/**
 * Composable providing level-up and reforge logic for a single relic card.
 * Replaces C# RelicCardViewModel.
 *
 * Manages the reforge state machine (preview → accept/revert) and
 * delegates level-up actions to the RelicData class methods.
 */
import { ref, computed } from 'vue'
import type { AffixData } from '@/types/relic'
import type { Relic } from '@/logic/RelicData'
import { reforgeRelicSubAffixes } from '@/logic/RelicSystem'
import { useRelicStore } from '@/stores/useRelicStore'

export function useRelicCard(relic: Relic) {
  const relicStore = useRelicStore()

  const isMaxLevel = computed(() => relic.level === 15)

  // Reforge state machine
  const hasPendingReforge = ref(false)
  const preReforgeSubs = ref<AffixData[]>([])
  const blockedIndex = ref<number | null>(null)

  function levelUpX1(): void {
    if (relic.level < 15) relic.levelUp()
  }

  function levelUpToNextNode(): void {
    if (relic.level < 15) relic.levelUpToNextNode()
  }

  function levelUpToMax(): void {
    if (relic.level < 15) relic.levelUpToMax()
  }

  function executeReforge(): void {
    if (!isMaxLevel.value) return
    if (blockedIndex.value !== null) {
      preReforgeSubs.value = reforgeRelicSubAffixes(relic, blockedIndex.value)
    } else {
      preReforgeSubs.value = reforgeRelicSubAffixes(relic)
    }
    hasPendingReforge.value = true
  }

  function acceptReforge(): void {
    preReforgeSubs.value = []
    blockedIndex.value = null
    hasPendingReforge.value = false
  }

  function revertReforge(): void {
    relic.subAffixes = preReforgeSubs.value.map(s => ({ ...s }))
    preReforgeSubs.value = []
    blockedIndex.value = null
    hasPendingReforge.value = false
  }

  function toggleBlock(index: number): void {
    if (!isMaxLevel.value || hasPendingReforge.value) return
    blockedIndex.value = blockedIndex.value === index ? null : index
  }

  function assignToSet(): void {
    relicStore.assignToSet(relic)
  }

  function removeFromSet(): void {
    relicStore.removeFromSet(relic)
  }

  const isAssignedToSet = computed(() => {
    return relicStore.currentSet.getRelic(relic.position)?.id === relic.id
  })

  return {
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
  }
}
