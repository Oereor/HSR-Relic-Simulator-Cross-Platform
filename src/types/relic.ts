import { AffixType, RelicPosition } from './enums'

// ============================================================
// TODO: Full interfaces are documented in DESIGN.md Section 10.
// These stubs allow the project to type-check. Fill in from
// the design document's type definitions.
// ============================================================

export interface AffixData {
  type: AffixType
  isMainAffix: boolean
  mainAffixLevel: number
  enhanceCount: number
  extraEnhanceSteps: number
}

export interface RelicData {
  readonly id: string
  position: RelicPosition
  level: number
  mainAffix: AffixData
  subAffixes: AffixData[]
  isFourInitSubAffixes: boolean
}

export class RelicSet {
  relics: Map<RelicPosition, RelicData> = new Map()

  getRelic(pos: RelicPosition): RelicData | undefined {
    return this.relics.get(pos)
  }

  setRelic(relic: RelicData): void {
    if (this.relics.has(relic.position) || relic.position === RelicPosition.Unknown) {
      throw new Error(`Position ${relic.position} already occupied or invalid`)
    }
    this.relics.set(relic.position, relic)
  }

  removeRelic(pos: RelicPosition): void {
    this.relics.delete(pos)
  }

  get isComplete(): boolean {
    return this.relics.size === 6
  }

  get filledPositions(): RelicPosition[] {
    return Array.from(this.relics.keys())
  }

  get emptyPositions(): RelicPosition[] {
    const all = [
      RelicPosition.Head, RelicPosition.Hands, RelicPosition.Body,
      RelicPosition.Feet, RelicPosition.Sphere, RelicPosition.Rope
    ]
    return all.filter(p => !this.relics.has(p))
  }

  clone(): RelicSet {
    const copy = new RelicSet()
    copy.relics = new Map(this.relics)
    return copy
  }
}

export interface SaveData {
  formatVersion: number
  savedAt: string
  relics: RelicData[]
}
