/**
 * Tracks which sub-affix types the user considers "useful."
 * Replaces C# HighlightService. Pure logic — no Vue dependency.
 *
 * The useHighlightStore Pinia store wraps this with reactivity
 * for the checkbox grid UI.
 */
import { AffixType } from '@/types/enums'

export class HighlightService {
  private _usefulAffixes: Set<AffixType> = new Set()

  get usefulAffixes(): Set<AffixType> {
    return new Set(this._usefulAffixes)
  }

  isUseful(type: AffixType): boolean {
    return this._usefulAffixes.has(type)
  }

  setUseful(type: AffixType, useful: boolean): void {
    if (useful) {
      this._usefulAffixes.add(type)
    } else {
      this._usefulAffixes.delete(type)
    }
  }

  /**
   * Replaces the entire useful set (used when loading from saved state).
   */
  setAllUseful(types: Set<AffixType>): void {
    this._usefulAffixes = new Set(types)
  }
}
