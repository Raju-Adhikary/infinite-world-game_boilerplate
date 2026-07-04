/**
 * Bot Mesh Factory
 * Creates procedural bot models
 */
import * as THREE from 'three';

export function createBotMesh(bodyCol, headCol) {
  const g = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.3, 0.7, 4, 8),
    new THREE.MeshLambertMaterial({ color: bodyCol })
  );
  body.position.y = 0.85;
  g.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 8, 6),
    new THREE.MeshLambertMaterial({ color: headCol })
  );
  head.position.y = 1.65;
  g.add(head);

  // Eyes
  const eyeM = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pupilM = new THREE.MeshBasicMaterial({ color: 0x111111 });

  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 4, 4), eyeM);
    eye.position.set(side * 0.1, 1.7, 0.22);
    g.add(eye);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), pupilM);
    pupil.position.set(side * 0.1, 1.7, 0.25);
    g.add(pupil);
  }

  return g;
}
