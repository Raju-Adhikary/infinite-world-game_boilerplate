export const animal = {
  type: 'animal',
  category: 'bot',
  fallback: {
    parts: [
      {
        geometry: 'capsule',
        args: [0.35, 0.8, 4, 8],
        position: [0, 0.9, 0],
        material: { color: 0x806040 },
      },
      {
        geometry: 'sphere',
        args: [0.3, 8, 6],
        position: [0, 1.8, 0],
        material: { color: 0x907050 },
      },
    ],
  },
  speed: 3.5,
  detect: 10,
  flee: 7,
  behavior: 'flee',
  attackRange: 0,
  attackCooldown: 0,
  attackForce: 0,
  angryDuration: 0,
  biomes: ['forest', 'plains', 'snow', 'tundra'],
  density: { forest: 0.0022, plains: 0.0018, snow: 0.0014, tundra: 0.0012 },
  bodyColor: 0x806040,
  headColor: 0x907050,
  animations: {
    idle: ['idle'],
    walk: ['walk'],
    flee: ['flee'],
  },
};