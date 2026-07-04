export const tree_palm = {
  biomes: ['desert', 'savanna'],
  density: 0.012,
  minDist: 7,
  scale: [0.9, 1.2],
  fallback: {
    parts: [
      {
        geometry: 'cylinder',
        args: [0.2, 0.3, 6, 6],
        position: [0, 3.0, 0],
        material: { color: 0x6b4226 },
      },
      {
        geometry: 'sphere',
        args: [2.5, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.5],
        position: [0, 6.0, 0],
        material: { color: 0x3a8a20 },
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