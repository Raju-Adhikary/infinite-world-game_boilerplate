export const monster = {
  type: 'monster',
  category: 'bot',
  fallback: {
    parts: [
      {
        geometry: 'capsule',
        args: [0.35, 0.8, 4, 8],
        position: [0, 0.9, 0],
        material: { color: 0x403020 },
      },
      {
        geometry: 'sphere',
        args: [0.3, 8, 6],
        position: [0, 1.8, 0],
        material: { color: 0xa02020 },
      },
    ],
  },
  speed: 2.0,
  detect: 25,
  flee: 0,
  behavior: 'aggressive',
  attackRange: 2.4,
  attackCooldown: 1.5,
  attackForce: 10,
  angryDuration: 6,
  biomes: ['swamp', 'jungle'],
  density: { swamp: 0.0009, jungle: 0.001 },
  bodyColor: 0x403020,
  headColor: 0xa02020,
  animations: {
    idle: ['idle'],
    walk: ['walk'],
    angry: ['angry'],
    attack: ['attack'],
  },
};