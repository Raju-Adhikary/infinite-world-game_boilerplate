export const dead_tree = {
  biomes: ['swamp', 'desert'],
  density: 0.01,
  minDist: 5,
  scale: [0.7, 1.2],
  fallback: {
    parts: [
      {
        geometry: 'cylinder',
        args: [0.15, 0.25, 4, 5],
        position: [0, 2, 0],
        rotation: [0, 0, 0.1],
        material: { color: 0x5a4a30 },
      },
      {
        geometry: 'cylinder',
        args: [0.04, 0.08, 1.5, 4],
        position: [-0.4, 3.0, 0.1],
        rotation: [-0.2, 0, 0.1],
        material: { color: 0x5a4a30 },
      },
      {
        geometry: 'cylinder',
        args: [0.04, 0.08, 1.5, 4],
        position: [0.5, 3.3, -0.1],
        rotation: [0.3, 0, -0.4],
        material: { color: 0x5a4a30 },
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