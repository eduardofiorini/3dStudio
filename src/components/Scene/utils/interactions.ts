import { Event, Object3D } from 'three';

export function handleObjectClick(e: Event, object: Object3D, isTransforming: boolean, setSelectedObject: (obj: Object3D | null) => void) {
  e.stopPropagation();
  if (!isTransforming) {
    setSelectedObject(object);
  }
}

export function isObjectClickable(object: Object3D): boolean {
  // Check if object has a valid raycast function
  return typeof object.raycast === 'function';
}