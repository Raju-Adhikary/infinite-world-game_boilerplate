export const villager = {
  type: 'villager',
  category: 'bot',
  fallback: {
    parts: [
      {
        geometry: 'capsule',
        args: [0.35, 0.8, 4, 8],
        position: [0, 0.9, 0],
        material: { color: 0xc08040 },
      },
      {
        geometry: 'sphere',
        args: [0.3, 8, 6],
        position: [0, 1.8, 0],
        material: { color: 0xe0b080 },
      },
    ],
  },
  speed: 1.6,
  detect: 14,
  flee: 5,
  behavior: 'social',
  attackRange: 0,
  attackCooldown: 0,
  attackForce: 0,
  angryDuration: 0,
  biomes: ['plains', 'forest'],
  // density = chance that ONE villager spawns in a matching chunk
  density: { plains: 0.2, forest: 0.1 },
  bodyColor: 0xc08040,
  headColor: 0xe0b080,
  animations: {
    idle: ['idle'],
    walk: ['walk'],
  },
};