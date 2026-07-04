/**
 * Perlin Noise Implementation
 */
import { _lerp } from './utils.js';

export class Noise {
  constructor(seed = 0) {
    this.p = new Uint8Array(512);
    let s = seed;

    for (let i = 0; i < 256; i++) {
      this.p[i] = i;
    }

    for (let i = 255; i > 0; i--) {
      s = (s * 16807) % 2147483647;
      const j = s % (i + 1);
      [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
    }

    for (let i = 0; i < 256; i++) {
      this.p[i + 256] = this.p[i];
    }
  }

  _g(h, x, y) {
    const v = h & 3;
    return (v === 0 ? x + y : v === 1 ? -x + y : v === 2 ? x - y : -x - y);
  }

  n2(x, y) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = x * x * (3 - 2 * x), v = y * y * (3 - 2 * y);
    const a = this.p[X] + Y, b = this.p[X + 1] + Y;
    return _lerp(
      _lerp(this._g(this.p[a], x, y), this._g(this.p[b], x - 1, y), u),
      _lerp(this._g(this.p[a + 1], x, y - 1), this._g(this.p[b + 1], x - 1, y - 1), u),
      v
    ) * 0.5 + 0.5;
  }

  fbm(x, y, oct = 4, lap = 2, gain = 0.5) {
    let s = 0, a = 1, f = 1, m = 0;
    for (let i = 0; i < oct; i++) {
      s += this.n2(x * f, y * f) * a;
      m += a;
      a *= gain;
      f *= lap;
    }
    return s / m;
  }
}
