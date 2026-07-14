/**
 * Singleton service that loads and indexes relic configuration data.
 * Replaces C# ConfigService. JSON configs are imported as ES modules at build time.
 *
 * The JSON files use kebab-case field names with string-encoded numbers
 * and PascalCase enum strings. This service normalizes them to camelCase
 * TypeScript interfaces at load time.
 */
import type {
  MainAffixConfigEntry,
  SubAffixConfigEntry,
  MainAffixProbabilityEntry,
  MainAffixOption,
} from '@/types/config'
import { AffixType, RelicPosition } from '@/types/enums'
import type { RandomWrapper } from './RandomWrapper'

// Build-time JSON imports (replaces runtime File.ReadAllText)
import mainAffixConfigRaw from '@/data/MainAffixConfig.json'
import subAffixConfigRaw from '@/data/SubAffixConfig.json'
import mainAffixProbRaw from '@/data/MainAffixProbabilityConfig.json'
import characterTemplatesRaw from '@/data/CharacterRelicTemplatesConfig.json'
import type { CharacterTemplate, CharacterTemplateMainAffixes } from '@/types/characterTemplate'

// ---- Raw JSON shapes (kebab-case keys, string numbers) ----

interface RawMainAffixEntry {
  type: string
  'is-percent': boolean
  'base-value': string
  'level-up-step': string
}

interface RawSubAffixEntry {
  type: string
  weight: string
  'is-percent': boolean
  'base-value': string
  'extra-enhance-step': string
}

interface RawMainAffixProbEntry {
  position: string
  'available-main-affixes': RawMainAffixOption[]
}

interface RawMainAffixOption {
  type: string
  probability: number
}

interface RawCharacterTemplate {
  character: string
  'main-affixes': {
    body: string
    feet: string
    sphere: string
    rope: string
  }
  'effective-sub-affixes': string[]
}

// ---- Helpers ----

function parseAffixType(str: string): AffixType {
  const value = (AffixType as Record<string, unknown>)[str]
  if (typeof value === 'number') return value as AffixType
  return AffixType.Unknown
}

function parseRelicPosition(str: string): RelicPosition {
  const value = (RelicPosition as Record<string, unknown>)[str]
  if (typeof value === 'number') return value as RelicPosition
  return RelicPosition.Unknown
}

function parseNumber(raw: string): number {
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

// ---- Singleton ----

class ConfigService {
  private mainAffixConfigs = new Map<AffixType, MainAffixConfigEntry>()
  private subAffixConfigs = new Map<AffixType, SubAffixConfigEntry>()
  private mainAffixProbabilities = new Map<RelicPosition, MainAffixOption[]>()
  private subAffixEntriesList: SubAffixConfigEntry[] = []
  private allSubAffixTypesSet = new Set<AffixType>()
  private characterTemplates: CharacterTemplate[] = []

  constructor() {
    this.loadConfigs()
  }

  // ---- Public accessors ----

  getMainAffixConfig(type: AffixType): MainAffixConfigEntry | undefined {
    return this.mainAffixConfigs.get(type)
  }

  getSubAffixConfig(type: AffixType): SubAffixConfigEntry | undefined {
    return this.subAffixConfigs.get(type)
  }

  getAvailableMainAffixTypes(position: RelicPosition): AffixType[] {
    const options = this.mainAffixProbabilities.get(position)
    if (!options) return []
    return options.map(o => o.type)
  }

  getAvailableSubAffixTypes(exclude: Set<AffixType>): AffixType[] {
    return this.subAffixEntriesList
      .filter(e => !exclude.has(e.type))
      .map(e => e.type)
  }

  getAllSubAffixTypes(): Set<AffixType> {
    return new Set(this.allSubAffixTypesSet)
  }

  getAllCharacterTemplates(): CharacterTemplate[] {
    return this.characterTemplates
  }

  getCharacterTemplate(characterName: string): CharacterTemplate | undefined {
    return this.characterTemplates.find(t => t.character === characterName)
  }

  // ---- Weighted random selection ----

  pickRandomMainAffix(position: RelicPosition, rng: RandomWrapper): AffixType {
    const options = this.mainAffixProbabilities.get(position)
    if (!options || options.length === 0) return AffixType.Unknown
    if (options.length === 1) return options[0].type

    const totalProbability = options.reduce((sum, o) => sum + o.probability, 0)
    const roll = rng.next() * totalProbability
    let cumulative = 0

    for (const option of options) {
      cumulative += option.probability
      if (roll <= cumulative) return option.type
    }

    return options[options.length - 1].type
  }

  pickRandomSubAffix(excludeTypes: Set<AffixType>, rng: RandomWrapper): AffixType {
    const available = this.subAffixEntriesList.filter(e => !excludeTypes.has(e.type))
    if (available.length === 0) return AffixType.Unknown

    const totalWeight = available.reduce((sum, e) => sum + e.weight, 0)
    const roll = rng.nextInt(totalWeight)
    let cumulative = 0

    for (const entry of available) {
      cumulative += entry.weight
      if (roll < cumulative) return entry.type
    }

    return available[available.length - 1].type
  }

  // ---- Internal loading ----

  private loadConfigs(): void {
    // Load main affix configs
    const mainEntries = mainAffixConfigRaw as RawMainAffixEntry[]
    for (const raw of mainEntries) {
      const type = parseAffixType(raw.type)
      if (type === AffixType.Unknown) continue
      this.mainAffixConfigs.set(type, {
        type,
        isPercent: raw['is-percent'],
        baseValue: parseNumber(raw['base-value']),
        levelUpStep: parseNumber(raw['level-up-step']),
      })
    }

    // Load sub-affix configs
    const subEntries = subAffixConfigRaw as RawSubAffixEntry[]
    for (const raw of subEntries) {
      const type = parseAffixType(raw.type)
      if (type === AffixType.Unknown) continue
      const entry: SubAffixConfigEntry = {
        type,
        weight: parseNumber(raw.weight),
        isPercent: raw['is-percent'],
        baseValue: parseNumber(raw['base-value']),
        extraEnhanceStep: parseNumber(raw['extra-enhance-step']),
      }
      this.subAffixConfigs.set(type, entry)
      this.subAffixEntriesList.push(entry)
      this.allSubAffixTypesSet.add(type)
    }

    // Load main affix probability configs
    const probEntries = mainAffixProbRaw as RawMainAffixProbEntry[]
    for (const raw of probEntries) {
      const position = parseRelicPosition(raw.position)
      if (position === RelicPosition.Unknown) continue
      const options: MainAffixOption[] = raw['available-main-affixes'].map(o => ({
        type: parseAffixType(o.type),
        probability: o.probability,
      }))
      this.mainAffixProbabilities.set(position, options)
    }

    this.loadCharacterTemplates()
  }

  private loadCharacterTemplates(): void {
    const rawList = characterTemplatesRaw as RawCharacterTemplate[]
    for (const raw of rawList) {
      const mainAffixes: CharacterTemplateMainAffixes = {
        body: parseAffixType(raw['main-affixes'].body),
        feet: parseAffixType(raw['main-affixes'].feet),
        sphere: parseAffixType(raw['main-affixes'].sphere),
        rope: parseAffixType(raw['main-affixes'].rope),
      }
      const effectiveSubAffixes: AffixType[] = raw['effective-sub-affixes']
        .map(s => parseAffixType(s))
        .filter(t => t !== AffixType.Unknown)

      this.characterTemplates.push({
        character: raw.character,
        mainAffixes,
        effectiveSubAffixes,
      })
    }
  }
}

export const configService = new ConfigService()
