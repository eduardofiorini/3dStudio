import { StateCreator } from 'zustand';
import { EditorState } from '../types';
import { Object3D } from 'three';

export interface HierarchyState {
  objectParents: Map<Object3D, Object3D>;
  objectChildren: Map<Object3D, Set<Object3D>>;
  expandedNodes: Set<string>;
  visibilityState: Map<string, boolean>;
  lockState: Map<string, boolean>;
}

export interface HierarchySlice extends HierarchyState {
  setObjectParent: (child: Object3D, parent: Object3D | null) => void;
  getObjectChildren: (object: Object3D) => Set<Object3D>;
  toggleNodeExpanded: (objectId: string) => void;
  toggleVisibility: (objectId: string) => void;
  toggleLock: (objectId: string) => void;
}

export const createHierarchySlice: StateCreator<EditorState, [], [], HierarchySlice> = (set, get) => ({
  objectParents: new Map(),
  objectChildren: new Map(),
  expandedNodes: new Set(),
  visibilityState: new Map(),
  lockState: new Map(),

  setObjectParent: (child, parent) => set((state) => {
    const oldParent = state.objectParents.get(child);
    const newParents = new Map(state.objectParents);
    const newChildren = new Map(state.objectChildren);

    // Store world position before reparenting
    const worldPosition = child.position.clone();
    const worldQuaternion = child.quaternion.clone();
    const worldScale = child.scale.clone();

    // Remove from old parent's children
    if (oldParent) {
      const oldParentChildren = newChildren.get(oldParent);
      if (oldParentChildren) {
        oldParentChildren.delete(child);
        if (oldParentChildren.size === 0) {
          newChildren.delete(oldParent);
        }
        // Remove from Three.js parent
        oldParent.remove(child);
      }
    }

    // Add to new parent
    if (parent) {
      newParents.set(child, parent);
      let parentChildren = newChildren.get(parent);
      if (!parentChildren) {
        parentChildren = new Set();
        newChildren.set(parent, parentChildren);
      }
      parentChildren.add(child);
      
      // Add to Three.js parent
      parent.add(child);
      
      // Restore world position
      parent.updateMatrixWorld();
      child.position.copy(worldPosition);
      child.quaternion.copy(worldQuaternion);
      child.scale.copy(worldScale);
      child.applyMatrix4(parent.matrixWorld.invert());
    } else {
      newParents.delete(child);
      // Add directly to scene if no parent
      child.position.copy(worldPosition);
      child.quaternion.copy(worldQuaternion);
      child.scale.copy(worldScale);
    }

    return {
      objectParents: newParents,
      objectChildren: newChildren
    };
  }),

  getObjectChildren: (object) => {
    return get().objectChildren.get(object) || new Set();
  },

  toggleNodeExpanded: (objectId) => set((state) => {
    const newExpanded = new Set(state.expandedNodes);
    if (newExpanded.has(objectId)) {
      newExpanded.delete(objectId);
    } else {
      newExpanded.add(objectId);
    }
    return { expandedNodes: newExpanded };
  }),

  toggleVisibility: (objectId) => set((state) => {
    const newVisibility = new Map(state.visibilityState);
    newVisibility.set(objectId, !newVisibility.get(objectId));
    return { visibilityState: newVisibility };
  }),

  toggleLock: (objectId) => set((state) => {
    const newLockState = new Map(state.lockState);
    newLockState.set(objectId, !newLockState.get(objectId));
    return { lockState: newLockState };
  })
});