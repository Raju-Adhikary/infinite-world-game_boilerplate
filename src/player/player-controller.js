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
    this.pitch = 0.12;
    this.grounded = false;
    this.bodyId = null;
    this.body = null;
    this.avatar = null;
    this.spawnPos = new THREE.Vector3(0, CFG.player.spawnY, 0);
  }

  _createAvatar() {
    const g = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.38, 0.78, 4, 8),
      new THREE.MeshLambertMaterial({ color: 0x3d4f78 })
    );
    body.position.y = 0.92;
    body.castShadow = true;
    g.add(body);

    const chest = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.36, 0.8, 8),
      new THREE.MeshLambertMaterial({ color: 0xd5b08a })
    );
    chest.position.y = 0.9;
    chest.castShadow = true;
    g.add(chest);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 8, 6),
      new THREE.MeshLambertMaterial({ color: 0xe8c39c })
    );
    head.position.y = 1.78;
    head.castShadow = true;
    g.add(head);

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 4, 4), eyeMat);
      eye.position.set(side * 0.07, 1.82, 0.22);
      g.add(eye);
    }

    const armMat = new THREE.MeshLambertMaterial({ color: 0xd5b08a });
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.42, 4, 6), armMat);
      arm.position.set(side * 0.42, 1.08, 0);
      arm.rotation.z = side * 0.18;
      arm.castShadow = true;
      g.add(arm);
    }

    const legMat = new THREE.MeshLambertMaterial({ color: 0x2f2f3f });
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.56, 4, 6), legMat);
      leg.position.set(side * 0.16, 0.28, 0);
      leg.castShadow = true;
      g.add(leg);
    }

    g.visible = false;
    return g;
  }

  init() {
    const p = CFG.player;
    // Rapier capsule is capsule(halfHeight, radius); total height = 2*halfHeight + 2*radius.
    // The old call passed the arguments swapped, inflating the collider to a
    // 2.8m x 2m blob that wedged the player inside trees and blocks.
    const colDesc = Rapier.ColliderDesc.capsule((p.height - p.radius * 2) / 2, p.radius)
      .setTranslation(0, p.height / 2, 0)
      .setMass(1);
    const bodyDesc = Rapier.RigidBodyDesc.dynamic()
      .setTranslation(this.spawnPos.x, this.spawnPos.y, this.spawnPos.z)
      .lockRotations();
    const { body, id } = this.physics.createBody(bodyDesc, colDesc);

    this.body = body;
    this.bodyId = id;

    this.avatar = this._createAvatar();
    this.scene.add(this.avatar);
  }

  _cameraMode() {
    return CFG.settings.cameraMode || 'third-person';
  }

  _updateAvatar(bodyPos, yaw) {
    if (!this.avatar) return;

    const mode = this._cameraMode();
    const isFirstPerson = mode === 'first-person';
    this.avatar.visible = !isFirstPerson;

    if (isFirstPerson) return;

    this.avatar.position.copy(bodyPos);
    // The avatar model's face is on its local +Z side. Rotating by yaw alone
    // points +Z OPPOSITE to the camera forward direction (-sin yaw, -cos yaw),
    // so the character walked backwards staring at the camera. yaw + PI makes
    // the face point where the player is actually heading.
    this.avatar.rotation.y = yaw + Math.PI;
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
    const moveForward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const dir = new THREE.Vector3();
    dir.addScaledVector(moveForward, -mv.z);
    dir.addScaledVector(right, mv.x);

    if (dir.lengthSq() > 0) dir.normalize();

    const spd = CFG.player.moveSpeed;
    this.body.setLinvel({ x: dir.x * spd, y: vel.y, z: dir.z * spd }, true);

    // Ground check via raycast. The ray starts slightly above the feet and
    // physics.raycast uses solid=false, so the player's own capsule (which
    // contains the ray origin) is ignored - a solid raycast from inside the
    // body reported "grounded" every frame at toi=0. The downward-velocity
    // guard keeps the ascending phase of a jump from re-triggering it.
    const p = this.body.translation();
    const rayFrom = { x: p.x, y: p.y + 0.1, z: p.z };
    const rayTo = { x: p.x, y: p.y - 0.5, z: p.z };
    const hit = this.physics.raycast(rayFrom, rayTo);
    // Rapier 0.12 exposes the hit distance as `toi` (newer builds renamed it
    // to `timeOfImpact`) - reading only the new name made grounded forever
    // false, so jumping never worked.
    const hitDist = hit ? (hit.timeOfImpact ?? hit.toi) : null;
    this.grounded = hit !== null && hitDist < 0.45 && vel.y <= 0.1;

    // Jump (keep current horizontal velocity; the stale pre-movement value
    // captured above would cancel the speed the player just accelerated to)
    if (this.input.actions.jump && this.grounded) {
      this.body.setLinvel({ x: dir.x * spd, y: CFG.player.jumpForce, z: dir.z * spd }, true);
      this.grounded = false;
    }

    // Update camera
    const cp = CFG.player;

    // Frame the character around upper-chest/head height instead of the belly
    const lookTarget = new THREE.Vector3(p.x, p.y + cp.height * 0.75, p.z);
    this._updateAvatar(new THREE.Vector3(p.x, p.y, p.z), this.yaw);

    const eyePos = new THREE.Vector3(p.x, p.y + cp.height * 0.9, p.z);
    const forward = new THREE.Vector3(
      -Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      -Math.cos(this.yaw) * Math.cos(this.pitch)
    ).normalize();

    const mode = this._cameraMode();
    if (mode === 'first-person') {
      this.camera.position.copy(eyePos);
      this.camera.lookAt(eyePos.clone().add(forward));
    } else {
      const dist = mode === 'shoulder' ? Math.max(4, cp.cameraDist * 0.7) : cp.cameraDist;
      const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
      const offset = forward.clone().multiplyScalar(-dist).addScaledVector(new THREE.Vector3(0, 1, 0), cp.cameraHeight);

      if (mode === 'shoulder') {
        offset.addScaledVector(right, dist * 0.35);
      }

      const desired = lookTarget.clone().add(offset);

      // Pull the camera in when terrain or props block the line of sight,
      // otherwise the view clips through hills and trees.
      const toCam = desired.clone().sub(lookTarget);
      const camDist = toCam.length();
      if (camDist > 0.01) {
        toCam.divideScalar(camDist);
        const hit = this.physics.raycast(lookTarget, desired);
        const toi = hit ? (hit.timeOfImpact ?? hit.toi) : null;
        if (toi !== null && toi < camDist) {
          desired.copy(lookTarget).addScaledVector(toCam, Math.max(0.6, toi - 0.25));
        }
      }

      // Never let the camera dip below the ground surface
      const groundY = this.terrainH.get(desired.x, desired.z) + 0.3;
      if (desired.y < groundY) desired.y = groundY;

      this.camera.position.copy(desired);
      this.camera.lookAt(lookTarget);
    }

    return lookTarget;
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
    if (this.avatar) this.scene.remove(this.avatar);
  }
}
