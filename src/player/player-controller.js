/**
 * Player Controller
 * Manages player movement, camera, and physics
 */
import * as THREE from 'three';
import Rapier from '@dimforge/rapier3d-compat';
import { CFG } from '../config/config.js';
import { _clamp } from '../core/utils.js';

export class PlayerController {
  constructor(camera, physics, input, terrainH, scene) {
    this.camera = camera;
    this.physics = physics;
    this.input = input;
    this.terrainH = terrainH;
    this.scene = scene;

    this.yaw = 0;
    this.pitch = 0.5;
    this.grounded = false;
    this.bodyId = null;
    this.body = null;
    this.spawnPos = new THREE.Vector3(0, CFG.player.spawnY, 0);
  }

  init() {
    const p = CFG.player;
    const colDesc = Rapier.ColliderDesc.capsule(p.radius, p.height - p.radius * 2)
      .setTranslation(0, p.height / 2, 0)
      .setMass(1);
    const bodyDesc = Rapier.RigidBodyDesc.dynamic()
      .setTranslation(this.spawnPos.x, this.spawnPos.y, this.spawnPos.z)
      .lockRotations();
    const { body, id } = this.physics.createBody(bodyDesc, colDesc);

    this.body = body;
    this.bodyId = id;
  }

  update(dt) {
    if (!this.body) return;

    const pos = this.physics.getBodyPos(this.body);
    const vel = this.body.linvel();

    // Camera look
    const look = this.input.consumeLook();
    const sens = CFG.settings.sensitivity * 0.001 * (CFG.settings.invertY ? -1 : 1);
    this.yaw -= look.x * sens;
    this.pitch = _clamp(this.pitch - look.y * sens, CFG.player.cameraMinPitch, CFG.player.cameraMaxPitch);

    // Movement
    const mv = this.input.getMove();
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const dir = new THREE.Vector3();
    dir.addScaledVector(forward, -mv.z);
    dir.addScaledVector(right, mv.x);

    if (dir.lengthSq() > 0) dir.normalize();

    const spd = CFG.player.moveSpeed;
    this.body.setLinvel({ x: dir.x * spd, y: vel.y, z: dir.z * spd }, true);

    // Jump
    if (this.input.actions.jump && this.grounded) {
      this.body.setLinvel({ x: vel.x, y: CFG.player.jumpForce, z: vel.z }, true);
      this.grounded = false;
    }

    // Ground check via raycast
    const p = this.body.translation();
    const rayFrom = { x: p.x, y: p.y, z: p.z };
    const rayTo = { x: p.x, y: p.y - CFG.player.height - 0.3, z: p.z };
    const hit = this.physics.raycast(rayFrom, rayTo);
    this.grounded = hit !== null && hit.timeOfImpact < CFG.player.height + 0.3;

    // Update camera
    const cp = CFG.player;
    const camOffset = new THREE.Vector3(
      Math.sin(this.yaw) * Math.cos(this.pitch) * cp.cameraDist,
      Math.sin(this.pitch) * cp.cameraDist + cp.cameraHeight,
      Math.cos(this.yaw) * Math.cos(this.pitch) * cp.cameraDist
    );

    const playerPos = new THREE.Vector3(p.x, p.y + cp.height * 0.6, p.z);
    this.camera.position.copy(playerPos).add(camOffset);
    this.camera.lookAt(playerPos);

    return playerPos;
  }

  getPos() {
    if (!this.body) return this.spawnPos;
    const p = this.body.translation();
    return new THREE.Vector3(p.x, p.y, p.z);
  }

  getVel() {
    if (!this.body) return new THREE.Vector3();
    const v = this.body.linvel();
    return new THREE.Vector3(v.x, v.y, v.z);
  }

  destroy() {
    if (this.bodyId) this.physics.removeBody(this.bodyId);
  }
}
