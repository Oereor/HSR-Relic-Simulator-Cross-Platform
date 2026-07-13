/**
 * Seeded pseudo-random number generator backed by the seedrandom library.
 * Replaces C#'s `System.Random` for deterministic relic rolling.
 *
 * - Default constructor seeds from Date.now() for non-deterministic use.
 * - Pass an explicit seed for reproducible rolls (future seed-control feature).
 */
import seedrandom from 'seedrandom'

export class RandomWrapper {
  private rng: seedrandom.PRNG
  private _seed: number

  constructor(seed?: number) {
    this._seed = seed ?? Date.now()
    this.rng = seedrandom(this._seed.toString())
  }

  /**
   * Returns a float in [0, 1). Equivalent to C# Random.NextDouble().
   */
  next(): number {
    return this.rng()
  }

  /**
   * Returns an integer in [0, max). Equivalent to C# Random.Next(max).
   */
  nextInt(max: number): number {
    if (max <= 0) return 0
    return Math.floor(this.next() * max)
  }

  /**
   * Returns an integer in [min, max). Equivalent to C# Random.Next(min, max).
   */
  nextRange(min: number, max: number): number {
    return min + this.nextInt(max - min)
  }

  /**
   * Returns the seed used to initialize this PRNG.
   * Useful for saving/restoring state for reproducibility.
   */
  getSeed(): number {
    return this._seed
  }
}
