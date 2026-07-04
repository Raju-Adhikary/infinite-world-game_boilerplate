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
    if (this.world) this.world.step();
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
    return this.world ? this.world.castRay(new Rapier.Ray(from, to), 1.0, true) : null;
  }

  getBodyPos(b) {
    const p = b.translation();
    return new THREE.Vector3(p.x, p.y, p.z);
  }

  bodyCount() {
    return this.bodies.size;
  }
}
