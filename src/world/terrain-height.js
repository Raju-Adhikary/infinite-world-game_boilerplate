/**
 * Terrain Height Generator
 * Procedurally generates terrain heights using noise
 */
import { Noise } from '../core/noise.js';
import { CFG } from '../config/config.js';

export class TerrainHeight {
  constructor(seed) {
    this.n = new Noise(seed);
    this.cfg = CFG.world;
  }

  get(wx, wz) {
    return this.n.fbm(
      wx * this.cfg.heightFreq,
      wz * this.cfg.heightFreq,
      this.cfg.heightOctaves,
      2.0,
      0.48
    ) * this.cfg.heightScale;
  }
}
