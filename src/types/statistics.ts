import { AffixType } from './enums'

export interface RelicSetStatistics {
  totalUsefulHits: number
  categoryHits: CategoryHitCount[]
}

export interface CategoryHitCount {
  type: AffixType
  count: number
  displayName: string
}
