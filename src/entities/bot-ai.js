/**
 * Bot AI System
 * Handles AI behavior for bots (villagers, guards, animals, monsters)
 */
import * as THREE from 'three';

export function updateBots(entities, physics, terrainH, playerPos, playerBody, dt) {
  const bots = entities.all().filter(bot => bot && bot.category === 'bot');

  for (const bot of bots) {
    if (!bot.mesh || bot.bodyId === undefined) continue;

    bot.stateTimer -= dt;
    bot.attackTimer = Math.max(0, (bot.attackTimer || 0) - dt);
    bot.angerTimer = Math.max(0, (bot.angerTimer || 0) - dt);

    const bPos = new THREE.Vector3();
    bot.mesh.getWorldPosition(bPos);

    const behavior = bot.behavior || (bot.flee > 0 ? 'flee' : bot.attackRange > 0 ? 'aggressive' : 'passive');
    const attackRange = bot.attackRange || 0;
    const attackReady = bot.attackTimer <= 0;

    const dx = playerPos.x - bPos.x;
    const dz = playerPos.z - bPos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const dirX = dist > 0.1 ? dx / dist : 0;
    const dirZ = dist > 0.1 ? dz / dist : 0;
    let nextAction = 'idle';

    switch (bot.state) {
      case 'idle':
        if (bot.flee > 0 && dist < bot.flee) {
          bot.state = 'flee';
          break;
        }
        if (behavior === 'aggressive' && dist < bot.detect) {
          bot.state = 'angry';
          bot.angerTimer = Math.max(bot.angerTimer, bot.angryDuration || 3);
          break;
        }
        if (bot.flee === 0 && behavior !== 'aggressive' && dist < bot.detect) {
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
        nextAction = 'idle';
        break;

      case 'wander':
        if (bot.flee > 0 && dist < bot.flee) {
          bot.state = 'flee';
          break;
        }
        if (behavior === 'aggressive' && dist < bot.detect) {
          bot.state = 'angry';
          bot.angerTimer = Math.max(bot.angerTimer, bot.angryDuration || 3);
          break;
        }
        if (!bot.targetPos || bPos.distanceTo(bot.targetPos) < 1.5 || bot.stateTimer <= 0) {
          bot.state = 'idle';
          bot.stateTimer = 2 + Math.random() * 3;
          break;
        }
        _moveBot(bot, bot.targetPos, bot.speed, dt, terrainH, physics);
        nextAction = 'walk';
        break;

      case 'follow':
        if (dist > bot.detect * 1.5) {
          bot.state = 'idle';
          bot.stateTimer = 1;
          break;
        }
        _moveBot(bot, playerPos, bot.speed, dt, terrainH, physics);
        nextAction = 'walk';
        break;

      case 'angry':
        if (bot.flee > 0 && dist < bot.flee) {
          bot.state = 'flee';
          break;
        }
        if (dist > bot.detect * 1.7 && bot.angerTimer <= 0) {
          bot.state = 'idle';
          bot.stateTimer = 1.2;
          break;
        }
        if (attackRange > 0 && dist <= attackRange && attackReady) {
          bot.state = 'attack';
          bot.stateTimer = 0.35;
          bot.attackTimer = bot.attackCooldown || 1.2;
          _attackPlayer(bot, playerPos, playerBody, bPos);
          nextAction = 'attack';
          break;
        }
        _moveBot(bot, playerPos, bot.speed * 1.08, dt, terrainH, physics);
        nextAction = 'angry';
        break;

      case 'attack':
        nextAction = 'attack';
        if (bot.stateTimer <= 0) {
          bot.state = dist <= bot.detect * 1.7 ? 'angry' : 'idle';
          bot.stateTimer = 0.6;
        }
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
        nextAction = 'flee';
        break;
    }

    // Face movement direction
    if (bot.state === 'follow' || bot.state === 'flee' || bot.state === 'angry' || bot.state === 'attack') {
      const angle = Math.atan2(dirX, dirZ);
      bot.mesh.rotation.y = bot.state === 'flee' ? angle + Math.PI : angle;
    } else if (bot.state === 'wander' && bot.targetPos) {
      const tdx = bot.targetPos.x - bPos.x;
      const tdz = bot.targetPos.z - bPos.z;
      bot.mesh.rotation.y = Math.atan2(tdx, tdz);
    }

    bot.action = nextAction;

    if (bot.animation && bot.animation.state !== bot.action) {
      const played = bot.animation.playAction(bot.action);
      if (!played && bot.animation.state !== 'idle') {
        bot.animation.playAction('idle');
      }
    }
  }
}

function _attackPlayer(bot, playerPos, playerBody, bPos) {
  if (!playerBody || typeof playerBody.applyImpulse !== 'function') return;

  const dx = playerPos.x - bPos.x;
  const dz = playerPos.z - bPos.z;
  const dist = Math.max(0.001, Math.sqrt(dx * dx + dz * dz));
  const nx = dx / dist;
  const nz = dz / dist;
  const force = bot.attackForce || 8;

  playerBody.applyImpulse({ x: nx * force, y: 1.5, z: nz * force }, true);
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
