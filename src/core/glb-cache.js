/**
 * GLB Model Cache
 * Handles loading and caching of 3D models with procedural fallbacks
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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
    const m = new THREE.MeshLambertMaterial({ color: 0x888888 });

    if (name.includes('tree')) {
      const tH = name.includes('pine') ? 5 : name.includes('palm') ? 6 : name.includes('jungle') ? 4 : 4;
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.3, tH, 6),
        new THREE.MeshLambertMaterial({ color: 0x6b4226 })
      );
      trunk.position.y = tH / 2;
      g.add(trunk);

      let leaf;
      if (name.includes('pine')) {
        leaf = new THREE.Mesh(
          new THREE.ConeGeometry(2, tH * 0.8, 8),
          new THREE.MeshLambertMaterial({ color: 0x2a5a1a })
        );
        leaf.position.y = tH * 0.7;
      } else if (name.includes('palm')) {
        leaf = new THREE.Mesh(
          new THREE.SphereGeometry(2.5, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.5),
          new THREE.MeshLambertMaterial({ color: 0x3a8a20 })
        );
        leaf.position.y = tH;
      } else {
        leaf = new THREE.Mesh(
          new THREE.SphereGeometry(2.2, 8, 6),
          new THREE.MeshLambertMaterial({ color: name.includes('jungle') ? 0x1a6a10 : 0x3a7a2a })
        );
        leaf.position.y = tH + 0.5;
      }
      g.add(leaf);

    } else if (name.includes('rock')) {
      const s = 0.5 + Math.random() * 1.5;
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(s, 0),
        new THREE.MeshLambertMaterial({ color: 0x808080, flatShading: true })
      );
      rock.position.y = s * 0.4;
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      g.add(rock);

    } else if (name.includes('cactus')) {
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.35, 3, 8),
        new THREE.MeshLambertMaterial({ color: 0x3a8a30 })
      );
      body.position.y = 1.5;
      g.add(body);

      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 1.2, 6),
        new THREE.MeshLambertMaterial({ color: 0x3a8a30 })
      );
      arm.position.set(0.6, 1.8, 0);
      arm.rotation.z = -0.6;
      g.add(arm);

    } else if (name.includes('bush')) {
      for (let i = 0; i < 4; i++) {
        const s = new THREE.Mesh(
          new THREE.SphereGeometry(0.6 + Math.random() * 0.4, 6, 5),
          new THREE.MeshLambertMaterial({ color: 0x3a7a2a })
        );
        s.position.set(
          (Math.random() - 0.5) * 0.8,
          0.5 + Math.random() * 0.3,
          (Math.random() - 0.5) * 0.8
        );
        g.add(s);
      }

    } else if (name.includes('mushroom')) {
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 0.5, 6),
        new THREE.MeshLambertMaterial({ color: 0xe0d0b0 })
      );
      stem.position.y = 0.25;
      g.add(stem);

      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.55),
        new THREE.MeshLambertMaterial({ color: 0xc03030 })
      );
      cap.position.y = 0.5;
      g.add(cap);

    } else if (name.includes('house')) {
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(5, 3.5, 4),
        new THREE.MeshLambertMaterial({ color: 0xc0a878 })
      );
      base.position.y = 1.75;
      g.add(base);

      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(4, 2, 4),
        new THREE.MeshLambertMaterial({ color: 0x8b3020 })
      );
      roof.position.y = 4.5;
      roof.rotation.y = Math.PI / 4;
      g.add(roof);

    } else if (name.includes('dead_tree')) {
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.25, 4, 5),
        new THREE.MeshLambertMaterial({ color: 0x5a4a30 })
      );
      trunk.position.y = 2;
      trunk.rotation.z = 0.1;
      g.add(trunk);

      for (let i = 0; i < 3; i++) {
        const b = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.08, 1.5, 4),
          new THREE.MeshLambertMaterial({ color: 0x5a4a30 })
        );
        b.position.set(
          (Math.random() - 0.5) * 1.5,
          2.5 + Math.random(),
          (Math.random() - 0.5) * 0.5
        );
        b.rotation.set(Math.random() - 0.5, 0, Math.random() - 0.5);
        g.add(b);
      }

    } else if (name.includes('flower')) {
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4),
        new THREE.MeshLambertMaterial({ color: 0x3a7a20 })
      );
      stem.position.y = 0.25;
      g.add(stem);

      const colors = [0xff6060, 0xffff40, 0xff80d0, 0x80a0ff, 0xffa040];
      const petal = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 6, 4),
        new THREE.MeshLambertMaterial({ color: colors[Math.floor(Math.random() * colors.length)] })
      );
      petal.position.y = 0.55;
      g.add(petal);

    } else {
      // Bot fallback
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 0.8, 4, 8), m.clone());
      body.position.y = 0.9;
      g.add(body);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), m.clone());
      head.position.y = 1.8;
      g.add(head);
    }

    this.cache.set(name, { scene: g, animations: [] });
    return this.cache.get(name);
  }
}
