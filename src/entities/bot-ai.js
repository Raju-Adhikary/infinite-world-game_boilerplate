/**
 * Bot AI System
 * Handles AI behavior for bots (villagers, guards, animals, monsters)
 */
import * as THREE from 'three';

export function updateBots(entities, physics, terrainH, playerPos, dt) {
  const bots = entities
    .getByType('villager')
    .concat(entities.getByType('guard'), entities.getByType('animal'), entities.getByType('monster'));

  for (const bot of bots) {
    if (!bot.mesh || bot.bodyId === undefined) continue;

    bot.stateTimer -= dt;

    const bPos = new THREE.Vector3();
    bot.mesh.getWorldPosition(bPos);

    const dx = playerPos.x - bPos.x;
    const dz = playerPos.z - bPos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const dirX = dist > 0.1 ? dx / dist : 0;
    const dirZ = dist > 0.1 ? dz / dist : 0;

    switch (bot.state) {
      case 'idle':
        if (bot.flee > 0 && dist < bot.flee) {
          bot.state = 'flee';
          break;
        }
        if (bot.flee === 0 && dist < bot.detect) {
          bot.state = 'follow';
          break;
        }
        if (bot.stateTimer <= 0) {
          bot.state = 'wander';
          const a = Math.random() * Math.PI * 2;
          const d = 5 + Math.random() * 10;
          bot.targetPos = new THREE.Vector3(
            bPos.x + Math.cos(a) * d,
            0,
            bPos.z + Math.sin(a) * d
          );
          bot.stateTimer = 4 + Math.random() * 5;
        }
        break;

      case 'wander':
        if (bot.flee > 0 && dist < bot.flee) {
          bot.state = 'flee';
          break;
        }
        if (!bot.targetPos || bPos.distanceTo(bot.targetPos) < 1.5 || bot.stateTimer <= 0) {
          bot.state = 'idle';
          bot.stateTimer = 2 + Math.random() * 3;
          break;
        }
        _moveBot(bot, bot.targetPos, bot.speed, dt, terrainH, physics);
        break;

      case 'follow':
        if (dist > bot.detect * 1.5) {
          bot.state = 'idle';
          bot.stateTimer = 1;
          break;
        }
        _moveBot(bot, playerPos, bot.speed, dt, terrainH, physics);
        break;

      case 'flee':
        if (dist > bot.flee * 3.5) {
          bot.state = 'idle';
          bot.stateTimer = 2;
          break;
        }
        const away = new THREE.Vector3(-dirX, 0, -dirZ)
          .normalize()
          .multiplyScalar(20)
          .add(bPos);
        _moveBot(bot, away, bot.speed * 1.3, dt, terrainH, physics);
        break;
    }

    // Face movement direction
    if (bot.state === 'follow' || bot.state === 'flee') {
      const angle = Math.atan2(dirX, dirZ);
      bot.mesh.rotation.y = bot.state === 'flee' ? angle + Math.PI : angle;
    } else if (bot.state === 'wander' && bot.targetPos) {
      const tdx = bot.targetPos.x - bPos.x;
      const tdz = bot.targetPos.z - bPos.z;
      bot.mesh.rotation.y = Math.atan2(tdx, tdz);
    }
  }
}

function _moveBot(bot, target, speed, dt, terrainH, physics) {
  const bPos = new THREE.Vector3();
  bot.mesh.getWorldPosition(bPos);

  const dx = target.x - bPos.x;
  const dz = target.z - bPos.z;
  const dist = Math.sqrt(dx * dx + dz * dz);
  if (dist < 0.3) return;

  const nx = dx / dist;
  const nz = dz / dist;
  const step = speed * dt;

  const newX = bPos.x + nx * step;
  const newZ = bPos.z + nz * step;
  const newY = terrainH.get(newX, newZ);

  bot.mesh.position.set(
    newX - bot.mesh.parent.position.x,
    newY,
    newZ - bot.mesh.parent.position.z
  );

  const body = physics.bodies.get(bot.bodyId);
  if (body) body.body.setTranslation({ x: newX, y: newY, z: newZ }, true);

  bot.position.set(newX, newY, newZ);
}
