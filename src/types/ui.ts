import { AffixType, RelicPosition } from './enums'

export interface AffixOption {
  display: string
  value: AffixType | null
}

export interface SubAffixRowDisplay {
  affixName: string
  affixValue: string
  enhanceBadge: string
  rowBackground: string
  textColor: string
  accentBorderColor: string | null
  isBlocked: boolean
  canBlock: boolean
  index: number
}

export interface RelicSetSlotDisplay {
  position: RelicPosition
  positionDisplay: string
  hasRelic: boolean
  mainAffixName: string
  mainAffixValue: string
  levelDisplay: string
  totalUsefulHits: number
  subAffixRows: SubAffixRowDisplay[]
}
