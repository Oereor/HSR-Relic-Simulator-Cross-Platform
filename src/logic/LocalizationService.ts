/**
 * Singleton service for localization. Wraps TextMap.json and exposes
 * a reactive language switch. Replaces C# LocalizationService.
 *
 * In Vue, the useLocaleStore Pinia store wraps this service's
 * currentLanguage in a ref() so that template bindings re-evaluate
 * when the language changes.
 */
import textMapData from '@/data/TextMap.json'
import { AffixType, RelicPosition } from '@/types/enums'

interface TextMapMeta {
  version: number
  languages: string[]
  defaultLanguage: string
}

interface TextMapRoot {
  meta: TextMapMeta
  entries: Record<string, Record<string, string>>
}

class LocalizationService {
  private data = textMapData as TextMapRoot
  private _currentLanguage: string

  constructor() {
    this._currentLanguage = this.data.meta.defaultLanguage
  }

  get currentLanguage(): string {
    return this._currentLanguage
  }

  set currentLanguage(code: string) {
    if (this.data.meta.languages.includes(code)) {
      this._currentLanguage = code
    }
  }

  get availableLanguages(): string[] {
    return [...this.data.meta.languages]
  }

  /**
   * Gets a localized string by key. Supports format args like {0}, {1}.
   * Falls back to the raw key if no translation is found.
   */
  get(key: string, ...args: unknown[]): string {
    const entry = this.data.entries[key]
    if (!entry) return key

    const value = entry[this._currentLanguage]
    if (!value) return key

    if (args.length === 0) return value
    return value.replace(/\{(\d+)\}/g, (_, i) => String(args[parseInt(i)] ?? ''))
  }

  /**
   * Gets the localized display name for an affix type.
   * Key format: "relic.affix.{EnumName}" (e.g. "relic.affix.CritRate")
   */
  getAffixName(type: AffixType): string {
    const key = `relic.affix.${AffixType[type]}`
    return this.get(key)
  }

  /**
   * Gets the localized display name for a relic position.
   * Key format: "relic.position.{EnumName}" (e.g. "relic.position.Head")
   */
  getPositionName(position: RelicPosition): string {
    const key = `relic.position.${RelicPosition[position]}`
    return this.get(key)
  }
}

export const localizationService = new LocalizationService()
