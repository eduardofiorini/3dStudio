import { Object3D, MathUtils } from 'three';
import { Axis } from './types';

export const rotationHistory = new WeakMap<Object3D, Record<Axis, number>>();

export function updateRotation(object: Object3D, axis: Axis, degrees: number) {
  // Initialize rotation history for this object if needed
  if (!rotationHistory.has(object)) {
    rotationHistory.set(object, {
      x: MathUtils.radToDeg(object.rotation.x),
      y: MathUtils.radToDeg(object.rotation.y),
      z: MathUtils.radToDeg(object.rotation.z)
    });
  }
  
  const history = rotationHistory.get(object)!;
  history[axis] = degrees;
  
  // Convert to radians and apply
  object.rotation[axis] = MathUtils.degToRad(degrees);
  object.updateMatrix();
  object.updateMatrixWorld(true);
}

export function getRotationDegrees(object: Object3D, axis: Axis): number {
  const history = rotationHistory.get(object);
  if (history) {
    return history[axis];
  }
  return MathUtils.radToDeg(object.rotation[axis]);
}

export function updateRotationHistory(object: Object3D, rotation: { x: number; y: number; z: number }) {
  rotationHistory.set(object, {
    x: MathUtils.radToDeg(rotation.x),
    y: MathUtils.radToDeg(rotation.y),
    z: MathUtils.radToDeg(rotation.z)
  });
}

export function clearRotationHistory(object: Object3D) {
  rotationHistory.delete(object);
}