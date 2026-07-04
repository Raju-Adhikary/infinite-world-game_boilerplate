/**
 * GLB Model Cache
 * Handles loading and caching of 3D models with procedural fallbacks
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { BOT_PROFILES } from '../entities/profiles/bots/index.js';
import { SPAWN_PROFILES } from '../entities/profiles/spawns/index.js';

const PROFILE_LOOKUP = {
  ...SPAWN_PROFILES,
  ...BOT_PROFILES,
};

export class GLBCache {
  constructor() {
    this.cache = new Map();
    this.pending = new Map();
    this.loader = new GLTFLoader();
  }

  async load(name, url) {
    if (this.cache.has(name)) return this.cache.get(name);
    if (!url) return this._fallback(name);
    if (this.pending.has(name)) return this.pending.get(name);

    const p = this.loader.loadAsync(url)
      .then(g => {
        const r = { scene: g.scene, animations: g.animations || [] };
        this.cache.set(name, r);
        this.pending.delete(name);
        return r;
      })
      .catch(() => {
        this.pending.delete(name);
        return this._fallback(name);
      });

    this.pending.set(name, p);
    return p;
  }

  _fallback(name) {
    if (this.cache.has(name)) return this.cache.get(name);

    const g = new THREE.Group();
    const profile = PROFILE_LOOKUP[name];

    this._buildProfileFallback(g, profile?.fallback || this._defaultFallback());

    this.cache.set(name, { scene: g, animations: [] });
    return this.cache.get(name);
  }

  _buildProfileFallback(group, fallback) {
    const parts = Array.isArray(fallback?.parts) ? fallback.parts : [];

    if (parts.length === 0) {
      parts.push(...this._defaultFallback().parts);
    }

    for (const part of parts) {
      const mesh = this._buildFallbackPart(part);
      if (mesh) group.add(mesh);
    }
  }

  _defaultFallback() {
    return {
      parts: [
        {
          geometry: 'capsule',
          args: [0.35, 0.8, 4, 8],
          position: [0, 0.9, 0],
          material: { color: 0x888888 },
        },
        {
          geometry: 'sphere',
          args: [0.3, 8, 6],
          position: [0, 1.8, 0],
          material: { color: 0x888888 },
        },
      ],
    };
  }

  _buildFallbackPart(part) {
    const geometry = this._createGeometry(part.geometry, part.args || []);
    if (!geometry) return null;

    const material = new THREE.MeshLambertMaterial(part.material || { color: 0x888888 });
    const mesh = new THREE.Mesh(geometry, material);

    const position = part.position || [0, 0, 0];
    mesh.position.set(position[0] || 0, position[1] || 0, position[2] || 0);

    if (part.rotation) {
      mesh.rotation.set(part.rotation[0] || 0, part.rotation[1] || 0, part.rotation[2] || 0);
    }

    if (part.scale) {
      mesh.scale.set(part.scale[0] || 1, part.scale[1] || 1, part.scale[2] || 1);
    }

    return mesh;
  }

  _createGeometry(kind, args) {
    switch (kind) {
      case 'box':
        return new THREE.BoxGeometry(...args);
      case 'sphere':
        return new THREE.SphereGeometry(...args);
      case 'cylinder':
        return new THREE.CylinderGeometry(...args);
      case 'cone':
        return new THREE.ConeGeometry(...args);
      case 'capsule':
        return new THREE.CapsuleGeometry(...args);
      case 'dodecahedron':
        return new THREE.DodecahedronGeometry(...args);
      default:
        return null;
    }
  }

  createAnimationController(model, root, actionMap = null) {
    const clips = model?.animations || [];
    if (!root || clips.length === 0) return null;

    const mixer = new THREE.AnimationMixer(root);
    const actions = new Map();

    for (const clip of clips) {
      actions.set(clip.name, mixer.clipAction(clip));
    }

    const controller = {
      mixer,
      actions,
      state: null,
      update(dt) {
        mixer.update(dt);
      },
      playAction(action) {
        const clipNames = actionMap && actionMap[action]
          ? (Array.isArray(actionMap[action]) ? actionMap[action] : [actionMap[action]])
          : [action];

        let played = false;
        for (const action of actions.values()) {
          action.fadeOut(0.12);
        }

        for (const clipName of clipNames) {
          const action = actions.get(clipName);
          if (!action) continue;
          action.reset().fadeIn(0.12).play();
          played = true;
        }

        if (played) controller.state = action;
        return played;
      },
    };

    return controller;
  }
}
