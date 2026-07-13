/**
 * Central Pinia store for all relic state.
 * Replaces C# MainViewModel.
 *
 * Holds all created relics (keyed by position), the currently focused relic,
 * the selected position (drives the thumbnail strip), and the current relic set.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RelicData } from '@/types/relic'
import { RelicSet } from '@/types/relic'
import { RelicPosition } from '@/types/enums'

export const useRelicStore = defineStore('relic', () => {
  // ---- State ----

  const allRelics = ref<Map<RelicPosition, RelicData[]>>(new Map())
  const selectedPosition = ref<RelicPosition>(RelicPosition.Head)
  const focusRelicId = ref<string | null>(null)
  const currentSet = ref<RelicSet>(new RelicSet())

  // ---- Getters (computed) ----

  /** Relics for the currently selected position (drives the thumbnail strip). */
  const positionRelics = computed<RelicData[]>(() => {
    return allRelics.value.get(selectedPosition.value) ?? []
  })

  /** The focused relic object, resolved from focusRelicId. */
  const focusRelic = computed<RelicData | null>(() => {
    if (!focusRelicId.value) return null
    for (const [, relics] of allRelics.value) {
      const found = relics.find(r => r.id === focusRelicId.value)
      if (found) return found
    }
    return null
  })

  /** Per-position relic counts (drives the 6 position banners). */
  const positionCounts = computed<Map<RelicPosition, number>>(() => {
    const counts = new Map<RelicPosition, number>()
    for (const pos of [
      RelicPosition.Head,
      RelicPosition.Hands,
      RelicPosition.Body,
      RelicPosition.Feet,
      RelicPosition.Sphere,
      RelicPosition.Rope,
    ]) {
      counts.set(pos, allRelics.value.get(pos)?.length ?? 0)
    }
    return counts
  })

  /** Whether the focused relic is assigned to the current set. */
  const isFocusRelicAssignedToSet = computed<boolean>(() => {
    if (!focusRelic.value) return false
    return currentSet.value.getRelic(focusRelic.value.position)?.id === focusRelic.value.id
  })

  // ---- Actions ----

  function addRelic(relic: RelicData): void {
    if (!allRelics.value.has(relic.position)) {
      allRelics.value.set(relic.position, [])
    }
    allRelics.value.get(relic.position)!.push(relic)
    // Trigger reactivity by replacing the Map
    allRelics.value = new Map(allRelics.value)
    selectPosition(relic.position)
    focusRelicId.value = relic.id
  }

  function deleteRelic(relicId: string): void {
    for (const [pos, relics] of allRelics.value) {
      const idx = relics.findIndex(r => r.id === relicId)
      if (idx !== -1) {
        relics.splice(idx, 1)
        allRelics.value = new Map(allRelics.value)
        if (focusRelicId.value === relicId) {
          focusRelicId.value = relics.length > 0 ? relics[relics.length - 1].id : null
        }
        return
      }
    }
  }

  function selectPosition(pos: RelicPosition): void {
    selectedPosition.value = pos
    const relics = allRelics.value.get(pos)
    if (relics && relics.length > 0) {
      focusRelicId.value = relics[relics.length - 1].id
    } else {
      focusRelicId.value = null
    }
  }

  function focusRelicById(id: string): void {
    focusRelicId.value = id
  }

  function assignToSet(relic: RelicData): void {
    // If position already occupied, remove first
    if (currentSet.value.getRelic(relic.position)) {
      currentSet.value.removeRelic(relic.position)
    }
    currentSet.value.setRelic(relic)
    currentSet.value = currentSet.value.clone()
  }

  function removeFromSet(relic: RelicData): void {
    currentSet.value.removeRelic(relic.position)
    currentSet.value = currentSet.value.clone()
  }

  function loadSet(set: RelicSet): void {
    currentSet.value = set
  }

  return {
    allRelics,
    selectedPosition,
    focusRelicId,
    currentSet,
    positionRelics,
    focusRelic,
    positionCounts,
    isFocusRelicAssignedToSet,
    addRelic,
    deleteRelic,
    selectPosition,
    focusRelicById,
    assignToSet,
    removeFromSet,
    loadSet,
  }
})
