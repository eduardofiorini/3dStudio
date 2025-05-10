import { Vector3, Euler, Object3D } from 'three';
import { useEditorStore } from '../store/editorStore';

// Convert degrees to radians
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Convert radians to degrees
export function radToDeg(radians: number): number {
  return radians * (180 / Math.PI);
}

export function updateObjectTransform(
  object: Object3D,
  type: 'position' | 'rotation' | 'scale',
  axis: 'x' | 'y' | 'z',
  value: number
) {
  if (type === 'position') {
    const newPosition = new Vector3().copy(object.position);
    newPosition[axis] = value;
    object.position.copy(newPosition);
  } else if (type === 'rotation') {
    // Create a new Euler with the current rotation
    const newRotation = new Euler(
      object.rotation.x,
      object.rotation.y,
      object.rotation.z,
      object.rotation.order
    );
    // Update the specified axis with the new value in radians
    newRotation[axis] = degToRad(value);
    // Apply the new rotation
    object.rotation.set(
      newRotation.x,
      newRotation.y,
      newRotation.z,
      newRotation.order
    );
  } else if (type === 'scale') {
    const newScale = new Vector3().copy(object.scale);
    newScale[axis] = value;
    object.scale.copy(newScale);
  }
  
  // Always update the store to ensure UI and state stay in sync
  useEditorStore.getState().updateTransform();
}