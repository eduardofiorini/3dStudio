import * as THREE from 'three';

export function validateTransformValue(value: number): boolean {
  // Check if value is NaN or Infinity
  if (!Number.isFinite(value)) {
    console.warn('Invalid transform value:', value);
    return false;
  }

  // Check for reasonable value ranges
  const MAX_VALUE = 1000000;
  if (Math.abs(value) > MAX_VALUE) {
    console.warn('Transform value exceeds maximum:', value);
    return false;
  }

  return true;
}

export function sanitizeTransformValue(value: number, defaultValue: number = 0): number {
  return validateTransformValue(value) ? value : defaultValue;
}

export function validateTransforms(object: THREE.Object3D): boolean {
  // Check position
  if (!Number.isFinite(object.position.x) ||
      !Number.isFinite(object.position.y) ||
      !Number.isFinite(object.position.z)) {
    console.warn('Invalid position detected:', object.position);
    return false;
  }

  // Check rotation
  if (!Number.isFinite(object.rotation.x) ||
      !Number.isFinite(object.rotation.y) ||
      !Number.isFinite(object.rotation.z)) {
    console.warn('Invalid rotation detected:', object.rotation);
    return false;
  }

  // Check scale
  if (!Number.isFinite(object.scale.x) ||
      !Number.isFinite(object.scale.y) ||
      !Number.isFinite(object.scale.z)) {
    console.warn('Invalid scale detected:', object.scale);
    return false;
  }

  return true;
}