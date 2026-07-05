/**
 * Main Game Class
 * Orchestrates all game systems
 */
import * as THREE from 'three';
import { CFG } from './config/config.js';
import { InputManager } from './ui/input-manager.js';
import { UIManager } from './ui/ui-manager.js';
import { AudioManager } from './core/audio.js';
import { GLBCache } from './core/glb-cache.js';
import { PhysicsWorld } from './core/physics.js';
import { EntityManager } from './entities/entity-manager.js';
import { TerrainHeight } from './world/terrain-height.js';
import { BiomeSystem } from './world/biome-system.js';
import { ChunkManager } from './world/chunk-manager.js';
import { PlayerController } from './player/player-controller.js';
import { updateBots } from './entities/bot-ai.js';

export class Game {
  constructor() {
    this.state = 'loading';
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.clock = new THREE.Clock();
    this.frames = 0;
    this.fpsTime = 0;
    this.fps = 0;
  }

  async boot() {
    const input = new InputManager();
    const ui = new UIManager(input);
    this.ui = ui;

    // Init Three.js
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = CFG.settings.shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    const container = document.createElement('div');
    container.id = 'game-container';
    container.appendChild(this.renderer.domElement);
    document.body.prepend(container);

    // Pointer lock on click
    container.addEventListener('click', () => {
      if (this.state === 'playing' && !input.isTouchDevice) {
        container.requestPointerLock();
      }
    });

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(CFG.world.skyColor);
    this.scene.fog = new THREE.Fog(CFG.world.fogColor, CFG.world.fogNear, CFG.world.fogFar);
    this.camera = new THREE.PerspectiveCamera(
      CFG.settings.fov,
      window.innerWidth / window.innerHeight,
      0.5,
      500
    );

    // Lighting
    const hemi = new THREE.HemisphereLight(0x90a8c0, 0x404020, 0.4);
    this.scene.add(hemi);

    const amb = new THREE.AmbientLight(CFG.world.ambientColor, CFG.world.ambientIntensity);
    this.scene.add(amb);

    const sun = new THREE.DirectionalLight(CFG.world.sunColor, CFG.world.sunIntensity);
    sun.position.set(...CFG.world.sunDir).multiplyScalar(50);
    sun.castShadow = true;
    sun.shadow.mapSize.set(CFG.world.shadowMapSize, CFG.world.shadowMapSize);

    const sc = sun.shadow.camera;
    sc.near = 0.5;
    sc.far = 150;
    sc.left = -60;
    sc.right = 60;
    sc.top = 60;
    sc.bottom = -60;
    sun.shadow.bias = -0.001;

    this.scene.add(sun);
    this.sun = sun;

    // Init systems
    this.input = input;
    this.audio = new AudioManager();
    this.glb = new GLBCache();
    this.entities = new EntityManager();
    this.terrainH = new TerrainHeight(CFG.world.seed);
    this.biome = new BiomeSystem(CFG.world.seed);
    this.physics = new PhysicsWorld();
    await this.physics.init();
    this.chunks = new ChunkManager(this.scene, this.physics, this.entities, this.glb, this.terrainH, this.biome);
    this.player = new PlayerController(this.camera, this.physics, this.input, this.terrainH, this.scene);

    // Touch setup
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      this.input.initTouch();
      this.ui.showMobileControls();
    }

    // Resize
    window.addEventListener('resize', () => this._resize());

    // UI events
    ui.onplay = () => this._startGame();
    ui.onresume = () => this._resumeGame();
    ui.onquit = () => this._quitGame();
    ui.ontogglePause = () => {
      if (this.state === 'playing') this._pauseGame();
      else if (this.state === 'paused') this._resumeGame();
    };
    ui.ontoggleDebug = () => ui.toggleDebug();

    // Show start screen
    ui.hideLoading();
    ui.showStart();

    // Render idle scene
    this._renderIdle();
  }

  _resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.fov = CFG.settings.fov;
    this.camera.updateProjectionMatrix();
    this.renderer.shadowMap.enabled = CFG.settings.shadows;
  }

  _renderIdle() {
    if (this.state !== 'menu') return;

    const t = performance.now() * 0.0002;
    this.camera.position.set(Math.sin(t) * 40, 25, Math.cos(t) * 40);
    this.camera.lookAt(0, 5, 0);
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this._renderIdle());
  }

  _startGame() {
    document.documentElement.requestFullscreen();
    this.state = 'playing';
    this.ui.hideStart();
    this.ui.crosshair.classList.remove('hidden');
    this.input.reset();

    // Find a good spawn point
    const spY = this.terrainH.get(0, 0) + CFG.player.spawnY;
    this.player.spawnPos.set(0, spY, 0);
    this.player.init();

    // Pre-generate some chunks around spawn
    this.chunks.update(0, 0, CFG.settings.renderDist);

    // Start loop
    this.clock.start();
    this._loop();
  }

  _pauseGame() {
    this.state = 'paused';
    this.ui.showPause();
  }

  _resumeGame() {
    this.state = 'playing';
    this.ui.hidePause();
    this.clock.getDelta();
    this._loop();
  }

  _quitGame() {
    this.state = 'menu';
    this.player.destroy();
    this.chunks.unloadAll();
    this.entities.clear();
    this.ui.hidePause();
    this.ui.showStart();
    this._renderIdle();
  }

  _loop() {
    if (this.state !== 'playing') return;
    requestAnimationFrame(() => this._loop());

    const dt = Math.min(this.clock.getDelta(), 0.05);

    // Physics step
    this.physics.step(dt);

    // Player
    const pPos = this.player.update(dt);
    if (!pPos) return;

    // Update shadow to follow player
    this.sun.position.set(
      pPos.x + CFG.world.sunDir[0] * 50,
      pPos.y + CFG.world.sunDir[1] * 50,
      pPos.z + CFG.world.sunDir[2] * 50
    );
    this.sun.target.position.copy(pPos);
    this.sun.target.updateMatrixWorld();

    // Chunks
    this.chunks.update(pPos.x, pPos.z, CFG.settings.renderDist);

    // Bot AI
    updateBots(this.entities, this.physics, this.terrainH, pPos, this.player.body, dt);

    // Entity animations
    for (const entity of this.entities.all()) {
      if (entity.animation && typeof entity.animation.update === 'function') {
        entity.animation.update(dt);
      }
    }

    // Audio
    this.audio.setMaster(CFG.settings.masterVol / 100);

    // FPS counter
    this.frames++;
    this.fpsTime += dt;
    if (this.fpsTime >= 0.5) {
      this.fps = Math.round(this.frames / this.fpsTime);
      this.frames = 0;
      this.fpsTime = 0;
    }

    // Debug
    const ri = this.renderer.info;
    const pos = this.player.getPos();
    const vel = this.player.getVel();
    const currentBiome = this.biome.get(pos.x, pos.z);

    this.ui.updateDebug({
      fps: this.fps,
      entities: this.entities.count(),
      chunks: this.chunks.chunkCount(),
      physicsBodies: this.physics.bodyCount(),
      pos,
      vel,
      drawCalls: ri.render.calls,
      triangles: ri.render.triangles,
      biome: currentBiome,
      entityTypes: this.entities.countByType()
    });

    // Render
    this.renderer.render(this.scene, this.camera);
  }
}
