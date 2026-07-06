/**
 * Sky System
 * Manages sun mesh, clouds, and sky effects
 */
import * as THREE from 'three';
import { CFG } from '../config/config.js';

export class SkySystem {
  constructor(scene) {
    this.scene = scene;
    this.sunMesh = null;
    this.clouds = [];
    this.cloudGroup = new THREE.Group();
    this.scene.add(this.cloudGroup);
    
    this._createSun();
    this._createClouds();
  }

  _createSun() {
    // Sun geometry - a simple sphere
    const sunGeo = new THREE.SphereGeometry(2, 32, 32);
    
    // Sun material with emissive glow
    const sunMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(CFG.world.sunColor),
      emissive: new THREE.Color(CFG.world.sunColor),
      emissiveIntensity: 0.8,
    });
    
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.sunMesh.castShadow = false;
    this.sunMesh.receiveShadow = false;
    
    // Add a glow halo using a larger sphere
    const haloGeo = new THREE.SphereGeometry(2.5, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(CFG.world.sunColor),
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide,
    });
    
    const halo = new THREE.Mesh(haloGeo, haloMat);
    this.sunMesh.add(halo);
    
    this.scene.add(this.sunMesh);
  }

  _createClouds() {
    const cloudCount = 15;
    
    for (let i = 0; i < cloudCount; i++) {
      const cloud = this._createCloudPuff();
      
      // Random positioning in a band above the world
      const angle = (i / cloudCount) * Math.PI * 2;
      const distance = 100 + Math.random() * 50;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      const y = 60 + Math.random() * 20;
      
      cloud.position.set(x, y, z);
      this.cloudGroup.add(cloud);
      
      this.clouds.push({
        mesh: cloud,
        speed: 0.5 + Math.random() * 1.5,
        angle: angle,
        distance: distance,
      });
    }
  }

  _createCloudPuff() {
    const cloudGroup = new THREE.Group();
    
    // Create a cloud from multiple spheres
    const puffCount = 3 + Math.floor(Math.random() * 3);
    const scale = 3 + Math.random() * 4;
    
    for (let i = 0; i < puffCount; i++) {
      const puffGeo = new THREE.SphereGeometry(scale, 16, 16);
      const puffMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xcccccc,
        emissiveIntensity: 0.3,
        roughness: 0.8,
        metalness: 0.0,
      });
      
      const puff = new THREE.Mesh(puffGeo, puffMat);
      puff.castShadow = false;
      puff.receiveShadow = false;
      
      // Offset each puff to form a cloud shape
      puff.position.x = (i - puffCount / 2) * scale * 0.7;
      puff.position.y = (Math.random() - 0.5) * scale * 0.3;
      puff.scale.y = 0.6;
      
      cloudGroup.add(puff);
    }
    
    return cloudGroup;
  }

  update(playerPos) {
    // Update sun position to follow player
    this.sunMesh.position.set(
      playerPos.x + CFG.world.sunDir[0] * 120,
      100 + CFG.world.sunDir[1] * 60,
      playerPos.z + CFG.world.sunDir[2] * 120
    );

    // Update cloud positions - simple circular motion
    const time = performance.now() * 0.00005;
    
    for (const cloud of this.clouds) {
      const newAngle = cloud.angle + time * cloud.speed * 0.1;
      const x = playerPos.x + Math.cos(newAngle) * cloud.distance;
      const z = playerPos.z + Math.sin(newAngle) * cloud.distance;
      
      cloud.mesh.position.x = x;
      cloud.mesh.position.z = z;
    }
  }

  dispose() {
    // Clean up geometries and materials
    if (this.sunMesh) {
      this.sunMesh.geometry.dispose();
      this.sunMesh.material.dispose();
      if (this.sunMesh.children[0]) {
        this.sunMesh.children[0].geometry.dispose();
        this.sunMesh.children[0].material.dispose();
      }
    }

    for (const cloud of this.clouds) {
      cloud.mesh.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    }
  }
}
