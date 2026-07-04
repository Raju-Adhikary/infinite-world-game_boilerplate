/**
 * Utility Functions
 */

export const _uid = () => Math.random().toString(36).slice(2, 10);
export const _clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const _lerp = (a, b, t) => a + (b - a) * t;
export const _key = (x, z) => `${x},${z}`;

/**
 * Seeded Random Number Generator
 */
export class SeededRandom {
  constructor(s) {
    this.s = s % 2147483647;
    if (this.s <= 0) this.s += 2147483646;
  }

  next() {
    this.s = this.s * 16807 % 2147483647;
    return (this.s - 1) / 2147483646;
  }

  range(a, b) {
    return a + this.next() * (b - a);
  }
}
