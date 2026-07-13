/**
 * Serializes and deserializes relic sets to/from JSON strings.
 * Replaces C# SaveLoadService.
 *
 * Enum serialization uses camelCase (matching the C# JsonStringEnumConverter
 * with JsonNamingPolicy.CamelCase):
 *   RelicPosition.Head  → "head"
 *   AffixType.CritRate  → "critRate"
 */
import type { RelicSet, RelicData, SaveData } from '@/types/relic'
import { AffixType, RelicPosition } from '@/types/enums'

// ---- Enum name mapping (camelCase) ----

const POSITION_TO_JSON: Record<number, string> = {
  [RelicPosition.Head]: 'head',
  [RelicPosition.Hands]: 'hands',
  [RelicPosition.Body]: 'body',
  [RelicPosition.Feet]: 'feet',
  [RelicPosition.Sphere]: 'sphere',
  [RelicPosition.Rope]: 'rope',
}

const JSON_TO_POSITION: Record<string, RelicPosition> = {
  head: RelicPosition.Head,
  hands: RelicPosition.Hands,
  body: RelicPosition.Body,
  feet: RelicPosition.Feet,
  sphere: RelicPosition.Sphere,
  rope: RelicPosition.Rope,
}

function affixTypeToCamel(type: AffixType): string {
  const pascal = AffixType[type] // e.g. "CritRate", "HpPercentage"
  if (!pascal) return 'unknown'
  return pascal.charAt(0).toLowerCase() + pascal.slice(1) // "critRate"
}

function camelToAffixType(camel: string): AffixType {
  // Convert first char to uppercase to match enum name
  const pascal = camel.charAt(0).toUpperCase() + camel.slice(1)
  const value = (AffixType as Record<string, unknown>)[pascal]
  if (typeof value === 'number') return value as AffixType
  return AffixType.Unknown
}

// ---- Public API ----

/**
 * Serializes a RelicSet to a JSON string.
 * Format: { formatVersion: 1, savedAt: "<ISO 8601>", relics: [...] }
 */
export function serialize(set: RelicSet): string {
  const relicsForJson = Array.from(set.relics.values()).map(relic => ({
    id: relic.id,
    position: POSITION_TO_JSON[relic.position] ?? 'unknown',
    level: relic.level,
    isFourInitSubAffixes: relic.isFourInitSubAffixes,
    mainAffix: {
      type: affixTypeToCamel(relic.mainAffix.type),
      isMainAffix: true,
      mainAffixLevel: relic.mainAffix.mainAffixLevel,
      enhanceCount: -1,
      extraEnhanceSteps: -1,
    },
    subAffixes: relic.subAffixes.map(sub => ({
      type: affixTypeToCamel(sub.type),
      isMainAffix: false,
      mainAffixLevel: -1,
      enhanceCount: sub.enhanceCount,
      extraEnhanceSteps: sub.extraEnhanceSteps,
    })),
  }))

  const saveData: SaveData = {
    formatVersion: 1,
    savedAt: new Date().toISOString(),
    relics: relicsForJson as unknown as RelicData[],
  }

  return JSON.stringify(saveData, null, 2)
}

/**
 * Deserializes a JSON string into a RelicSet.
 * Throws if the JSON is malformed or the format version is unsupported.
 */
export function deserialize(json: string, RelicSetClass: new () => RelicSet): RelicSet {
  const saveData = JSON.parse(json) as SaveData

  if (!saveData.formatVersion || saveData.formatVersion !== 1) {
    throw new Error(`Unsupported save format version: ${saveData.formatVersion}`)
  }

  if (!Array.isArray(saveData.relics)) {
    throw new Error('Invalid save data: relics array missing')
  }

  const set = new RelicSetClass()

  for (const relicJson of saveData.relics as unknown as SerializedRelic[]) {
    const position = JSON_TO_POSITION[relicJson.position]
    if (position === undefined || position === RelicPosition.Unknown) {
      console.warn(`Skipping relic with unknown position: ${relicJson.position}`)
      continue
    }

    const mainAffixType = camelToAffixType(relicJson.mainAffix.type)

    const relic: RelicData = {
      id: relicJson.id ?? crypto.randomUUID(),
      position,
      level: relicJson.level ?? 0,
      isFourInitSubAffixes: relicJson.isFourInitSubAffixes ?? true,
      mainAffix: {
        type: mainAffixType,
        isMainAffix: true,
        mainAffixLevel: relicJson.mainAffix.mainAffixLevel ?? 0,
        enhanceCount: -1,
        extraEnhanceSteps: -1,
      },
      subAffixes: relicJson.subAffixes.map(sub => ({
        type: camelToAffixType(sub.type),
        isMainAffix: false,
        mainAffixLevel: -1,
        enhanceCount: sub.enhanceCount ?? 0,
        extraEnhanceSteps: sub.extraEnhanceSteps ?? 0,
      })),
    }

    set.relics.set(position, relic)
  }

  return set
}

// ---- Internal types ----

interface SerializedAffix {
  type: string
  isMainAffix: boolean
  mainAffixLevel: number
  enhanceCount: number
  extraEnhanceSteps: number
}

interface SerializedRelic {
  id: string
  position: string
  level: number
  isFourInitSubAffixes: boolean
  mainAffix: SerializedAffix
  subAffixes: SerializedAffix[]
}
