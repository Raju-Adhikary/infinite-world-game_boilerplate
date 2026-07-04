export const rock = {
  biomes: ['desert', 'tundra', 'snow', 'plains'],
  density: 0.012,
  minDist: 4,
  scale: [0.5, 2.0],
  fallback: {
    parts: [
      {
        geometry: 'dodecahedron',
        args: [1.1, 0],
        position: [0, 0.45, 0],
        rotation: [0.6, 0.8, 0.2],
        material: { color: 0x808080, flatShading: true },
      },
    ],
  },
  physics: {
    type: 'ball',
    radius: 1.15,
    offset: [0, 1.15, 0],
  },
};