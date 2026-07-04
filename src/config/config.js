/**
 * Game Configuration
 * Central place for all game settings and constants
 */
import { BOT_PROFILES } from '../entities/profiles/bots/index.js';

export const CFG = {
  world: {
    chunkSize: 64,
    chunkSegments: 28,
    heightScale: 18,
    heightFreq: 0.008,
    heightOctaves: 5,
    loadRadius: 3,
    unloadRadius: 5,
    chunksPerFrame: 2,
    seed: 42,
    fogNear: 80,
    fogFar: 280,
    fogColor: '#8aacb8',
    skyColor: '#8aacb8',
    ambientColor: '#8090a0',
    ambientIntensity: 0.5,
    sunColor: '#fff4e0',
    sunIntensity: 1.4,
    sunDir: [0.6, 0.8, 0.4],
    shadowMapSize: 2048,
  },
  player: {
    height: 1.8,
    radius: 0.4,
    moveSpeed: 8,
    jumpForce: 7,
    cameraDist: 8,
    cameraHeight: 3,
    cameraMinPitch: -0.3,
    cameraMaxPitch: 1.2,
    spawnY: 30,
  },
  biomes: {
    snow: { temp: [0, 0.22], moist: [0, 1], ground: 0xd8dce8, name: 'Snow' },
    tundra: { temp: [0.22, 0.35], moist: [0, 0.35], ground: 0x8a9a80, name: 'Tundra' },
    desert: { temp: [0.72, 1], moist: [0, 0.28], ground: 0xc8a860, name: 'Desert' },
    savanna: { temp: [0.55, 0.72], moist: [0.2, 0.4], ground: 0xa0a050, name: 'Savanna' },
    plains: { temp: [0.35, 0.6], moist: [0.2, 0.5], ground: 0x5a9838, name: 'Plains' },
    forest: { temp: [0.35, 0.6], moist: [0.5, 0.8], ground: 0x2a6828, name: 'Forest' },
    swamp: { temp: [0.5, 0.75], moist: [0.8, 1], ground: 0x384828, name: 'Swamp' },
    jungle: { temp: [0.6, 0.85], moist: [0.6, 1], ground: 0x1a5018, name: 'Jungle' },
  },
  spawns: {
    tree_pine: { biomes: ['snow', 'tundra'], density: { snow: 0.042, tundra: 0.026 }, minDist: 5, scale: [0.8, 1.4] },
    tree_oak: { biomes: ['forest', 'plains'], density: { forest: 0.032, plains: 0.02 }, minDist: 6, scale: [0.7, 1.3] },
    tree_palm: { biomes: ['desert', 'savanna'], density: 0.012, minDist: 7, scale: [0.9, 1.2] },
    tree_jungle: { biomes: ['jungle', 'swamp'], density: { jungle: 0.05, swamp: 0.032 }, minDist: 4, scale: [0.6, 1.5] },
    cactus: { biomes: ['desert'], density: 0.02, minDist: 4, scale: [0.6, 1.1] },
    rock: { biomes: ['desert', 'tundra', 'snow', 'plains'], density: 0.012, minDist: 4, scale: [0.5, 2.0] },
    bush: { biomes: ['plains', 'savanna', 'forest'], density: 0.018, minDist: 3, scale: [0.6, 1.2] },
    mushroom: { biomes: ['swamp', 'jungle'], density: 0.025, minDist: 2, scale: [0.4, 1.0] },
    house: { biomes: ['plains', 'forest'], density: 0.0015, minDist: 35, scale: [0.9, 1.1] },
    dead_tree: { biomes: ['swamp', 'desert'], density: 0.01, minDist: 5, scale: [0.7, 1.2] },
    flower: { biomes: ['plains', 'forest'], density: 0.03, minDist: 1.5, scale: [0.3, 0.6] },
  },
  bots: BOT_PROFILES,
  glbModels: {
    tree_pine: null, tree_oak: null, tree_palm: null, tree_jungle: null,
    cactus: null, rock: null, bush: null, mushroom: null,
    house: null, dead_tree: null, flower: null,
    villager: null, guard: null, animal: null, monster: null,
  },
  sounds: {
    footstep: null, jump: null, land: null,
    ambient_forest: null, ambient_desert: null,
  },
  settings: {
    renderDist: 3, fov: 70, shadows: true, showFps: true,
    masterVol: 80, sfxVol: 70, musicVol: 50,
    sensitivity: 8, invertY: false,
  }
};
