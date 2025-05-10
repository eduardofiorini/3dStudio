import { Object3D } from 'three';
import { useEditorStore } from '../store/editorStore';

export function filterTopLevelObjects(objects: Object3D[]): Object3D[] {
  const state = useEditorStore.getState();
  return objects.filter(object => !state.objectParents?.has(object));
}

export function isTopLevelObject(object: Object3D): boolean {
  const state = useEditorStore.getState();
  return !state.objectParents?.has(object);
}

export function getObjectHierarchyPath(object: Object3D): Object3D[] {
  const state = useEditorStore.getState();
  const path: Object3D[] = [object];
  let current = object;
  
  while (state.objectParents?.has(current)) {
    const parent = state.objectParents.get(current)!;
    path.unshift(parent);
    current = parent;
  }
  
  return path;
}