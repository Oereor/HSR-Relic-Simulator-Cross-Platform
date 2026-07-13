/**
 * Singleton random number generator used throughout the simulator.
 * Provides a single shared Mulberry32 PRNG so we don't proliferate instances.
 */
import { RandomWrapper } from './RandomWrapper'

let sharedInstance: RandomWrapper | null = null

/** Get (or lazily create) the shared RNG instance. */
export function getSharedRng(): RandomWrapper {
  if (!sharedInstance) {
    sharedInstance = new RandomWrapper()
  }
  return sharedInstance
}

/**
 * Replace the shared RNG with a new one (optionally seeded).
 * Call this at the start of a simulation run or test to guarantee determinism.
 */
export function resetSharedRng(seed?: number): void {
  sharedInstance = new RandomWrapper(seed)
}

/** Retrieve the seed of the current shared RNG. */
export function getSharedRngSeed(): number {
  return getSharedRng().getSeed()
}
