/**
 * Core relic simulation logic: creation, reforge, sub-affix population.
 * Replaces C# RelicSystem class. Zero framework dependencies.
 */
import { AffixType, RelicPosition } from '@/types/enums'
import type { AffixData } from '@/types/relic'
import { configService } from './ConfigService'
import type { RandomWrapper } from './RandomWrapper'
import { getSharedRng } from './RngService'
import {
  type Relic,
  createRelicData,
  createAffixData,
  cloneAffixData,
  resetAffixEnhance,
} from './RelicData'

const MAX_RELIC_LEVEL = 15
const FOUR_INIT_PROBABILITY = 200 // 20% chance (200/1000)

/**
 * Creates a new relic with the given position and optional designated affixes.
 * Matches C# RelicSystem.CreateNewRelic().
 *
 * @param position - The equipment slot for the relic
 * @param rng - Random number generator (optional; uses shared RNG if omitted)
 * @param mainAffixType - Designated main affix, or Unknown for random
 * @param designatedSubAffixes - User-chosen sub-affix types (max 2)
 */
export function createNewRelic(
  position: RelicPosition,
  rng?: RandomWrapper,
  mainAffixType: AffixType = AffixType.Unknown,
  designatedSubAffixes?: AffixType[],
): Relic {
  // Use provided rng if available, otherwise fall back to shared singleton
  const effectiveRng = rng ?? getSharedRng()

  // Determine main affix type
  if (mainAffixType === AffixType.Unknown) {
    mainAffixType = configService.pickRandomMainAffix(position, effectiveRng)
  }

  const mainAffix = createAffixData(mainAffixType, true)

  // 20% chance for four-init sub-affixes
  const isFourInit = effectiveRng.nextInt(1000) < FOUR_INIT_PROBABILITY

  const subAffixes = populateSubAffixes(
    mainAffixType,
    isFourInit,
    effectiveRng,
    designatedSubAffixes,
  )

  return createRelicData(position, mainAffix, subAffixes, isFourInit)
}

/**
 * Reforges the sub-affixes of a max-level relic.
 * Returns a clone of the original sub-affixes (pre-reforge snapshot).
 * Matches C# RelicSystem.ReforgeRelicSubAffixes().
 *
 * @throws If relic is not at max level (15)
 */
export function reforgeRelicSubAffixes(
  relic: Relic,
  excludedSubAffixIndex?: number,
): AffixData[] {
  if (relic.level < MAX_RELIC_LEVEL) {
    throw new Error('Cannot reforge a relic that is not at max level.')
  }

  // Clone original sub-affixes and compute total enhance count
  const subAffixesClone: AffixData[] = []
  let totalEnhanceCount = 0

  for (const subAffix of relic.subAffixes) {
    totalEnhanceCount += subAffix.enhanceCount - 1
    subAffixesClone.push(cloneAffixData(subAffix))
    // Reset each sub-affix with random initial extra steps (0, 1, or 2)
    resetAffixEnhance(subAffix, getSharedRng().nextInt(3))
  }

  // Re-apply all enhance hits
  for (let i = 0; i < totalEnhanceCount; i++) {
    if (excludedSubAffixIndex !== undefined) {
      relic.enhanceRandomSubAffixExcluding(excludedSubAffixIndex)
    } else {
      relic.enhanceRandomSubAffix()
    }
  }

  return subAffixesClone
}

/**
 * Populates 4 sub-affix slots for a new relic.
 * Always returns exactly 4 entries. The 4th entry may be inactive
 * (EnhanceCount=0) for 3-init relics.
 * Matches C# RelicSystem.PopulateSubAffixes().
 */
export function populateSubAffixes(
  mainAffixType: AffixType,
  isFourInit: boolean,
  rng: RandomWrapper,
  designatedSubAffixes?: AffixType[],
): AffixData[] {
  const excludedTypes = new Set<AffixType>([mainAffixType])
  const resultTypes: AffixType[] = []

  // Add designated sub-affixes first
  if (designatedSubAffixes) {
    for (const designated of designatedSubAffixes) {
      if (designated !== AffixType.Unknown && !excludedTypes.has(designated)) {
        resultTypes.push(designated)
        excludedTypes.add(designated)
      }
    }
  }

  // Fill remaining slots with weighted random selection (up to 4 total)
  while (resultTypes.length < 4) {
    const picked = configService.pickRandomSubAffix(excludedTypes, rng)
    if (picked === AffixType.Unknown) break
    resultTypes.push(picked)
    excludedTypes.add(picked)
  }

  // Create AffixData for each type
  const subAffixes: AffixData[] = []
  for (let i = 0; i < resultTypes.length; i++) {
    let enhanceCount = 1
    const extraSteps = rng.nextInt(3) // 0, 1, or 2

    // 4th sub-affix: inactive if not four-init
    if (i === 3 && !isFourInit) {
      enhanceCount = 0
    }

    subAffixes.push({
      type: resultTypes[i],
      isMainAffix: false,
      mainAffixLevel: -1,
      enhanceCount,
      extraEnhanceSteps: extraSteps,
    })
  }

  return subAffixes
}
