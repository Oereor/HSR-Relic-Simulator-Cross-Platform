import { describe, it, expect } from 'vitest'
import { AffixType, RelicPosition } from '@/types/enums'
import { RelicSet } from '@/types/relic'
import type { RelicData } from '@/types/relic'
import { serialize, deserialize } from '../SaveLoadService'

function makeMockRelic(position: RelicPosition, id?: string): RelicData {
  return {
    id: id ?? crypto.randomUUID(),
    position,
    level: 12,
    isFourInitSubAffixes: true,
    mainAffix: {
      type: AffixType.Hp,
      isMainAffix: true,
      mainAffixLevel: 12,
      enhanceCount: -1,
      extraEnhanceSteps: -1,
    },
    subAffixes: [
      {
        type: AffixType.CritRate,
        isMainAffix: false,
        mainAffixLevel: -1,
        enhanceCount: 3,
        extraEnhanceSteps: 4,
      },
      {
        type: AffixType.Spd,
        isMainAffix: false,
        mainAffixLevel: -1,
        enhanceCount: 2,
        extraEnhanceSteps: 1,
      },
      {
        type: AffixType.Atk,
        isMainAffix: false,
        mainAffixLevel: -1,
        enhanceCount: 1,
        extraEnhanceSteps: 0,
      },
      {
        type: AffixType.HpPercentage,
        isMainAffix: false,
        mainAffixLevel: -1,
        enhanceCount: 1,
        extraEnhanceSteps: 2,
      },
    ],
  }
}

describe('SaveLoadService', () => {
  it('serialize produces valid JSON', () => {
    const set = new RelicSet()
    set.relics.set(RelicPosition.Head, makeMockRelic(RelicPosition.Head))

    const json = serialize(set)
    const parsed = JSON.parse(json)

    expect(parsed.formatVersion).toBe(1)
    expect(parsed.savedAt).toBeTruthy()
    expect(parsed.relics).toHaveLength(1)
  })

  it('round-trips a complete relic set', () => {
    const original = new RelicSet()
    const relicId = 'test-id-12345'

    original.relics.set(RelicPosition.Head, makeMockRelic(RelicPosition.Head, relicId))
    original.relics.set(RelicPosition.Hands, makeMockRelic(RelicPosition.Hands))
    original.relics.set(RelicPosition.Body, makeMockRelic(RelicPosition.Body))
    original.relics.set(RelicPosition.Feet, makeMockRelic(RelicPosition.Feet))
    original.relics.set(RelicPosition.Sphere, makeMockRelic(RelicPosition.Sphere))
    original.relics.set(RelicPosition.Rope, makeMockRelic(RelicPosition.Rope))

    const json = serialize(original)
    const restored = deserialize(json, RelicSet)

    expect(restored.relics.size).toBe(6)
    expect(restored.isComplete).toBe(true)

    // Check each position
    for (const pos of [
      RelicPosition.Head,
      RelicPosition.Hands,
      RelicPosition.Body,
      RelicPosition.Feet,
      RelicPosition.Sphere,
      RelicPosition.Rope,
    ]) {
      expect(restored.getRelic(pos)).toBeTruthy()
      expect(restored.getRelic(pos)!.position).toBe(pos)
      expect(restored.getRelic(pos)!.level).toBe(12)
      expect(restored.getRelic(pos)!.subAffixes).toHaveLength(4)
    }

    // The known ID should be preserved
    const headRelic = restored.getRelic(RelicPosition.Head)
    expect(headRelic!.id).toBe(relicId)
  })

  it('deserialize handles camelCase enum names', () => {
    const json = JSON.stringify({
      formatVersion: 1,
      savedAt: '2026-01-01T00:00:00.000Z',
      relics: [
        {
          id: 'abc',
          position: 'head',
          level: 0,
          isFourInitSubAffixes: true,
          mainAffix: {
            type: 'hp',
            isMainAffix: true,
            mainAffixLevel: 0,
            enhanceCount: -1,
            extraEnhanceSteps: -1,
          },
          subAffixes: [
            { type: 'critRate', isMainAffix: false, mainAffixLevel: -1, enhanceCount: 1, extraEnhanceSteps: 0 },
            { type: 'spd', isMainAffix: false, mainAffixLevel: -1, enhanceCount: 1, extraEnhanceSteps: 0 },
            { type: 'atk', isMainAffix: false, mainAffixLevel: -1, enhanceCount: 1, extraEnhanceSteps: 0 },
            { type: 'hpPercentage', isMainAffix: false, mainAffixLevel: -1, enhanceCount: 1, extraEnhanceSteps: 0 },
          ],
        },
      ],
    })

    const restored = deserialize(json, RelicSet)

    const relic = restored.getRelic(RelicPosition.Head)
    expect(relic).toBeTruthy()
    expect(relic!.position).toBe(RelicPosition.Head)
    expect(relic!.mainAffix.type).toBe(AffixType.Hp)
    expect(relic!.subAffixes[0].type).toBe(AffixType.CritRate)
    expect(relic!.subAffixes[1].type).toBe(AffixType.Spd)
  })

  it('deserialize throws on wrong format version', () => {
    const json = JSON.stringify({ formatVersion: 99, savedAt: '', relics: [] })
    expect(() => deserialize(json, RelicSet)).toThrow('Unsupported save format version')
  })
})
