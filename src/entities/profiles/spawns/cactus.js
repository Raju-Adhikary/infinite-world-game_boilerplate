export const cactus = {
  biomes: ['desert'],
  density: 0.02,
  minDist: 4,
  scale: [0.6, 1.1],
  fallback: {
    parts: [
      {
        geometry: 'cylinder',
        args: [0.3, 0.35, 3, 8],
        position: [0, 1.5, 0],
        material: { color: 0x3a8a30 },
      },
      {
        geometry: 'cylinder',
        args: [0.15, 0.15, 1.2, 6],
        position: [0.6, 1.8, 0],
        rotation: [0, 0, -0.6],
        material: { color: 0x3a8a30 },
      },
    ],
  },
  physics: {
    type: 'capsule',
    halfHeight: 1.0,
    radius: 0.28,
    offset: [0, 1.28, 0],
  },
};