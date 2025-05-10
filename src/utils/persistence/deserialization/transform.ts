import * as THREE from 'three';
import { SerializedObject } from '../types';

export function deserializeTransform(object: THREE.Object3D, objData: SerializedObject): void {
  if (!objData.position || !objData.rotation || !objData.scale) {
    console.warn('Missing transform data:', objData);
    return;
  }

  try {
    object.position.fromArray(objData.position);
    object.rotation.fromArray(objData.rotation);
    object.scale.fromArray(objData.scale);
    
    // Update matrices
    object.updateMatrix();
    object.updateMatrixWorld(true);
  } catch (error) {
    console.error('Error applying transform:', error);
  }
}