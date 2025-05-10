import * as THREE from 'three';
import { MaterialOptions, createStandardMaterial } from '../materials/standardMaterial';

export interface ObjectOptions {
  position?: { x?: number; y?: number; z?: number };
  rotation?: { x?: number; y?: number; z?: number };
  scale?: { x?: number; y?: number; z?: number };
  material?: MaterialOptions;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

export function setupBaseMesh(mesh: THREE.Mesh, options: ObjectOptions = {}) {
  return setupBaseObject(mesh, options);
}

export function setupBaseObject(object: THREE.Object3D, options: ObjectOptions = {}) {
  // Position
  if (options.position) {
    object.position.x = options.position.x ?? object.position.x;
    object.position.y = options.position.y ?? object.position.y;
    object.position.z = options.position.z ?? object.position.z;
  }

  // Rotation
  if (options.rotation) {
    object.rotation.x = options.rotation.x ?? object.rotation.x;
    object.rotation.y = options.rotation.y ?? object.rotation.y;
    object.rotation.z = options.rotation.z ?? object.rotation.z;
  }

  // Scale
  if (options.scale) {
    object.scale.x = options.scale.x ?? object.scale.x;
    object.scale.y = options.scale.y ?? object.scale.y;
    object.scale.z = options.scale.z ?? object.scale.z;
  }

  // Shadows (only for meshes)
  if (object instanceof THREE.Mesh) {
    object.castShadow = options.castShadow ?? true;
    object.receiveShadow = options.receiveShadow ?? true;
  }

  return object;
}