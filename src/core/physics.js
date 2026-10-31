/**
 * Physics World
 * Wrapper around Rapier physics engine
 */
import * as THREE from 'three';
import Rapier from '@dimforge/rapier3d-compat';
import { _uid } from './utils.js';

export class PhysicsWorld {
  constructor() {
    this.world = null;
    this.bodies = new Map();
  }

  async init() {
    await Rapier.init();
    this.world = new Rapier.World({ x: 0, y: -9.81, z: 0 });
  }

  step(dt) {
    if (!this.world) return;
    // Rapier's default timestep is fixed at 1/60 regardless of framerate, which
    // makes the whole simulation run faster than real time above 60 FPS and
    // slower below it. Sub-step so each integration stays <= 1/60 while the
    // total advanced time matches the real frame delta.
    const clamped = Math.min(Math.max(dt, 0.0001), 0.05);
    const substeps = Math.max(1, Math.ceil(clamped / (1 / 60)));
    const h = clamped / substeps;
    this.world.timestep = h;
    for (let i = 0; i < substeps; i++) {
      this.world.step();
    }
  }

  createBody(desc, colDesc = null) {
    const b = this.world.createRigidBody(desc);
    let c = null;
    if (colDesc) {
      c = this.world.createCollider(colDesc, b);
    }
    const id = _uid();
    this.bodies.set(id, { body: b, collider: c });
    return { body: b, collider: c, id };
  }

  removeBody(id) {
    const d = this.bodies.get(id);
    if (!d) return;
    if (d.collider) this.world.removeCollider(d.collider);
    this.world.removeRigidBody(d.body);
    this.bodies.delete(id);
  }

  raycast(from, to) {
    if (!this.world) return null;

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dz = to.z - from.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist <= 0) return null;

    const dir = { x: dx / dist, y: dy / dist, z: dz / dist };
    // solid=false: colliders that contain the ray origin are ignored. This
    // lets a ground-check ray start inside the player's own capsule without
    // hitting it at toi=0 (terrain trimeshes are hollow, so a ray starting
    // BELOW the feet would miss the ground entirely).
    return this.world.castRay(new Rapier.Ray(from, dir), dist, false);
  }

  getBodyPos(b) {
    const p = b.translation();
    return new THREE.Vector3(p.x, p.y, p.z);
  }

  bodyCount() {
    return this.bodies.size;
  }
}
