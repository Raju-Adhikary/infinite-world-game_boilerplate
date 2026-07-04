export const mushroom = {
  biomes: ['swamp', 'jungle'],
  density: 0.025,
  minDist: 2,
  scale: [0.4, 1.0],
  fallback: {
    parts: [
      {
        geometry: 'cylinder',
        args: [0.08, 0.1, 0.5, 6],
        position: [0, 0.25, 0],
        material: { color: 0xe0d0b0 },
      },
      {
        geometry: 'sphere',
        args: [0.35, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.55],
        position: [0, 0.5, 0],
        material: { color: 0xc03030 },
      },
    ],
  },
  physics: null,
};