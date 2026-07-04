export const bush = {
  biomes: ['plains', 'savanna', 'forest'],
  density: 0.018,
  minDist: 3,
  scale: [0.6, 1.2],
  fallback: {
    parts: [
      {
        geometry: 'sphere',
        args: [0.7, 6, 5],
        position: [-0.2, 0.6, -0.1],
        material: { color: 0x3a7a2a },
      },
      {
        geometry: 'sphere',
        args: [0.65, 6, 5],
        position: [0.25, 0.7, 0.15],
        material: { color: 0x3a7a2a },
      },
    ],
  },
  physics: {
    type: 'ball',
    radius: 0.7,
    offset: [0, 0.7, 0],
  },
};