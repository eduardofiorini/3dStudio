import { StateCreator } from 'zustand';
import { Object3D } from 'three';
import { EditorState } from '../../types';
import { ObjectsSlice } from './types';
import { generateObjectName } from './naming';
import { duplicateObject } from './duplication';
import { createCube } from '../../../utils/objects';

export const createObjectsSlice: StateCreator<EditorState, [], [], ObjectsSlice> = (set, get) => ({
  objects: [createCube({ position: { y: 0.5 } })],
  objectNames: new Map(),

  addObject: (object) => set((state) => ({ 
    objects: [...state.objects, object] 
  })),

  removeObject: (object) => set((state) => {
    // Add to history before removing
    state.addToHistory({
      type: 'delete',
      data: { object }
    });
    
    const newParents = new Map(state.objectParents);
    const newChildren = new Map(state.objectChildren);
    const parent = newParents.get(object);
    const children = newChildren.get(object);

    // Handle parent-child relationships
    if (parent && newChildren.has(parent)) {
      const parentChildren = newChildren.get(parent)!;
      parentChildren.delete(object);
      if (parentChildren.size === 0) {
        newChildren.delete(parent);
      }
      parent.remove(object);
    }

    // Handle children
    if (children) {
      children.forEach(child => {
        newParents.delete(child);
        if (parent) {
          newParents.set(child, parent);
          const grandparentChildren = newChildren.get(parent) || new Set();
          grandparentChildren.add(child);
          newChildren.set(parent, grandparentChildren);
          parent.add(child);
        }
      });
      newChildren.delete(object);
    }

    newParents.delete(object);

    return {
      objects: state.objects.filter((obj) => obj !== object),
      selectedObject: state.selectedObject === object ? null : state.selectedObject,
      objectNames: new Map([...state.objectNames].filter(([key]) => key !== object)),
      objectParents: newParents,
      objectChildren: newChildren
    };
  }),

  removeObjects: (objects) => set((state) => {
    state.addToHistory({
      type: 'delete',
      data: { objects }
    });

    const objectsToRemove = new Set(objects);
    
    // Clean up hierarchy relationships
    objectsToRemove.forEach(object => {
      const parent = state.objectParents.get(object);
      if (parent) {
        const parentChildren = state.objectChildren.get(parent);
        if (parentChildren) {
          parentChildren.delete(object);
        }
      }
      
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
    const newObject = duplicateObject(object, get, set);
    const baseName = get().getObjectName(object).replace(/\s+\d+$/, '');
    const count = get().objects.filter(obj => 
      get().getObjectName(obj).startsWith(baseName)
    ).length;
    
    get().objectNames.set(newObject, `${baseName} ${count + 1}`);
    set((state) => ({ 
      objects: [...state.objects, newObject],
      objectNames: state.objectNames
    }));
  },

  renameObject: (object, name) => set((state) => ({
    objectNames: new Map(state.objectNames).set(object, name)
  })),

  getObjectName: (object) => {
    if (get().objectNames.has(object)) {
      return get().objectNames.get(object)!;
    }
    
    const name = generateObjectName(object, get);
    get().objectNames.set(object, name);
    return name;
  },
});