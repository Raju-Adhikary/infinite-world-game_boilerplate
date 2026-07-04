export const flower = {
  biomes: ['plains', 'forest'],
  density: 0.03,
  minDist: 1.5,
  scale: [0.3, 0.6],
  fallback: {
    parts: [
      {
        geometry: 'cylinder',
        args: [0.02, 0.02, 0.5, 4],
        position: [0, 0.25, 0],
        material: { color: 0x3a7a20 },
      },
      {
        geometry: 'sphere',
        args: [0.15, 6, 4],
        position: [0, 0.55, 0],
        material: { color: 0xff6060 },
      },
    ],
  },
  physics: null,
};