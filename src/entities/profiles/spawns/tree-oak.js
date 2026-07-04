export const tree_oak = {
  biomes: ['forest', 'plains'],
  density: { forest: 0.032, plains: 0.02 },
  minDist: 6,
  scale: [0.7, 1.3],
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
        position: [0, 4.0, 0],
        material: { color: 0x3a7a2a },
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