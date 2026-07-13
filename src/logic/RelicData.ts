/**
 * RelicData class with level-up and enhance mechanics.
 * Replaces C# RelicData class. Uses shared RNG via RngService.
 *
 * The class holds mutable state (level, sub-affixes) and provides
 * methods that mirror the C# RelicData exactly.
 */
import type { AffixData, RelicData as RelicDataInterface } from '@/types/relic'
import { AffixType, RelicPosition } from '@/types/enums'
import { getSharedRng } from './RngService'

const MAX_LEVEL = 15

// ---- AffixData helpers ----

export function createAffixData(
  type: AffixType,
  isMainAffix: boolean,
): AffixData {
  return {
    type,
    isMainAffix,
    mainAffixLevel: isMainAffix ? 0 : -1,
    enhanceCount: isMainAffix ? -1 : 1,
    extraEnhanceSteps: isMainAffix ? -1 : 0,
  }
}

export function cloneAffixData(affix: AffixData): AffixData {
  return { ...affix }
}

/**
 * Increments EnhanceCount and adds a random step to ExtraEnhanceSteps.
 * Matches C# AffixData.Enhance(step).
 */
export function enhanceAffix(affix: AffixData, step: number): void {
  affix.enhanceCount++
  affix.extraEnhanceSteps += step
}

/**
 * Resets a sub-affix to base state with a random initial ExtraEnhanceSteps.
 * Matches C# AffixData.ResetEnhance(randomInitExtraSteps).
 */
export function resetAffixEnhance(affix: AffixData, randomInitExtraSteps: number): void {
  affix.enhanceCount = 1
  affix.extraEnhanceSteps = randomInitExtraSteps
}

// ---- Factory ----

export function createRelicData(
  position: RelicPosition,
  mainAffix: AffixData,
  subAffixes: AffixData[],
  isFourInitSubAffixes: boolean,
): Relic {
  return new Relic(position, mainAffix, subAffixes, isFourInitSubAffixes)
}

// ---- RelicData class ----

export class Relic implements RelicDataInterface {
  readonly id: string
  position: RelicPosition
  level: number
  mainAffix: AffixData
  subAffixes: AffixData[]
  isFourInitSubAffixes: boolean

  constructor(
    position: RelicPosition,
    mainAffix: AffixData,
    subAffixes: AffixData[],
    isFourInitSubAffixes: boolean,
  ) {
    this.id = crypto.randomUUID()
    this.position = position
    this.level = 0
    this.mainAffix = mainAffix
    this.subAffixes = subAffixes
    this.isFourInitSubAffixes = isFourInitSubAffixes
  }

  get isMaxLevel(): boolean {
    return this.level === MAX_LEVEL
  }

  /**
   * Levels up by 1. At multiples of 3, enhances a random sub-affix
   * (or activates the 4th sub for 3-init relics at level 3).
   * Matches C# RelicData.LevelUp().
   */
  levelUp(): void {
    if (this.isMaxLevel) return

    this.level++
    this.mainAffix.mainAffixLevel = this.level

    if (this.level % 3 === 0) {
      if (!this.isFourInitSubAffixes && this.level === 3) {
        // Activate the 4th sub-affix (set EnhanceCount from 0 to 1)
        this.subAffixes[3].enhanceCount = 1
      } else {
        this.enhanceRandomSubAffix()
      }
    }
  }

  /**
   * Levels up by `count` levels, capped at 15.
   * Matches C# RelicData.LevelUp(int count).
   */
  levelUpBy(count: number): void {
    if (count <= 0 || this.level + count > MAX_LEVEL) return
    for (let i = 0; i < count; i++) {
      this.levelUp()
    }
  }

  /**
   * Levels up to the next multiple-of-3 node, capped at 15.
   * Matches C# RelicData.LevelUpToNextNode().
   */
  levelUpToNextNode(): void {
    if (this.isMaxLevel) return
    const nextNode = (Math.floor(this.level / 3) + 1) * 3
    const target = Math.min(nextNode, MAX_LEVEL)
    this.levelUpBy(target - this.level)
  }

  /**
   * Levels up all the way to max level (15).
   * Matches C# RelicData.LevelUpToMax().
   */
  levelUpToMax(): void {
    this.levelUpBy(MAX_LEVEL - this.level)
  }

  /**
   * Picks a random sub-affix and enhances it by a random step (0, 1, or 2).
   * Matches C# RelicData.EnhanceRandomSubAffix().
   */
  enhanceRandomSubAffix(): void {
    if (this.subAffixes.length === 0) return
    const index = getSharedRng().nextInt(this.subAffixes.length)
    enhanceAffix(this.subAffixes[index], getSharedRng().nextInt(3)) // 0, 1, or 2
  }

  /**
   * Picks a random sub-affix avoiding the excluded index.
   * Matches C# RelicData.EnhanceRandomSubAffix(int excludedIndex).
   */
  enhanceRandomSubAffixExcluding(excludedIndex: number): void {
    if (this.subAffixes.length <= 1) return
    const indices: number[] = []
    for (let i = 0; i < this.subAffixes.length; i++) {
      if (i !== excludedIndex) indices.push(i)
    }
    const randomIndex = indices[getSharedRng().nextInt(indices.length)]
    enhanceAffix(this.subAffixes[randomIndex], getSharedRng().nextInt(3))
  }

  /**
   * Returns a deep clone of this relic's sub-affixes.
   */
  cloneSubAffixes(): AffixData[] {
    return this.subAffixes.map(s => cloneAffixData(s))
  }
}
