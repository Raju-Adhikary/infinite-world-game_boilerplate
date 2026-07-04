/**
 * Biome System
 * Determines biome types based on noise
 */
import { Noise } from '../core/noise.js';
import { CFG } from '../config/config.js';

export class BiomeSystem {
  constructor(seed) {
    this.tempN = new Noise(seed);
    this.moistN = new Noise(seed + 999);
  }

  get(wx, wz) {
    const t = this.tempN.fbm(wx * 0.0015, wz * 0.0015, 4, 2, 0.5);
    const m = this.moistN.fbm(wx * 0.002, wz * 0.002, 4, 2, 0.5);

    for (const [name, b] of Object.entries(CFG.biomes)) {
      if (t >= b.temp[0] && t <= b.temp[1] && m >= b.moist[0] && m <= b.moist[1]) {
        return name;
      }
    }
    return 'plains';
  }

  getColor(biome) {
    return (CFG.biomes[biome] || CFG.biomes.plains).ground;
  }
}
