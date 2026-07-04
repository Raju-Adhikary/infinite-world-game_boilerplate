export const house = {
  biomes: ['plains', 'forest'],
  density: 0.0015,
  minDist: 35,
  scale: [0.9, 1.1],
  fallback: {
    parts: [
      {
        geometry: 'box',
        args: [5, 3.5, 4],
        position: [0, 1.75, 0],
        material: { color: 0xc0a878 },
      },
      {
        geometry: 'cone',
        args: [4, 2, 4],
        position: [0, 4.5, 0],
        rotation: [0, Math.PI / 4, 0],
        material: { color: 0x8b3020 },
      },
    ],
  },
  physics: {
    type: 'cuboid',
    halfExtents: [2.6, 2.2, 2.6],
    offset: [0, 2.2, 0],
  },
};