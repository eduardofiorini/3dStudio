import { Object3D, Vector3, Euler } from 'three';

export interface StoredTransform {
  position: Vector3;
  rotation: Euler;
  scale: Vector3;
}

export function getInitialTransform(object: Object3D): StoredTransform | null {
  return object.userData.initialTransform || null;
}

export function storeInitialTransform(object: Object3D) {
  if (!object.userData.initialTransform) {
    // Store the current scale before physics is enabled
    object.userData.initialTransform = {
      position: object.position.clone(),
      rotation: object.rotation.clone(),
      scale: object.scale.clone()
    };
    // Store the scale separately for physics calculations
    object.userData.physicsScale = object.scale.clone();
  }
}