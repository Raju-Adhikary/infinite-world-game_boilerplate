/**
 * Bot Mesh Factory
 * Creates procedural bot models WITH animation rigs (mesh.userData.rig).
 * All bots face local +Z (eyes on the +Z side); bot-ai.js turns them with
 * rotation.y = atan2(dx, dz), which points local +Z along the move direction.
 */
import * as THREE from 'three';

const M = (geo, color) => new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color }));

export function createBotMesh(profile = {}) {
  return profile.type === 'animal' ? _createQuadruped(profile) : _createHumanoid(profile);
}

function _addEyes(parent, y, z, sep = 0.1) {
  const eyeM = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pupilM = new THREE.MeshBasicMaterial({ color: 0x111111 });

  for (const side of [-1, 1]) {
    const eye = M(new THREE.SphereGeometry(0.05, 4, 4), 0xffffff);
    eye.material = eyeM;
    eye.position.set(side * sep, y, z);
    parent.add(eye);

    const pupil = M(new THREE.SphereGeometry(0.025, 4, 4), 0x111111);
    pupil.material = pupilM;
    pupil.position.set(side * sep, y, z + 0.03);
    parent.add(pupil);
  }
}

function _createHumanoid(profile) {
  const g = new THREE.Group();
  const inner = new THREE.Group();
  g.add(inner);

  const bodyCol = profile.bodyColor ?? 0xc08040;
  const headCol = profile.headColor ?? 0xe0b080;

  const body = M(new THREE.CapsuleGeometry(0.3, 0.7, 4, 8), bodyCol);
  body.position.y = 0.85;
  inner.add(body);

  const head = M(new THREE.SphereGeometry(0.25, 8, 6), headCol);
  head.position.y = 1.65;
  inner.add(head);

  _addEyes(inner, 1.7, 0.22);

  // Arms hang from shoulder pivots so they can swing while walking
  const armL = new THREE.Group();
  armL.position.set(-0.42, 1.32, 0);
  const armR = new THREE.Group();
  armR.position.set(0.42, 1.32, 0);
  for (const pivot of [armL, armR]) {
    const arm = M(new THREE.CapsuleGeometry(0.08, 0.42, 4, 6), headCol);
    arm.position.y = -0.3;
    pivot.add(arm);
    pivot.rotation.z = pivot === armL ? 0.12 : -0.12; // slight A-pose rest
    inner.add(pivot);
  }

  // Legs hang from hip pivots
  const legL = new THREE.Group();
  legL.position.set(-0.16, 0.72, 0);
  const legR = new THREE.Group();
  legR.position.set(0.16, 0.72, 0);
  for (const pivot of [legL, legR]) {
    const leg = M(new THREE.CapsuleGeometry(0.1, 0.5, 4, 6), bodyCol);
    leg.position.y = -0.36;
    pivot.add(leg);
    inner.add(pivot);
  }

  g.userData.rig = { kind: 'humanoid', inner, head, armL, armR, legL, legR };
  return g;
}

function _createQuadruped(profile) {
  const g = new THREE.Group();
  const inner = new THREE.Group();
  g.add(inner);

  const bodyCol = profile.bodyColor ?? 0x806040;
  const headCol = profile.headColor ?? 0x907050;

  // Body laid along Z (the facing axis)
  const body = M(new THREE.CapsuleGeometry(0.32, 0.8, 4, 8), bodyCol);
  body.rotation.x = Math.PI / 2;
  body.position.y = 0.85;
  inner.add(body);

  const head = M(new THREE.SphereGeometry(0.26, 8, 6), headCol);
  head.position.set(0, 1.08, 0.62);
  inner.add(head);

  const muzzle = M(new THREE.BoxGeometry(0.16, 0.12, 0.22), headCol);
  muzzle.position.set(0, 1.02, 0.86);
  inner.add(muzzle);

  for (const side of [-1, 1]) {
    const ear = M(new THREE.ConeGeometry(0.06, 0.16, 4), headCol);
    ear.position.set(side * 0.13, 1.34, 0.56);
    inner.add(ear);
  }

  _addEyes(head, 0.06, 0.2, 0.11);

  const tail = M(new THREE.ConeGeometry(0.05, 0.3, 5), headCol);
  tail.position.set(0, 1.0, -0.72);
  tail.rotation.x = -1.0;
  inner.add(tail);

  // Four legs on pivot groups for the trot cycle
  const rig = { kind: 'quadruped', inner, head, tail };
  for (const [name, sx, sz] of [['legFL', -1, 1], ['legFR', 1, 1], ['legBL', -1, -1], ['legBR', 1, -1]]) {
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.18, 0.62, sz * 0.32);
    const leg = M(new THREE.CapsuleGeometry(0.08, 0.42, 4, 6), bodyCol);
    leg.position.y = -0.3;
    pivot.add(leg);
    inner.add(pivot);
    rig[name] = pivot;
  }

  g.userData.rig = rig;
  return g;
}
