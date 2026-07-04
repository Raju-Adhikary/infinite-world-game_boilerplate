export const tree_pine = {
  biomes: ['snow', 'tundra'],
  density: { snow: 0.042, tundra: 0.026 },
  minDist: 5,
  scale: [0.8, 1.4],
  fallback: {
    parts: [
      {
        geometry: 'cylinder',
        args: [0.2, 0.3, 5, 6],
        position: [0, 2.5, 0],
        material: { color: 0x6b4226 },
      },
      {
        geometry: 'cone',
        args: [2, 4, 8],
        position: [0, 4.0, 0],
        material: { color: 0x2a5a1a },
      },
    ],
  },
  physics: {
    type: 'capsule',
    halfHeight: 1.9,
    radius: 0.38,
    offset: [0, 2.28, 0],
  },
};