import { describe, it, expect } from 'vitest'
import { RandomWrapper } from '../RandomWrapper'

describe('RandomWrapper', () => {
  it('produces deterministic output with the same seed', () => {
    const rng1 = new RandomWrapper(42)
    const rng2 = new RandomWrapper(42)

    const results1 = Array.from({ length: 10 }, () => rng1.next())
    const results2 = Array.from({ length: 10 }, () => rng2.next())

    expect(results1).toEqual(results2)
  })

  it('next() returns values in [0, 1)', () => {
    const rng = new RandomWrapper(123)
    for (let i = 0; i < 1000; i++) {
      const v = rng.next()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('nextInt(max) returns values in [0, max)', () => {
    const rng = new RandomWrapper(456)
    for (let i = 0; i < 1000; i++) {
      const v = rng.nextInt(10)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(10)
    }
  })

  it('nextInt(0) returns 0', () => {
    const rng = new RandomWrapper(1)
    expect(rng.nextInt(0)).toBe(0)
  })

  it('nextRange(min, max) returns values in [min, max)', () => {
    const rng = new RandomWrapper(789)
    for (let i = 0; i < 1000; i++) {
      const v = rng.nextRange(5, 15)
      expect(v).toBeGreaterThanOrEqual(5)
      expect(v).toBeLessThan(15)
    }
  })

  it('different seeds produce different sequences', () => {
    const rng1 = new RandomWrapper(1)
    const rng2 = new RandomWrapper(2)

    const seq1 = Array.from({ length: 5 }, () => rng1.next())
    const seq2 = Array.from({ length: 5 }, () => rng2.next())

    expect(seq1).not.toEqual(seq2)
  })
})
