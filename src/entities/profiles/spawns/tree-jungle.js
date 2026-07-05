export const tree_jungle = {
  biomes: ['jungle', 'swamp'],
  density: { jungle: 0.1, swamp: 0.032 },
  minDist: 4,
  scale: [0.6, 1.5],
  fallback: {
    parts: [
      {
        geometry: 'cylinder',
        args: [0.2, 0.3, 4, 6],
        position: [0, 2.0, 0],
        material: { color: 0x6b4226 },
      },
      {
        geometry: 'sphere',
        args: [2.2, 8, 6],
        position: [0, 4.5, 0],
        material: { color: 0x1a6a10 },
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