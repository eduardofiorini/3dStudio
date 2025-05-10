import * as THREE from 'three';
import { ObjectOptions, setupBaseMesh } from './baseObject';
import { createStandardMaterial } from '../materials/standardMaterial';
import { setupBaseObject } from './baseObject';
import { CapsuleGeometry } from 'three';

const DEFAULT_COLOR = '#636363';  // Ensure consistent color across primitives

function generateObjectName(prefix: string): string {
  // Get all objects with this prefix
  const objects = window.__THREE_OBJECTS || [];
  const count = objects.filter(obj => 
    obj.name && obj.name.startsWith(prefix)
  ).length;
  
  // Return name with incremented number
  return count === 0 ? prefix : `${prefix}_${count + 1}`;
}

export function createEmptyEntity(options: ObjectOptions = {}) {
  const group = new THREE.Group();
  group.userData.objectType = 'Empty';
  group.name = generateObjectName('empty');
  return setupBaseObject(group, options);
}

export function createCube(options: ObjectOptions = {}) {
  const geometry = new THREE.BoxGeometry();
  const material = createStandardMaterial({
    color: DEFAULT_COLOR,
    emissive: '#000000',
    emissiveIntensity: 0,
    opacity: 1,
    transparent: false,
    metalness: 0,
    roughness: 0.7,
    ...options.material
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.objectType = 'Cube';
  mesh.name = generateObjectName('cube');
  mesh.userData.physicsEnabled = false; // Disable physics by default
  // Don't set default y position here - let setupBaseMesh handle it

  return setupBaseMesh(mesh, options);
}

export function createSphere(options: ObjectOptions = {}) {
  const geometry = new THREE.SphereGeometry(0.5);
  const material = createStandardMaterial({
    color: DEFAULT_COLOR,
    opacity: 1,
    transparent: false,
    ...options.material
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.objectType = 'Sphere';
  mesh.name = generateObjectName('sphere');
  return setupBaseMesh(mesh, { 
    ...options,
    position: { y: 0.5, ...options.position }
  });
}

export function createCylinder(options: ObjectOptions = {}) {
  const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
  const material = createStandardMaterial({
    color: DEFAULT_COLOR,
    opacity: 1,
    transparent: false,
    ...options.material
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = generateObjectName('cylinder');
  return setupBaseMesh(mesh, {
    ...options,
    position: { y: 0.5, ...options.position }
  });
}

export function createCone(options: ObjectOptions = {}) {
  const geometry = new THREE.ConeGeometry(0.5, 1, 32);
  const material = createStandardMaterial({
    color: DEFAULT_COLOR,
    opacity: 1,
    transparent: false,
    ...options.material
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = generateObjectName('cone');
  return setupBaseMesh(mesh, {
    ...options,
    position: { y: 0.5, ...options.position }
  });
}

export function createTorus(options: ObjectOptions = {}) {
  const geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 32);
  const material = createStandardMaterial({
    color: DEFAULT_COLOR,
    opacity: 1,
    transparent: false,
    ...options.material
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = generateObjectName('torus');
  return setupBaseMesh(mesh, options);
}

export function createCapsule(options: ObjectOptions = {}) {
  const geometry = new CapsuleGeometry(0.5, 1, 16, 32);
  const material = createStandardMaterial({
    color: DEFAULT_COLOR,
    opacity: 1,
    transparent: false,
    ...options.material
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.objectType = 'Capsule';
  mesh.name = generateObjectName('capsule');
  return setupBaseMesh(mesh, {
    ...options,
    position: { y: 0.5, ...options.position }
  });
}

export function createPlane(options: ObjectOptions = {}) {
  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = createStandardMaterial({
    ...options.material,
    color: DEFAULT_COLOR,
    opacity: 1,
    transparent: false,
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = generateObjectName('plane');
  return setupBaseMesh(mesh, {
    ...options,
    scale: { x: 2, y: 2, z: 2, ...options.scale },
    rotation: { x: -Math.PI / 2, ...options.rotation },
    position: { y: 0, ...options.position }
  });
}