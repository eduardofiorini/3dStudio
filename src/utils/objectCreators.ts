import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { loadGLBModel } from './models/modelLoader';

// Initialize Draco loader once
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
dracoLoader.setDecoderConfig({ type: 'js' }); // Use JS decoder for better compatibility

export function createCylinder() {
  const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
  const material = new THREE.MeshStandardMaterial({
    color: '#4a4a4a',
    emissive: new THREE.Color('#e3e3e3'),
    emissiveIntensity: 0,
    metalness: 0,
    roughness: 1,
    envMapIntensity: 0.5,
    transparent: true,
    side: THREE.FrontSide,
    shadowSide: THREE.FrontSide
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.y = 0.5;
  mesh.userData.physicsType = 'kinematicPosition';
  return mesh;
}

export function createCone() {
  const geometry = new THREE.ConeGeometry(0.5, 1, 32);
  const material = new THREE.MeshStandardMaterial({
    color: '#4a4a4a',
    emissive: new THREE.Color('#e3e3e3'),
    emissiveIntensity: 0,
    metalness: 0,
    roughness: 1,
    envMapIntensity: 0.5,
    transparent: true,
    side: THREE.FrontSide,
    shadowSide: THREE.FrontSide
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.y = 0.5;
  mesh.userData.physicsType = 'kinematicPosition';
  return mesh;
}

export function createTorus() {
  const geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 32);
  const material = new THREE.MeshStandardMaterial({
    color: '#4a4a4a',
    emissive: new THREE.Color('#e3e3e3'),
    emissiveIntensity: 0,
    metalness: 0,
    roughness: 1,
    envMapIntensity: 0.5,
    transparent: true
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.material.shadowSide = THREE.FrontSide;
  mesh.userData.physicsType = 'kinematicPosition';
  return mesh;
}

export function createPlane() {
  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: '#4a4a4a',
    emissive: new THREE.Color('#e3e3e3'),
    emissiveIntensity: 0,
    metalness: 0,
    roughness: 1,
    envMapIntensity: 1.0,
    transparent: true,
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.scale.set(2, 2, 2);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0;
  mesh.userData.physicsType = 'static';
  mesh.userData.preserveRotation = true;  // Flag to preserve initial rotation
  return mesh;
}

export function createCube() {
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial({
    color: '#4a4a4a',
    emissive: new THREE.Color('#e3e3e3'),
    emissiveIntensity: 0,
    metalness: 0,
    roughness: 1,
    envMapIntensity: 0.5,
    transparent: true,
    side: THREE.FrontSide,
    shadowSide: THREE.FrontSide
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.physicsType = 'kinematicPosition';
  return mesh;
}

export function createSphere() {
  const geometry = new THREE.SphereGeometry(0.5);
  const material = new THREE.MeshStandardMaterial({
    color: '#4a4a4a',
    emissive: new THREE.Color('#e3e3e3'),
    emissiveIntensity: 0,
    metalness: 0,
    roughness: 1,
    envMapIntensity: 0.5,
    transparent: true,
    side: THREE.FrontSide,
    shadowSide: THREE.FrontSide
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.y = 0.5;
  mesh.userData.physicsType = 'kinematicPosition';
  return mesh;
}

// Re-export loadGLBModel from modelLoader
export { loadGLBModel };