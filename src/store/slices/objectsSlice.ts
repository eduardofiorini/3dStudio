import { StateCreator } from 'zustand';
import * as THREE from 'three';
import { EditorState } from '../types';
import { createCube } from '../../utils/objects';
import { duplicateObjects } from './objects/duplication';

export interface ObjectsSlice {
  objects: Object3D[];
  objectNames: Map<Object3D, string>;
  addObject: (object: Object3D) => void;
  removeObject: (object: Object3D) => void;
  removeObjects: (objects: Object3D[]) => void;
  duplicateObject: (object: Object3D) => void;
  renameObject: (object: Object3D, name: string) => void;
  getObjectName: (object: Object3D) => string;
}

export const createObjectsSlice: StateCreator<EditorState, [], [], ObjectsSlice> = (set, get) => ({
  hasInitialized: false,
  objects: [
    createCube({
      position: { y: 0.5 },
      material: { color: '#636363' }
    })
  ],
  objectNames: new Map(),

  setObjects: (objects) => set((state) => ({
    objects,
    hasInitialized: true
  })),

  addObject: (object) => set((state) => ({ 
    objects: [...state.objects, object] 
  })),

  removeObject: (object) => set((state) => {
    // Add to history before removing
    state.addToHistory({
      type: 'delete',
      data: { object }
    });
    
    // Clean up camera helper if this is a camera
    if (object.userData.isCamera && object.userData.helper) {
      const scene = (window as any).__THREE_SCENE__;
      if (scene) {
        scene.remove(object.userData.helper);
        object.userData.helper.dispose();
        object.userData.helper = null;
      }
    }

    // Create new maps to avoid mutation
    const newParents = new Map(state.objectParents);
    const newChildren = new Map(state.objectChildren);
    const objectsToRemove = new Set([object]);
    
    // Helper function to recursively collect all descendants
    const collectDescendants = (obj: THREE.Object3D) => {
      const children = newChildren.get(obj);
      if (children) {
        children.forEach(child => {
          objectsToRemove.add(child);
          collectDescendants(child);
        });
      }
    };
    
    // Collect all descendants of the object being removed
    collectDescendants(object);

    // Process each object to be removed
    objectsToRemove.forEach(obj => {
      // Clean up camera helper if this is a camera
      if (obj.userData.isCamera && obj.userData.helper) {
        const scene = (window as any).__THREE_SCENE__;
        if (scene) {
          scene.remove(obj.userData.helper);
          obj.userData.helper.dispose();
          obj.userData.helper = null;
        }
      }

      // Remove from parent's children
      const parent = newParents.get(obj);
      if (parent) {
        const parentChildren = newChildren.get(parent);
        if (parentChildren) {
          parentChildren.delete(obj);
          if (parentChildren.size === 0) {
            newChildren.delete(parent);
          }
        }
        newParents.delete(obj);
      }

      // Remove from children map
      newChildren.delete(obj);

      // Remove from Three.js scene graph
      if (obj.parent) {
        obj.parent.remove(obj);
      }
      
      // Clean up resources
      if (obj instanceof THREE.Mesh) {
        if (obj.geometry) obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else if (obj.material) {
          obj.material.dispose();
        }
      }
    });

    return {
      objects: state.objects.filter(obj => !objectsToRemove.has(obj)),
      selectedObject: objectsToRemove.has(state.selectedObject!) ? null : state.selectedObject,
      selectedObjects: new Set([...state.selectedObjects].filter(obj => !objectsToRemove.has(obj))),
      objectNames: new Map([...state.objectNames].filter(([key]) => !objectsToRemove.has(key))),
      objectParents: newParents,
      objectChildren: newChildren
    };
  }),

  removeObjects: (objects) => set((state) => {
    // Add to history before removing
    state.addToHistory({
      type: 'delete',
      data: { objects }
    });

    const objectsToRemove = new Set(objects);
    
    // Clean up hierarchy relationships
    objectsToRemove.forEach(object => {
      // Remove from parent's children
      const parent = state.objectParents.get(object);
      if (parent) {
        const parentChildren = state.objectChildren.get(parent);
        if (parentChildren) {
          parentChildren.delete(object);
        }
      }
      
      // Update parent references for children
      const children = state.objectChildren.get(object);
      if (children) {
        children.forEach(child => {
          state.objectParents.delete(child);
        });
      }
    });

    return {
      objects: state.objects.filter(obj => !objectsToRemove.has(obj)),
      selectedObject: objectsToRemove.has(state.selectedObject!) ? null : state.selectedObject,
      selectedObjects: new Set(),
      objectNames: new Map([...state.objectNames].filter(([key]) => !objectsToRemove.has(key))),
      objectParents: new Map(state.objectParents),
      objectChildren: new Map(state.objectChildren)
    };
  }),

  duplicateObject: (object) => {
    const selectedObjects = Array.from(get().selectedObjects);
    const objectsToDuplicate = selectedObjects.length > 0 ? selectedObjects : [object];
    const newObjects = duplicateObjects(objectsToDuplicate, get, set);
    
    // Update names for all duplicated objects
    newObjects.forEach((newObj, index) => {
      const originalObj = objectsToDuplicate[index];
      const baseName = get().getObjectName(originalObj).replace(/\s+\d+$/, '');
      const count = get().objects.filter(obj => 
        get().getObjectName(obj).startsWith(baseName)
      ).length;
      get().objectNames.set(newObj, `${baseName} ${count + 1}`);
    });

    set((state) => ({
      objects: [...state.objects, ...newObjects],
      objectNames: state.objectNames
    }));
  },

  renameObject: (object, name) => set((state) => ({
    objectNames: new Map(state.objectNames).set(object, name)
  })),

  getObjectName: (object) => {
    const store = get();
    if (store.objectNames.has(object)) {
      return store.objectNames.get(object)!;
    }
    
    // Get the base type name
    let baseType = object.type === 'Mesh'
      ? (object.userData.objectType || object.geometry.type.replace('Geometry', '')).toLowerCase()
      : object.type.toLowerCase();

    // Capitalize first letter
    baseType = baseType.charAt(0).toUpperCase() + baseType.slice(1);
    
    // Count existing objects of this type
    const existingObjects = store.objects.filter(obj => {
      const objName = store.objectNames.get(obj);
      if (!objName) return false;
      return objName.toLowerCase().startsWith(baseType.toLowerCase());
    });
    
    // If this is the first object of its type, use the base name without number
    const name = existingObjects.length === 0 
      ? baseType 
      : `${baseType}${existingObjects.length + 1}`;

    store.objectNames.set(object, name);
    return name;
  },
});