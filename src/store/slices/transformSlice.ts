import { StateCreator } from 'zustand';
import { Object3D } from 'three';
import { EditorState } from '../types';

export interface TransformSlice {
  selectedObject: Object3D | null;
  selectedObjects: Set<Object3D>;
  lastSelectedObject: Object3D | null;
  transformMode: 'translate' | 'rotate' | 'scale';
  isTransforming: boolean;
  transformUpdate: number;
  setSelectedObject: (object: Object3D | null) => void;
  addSelectedObject: (object: Object3D) => void;
  removeSelectedObject: (object: Object3D) => void;
  selectObjectsInRange: (startObject: Object3D, endObject: Object3D) => void;
  clearSelection: () => void;
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => void;
  setIsTransforming: (isTransforming: boolean) => void;
  updateTransform: () => void;
}

export const createTransformSlice: StateCreator<EditorState, [], [], TransformSlice> = (set, get) => ({
  selectedObject: null,
  selectedObjects: new Set(),
  lastSelectedObject: null,
  transformMode: 'translate',
  isTransforming: false,
  transformUpdate: 0,

  setSelectedObject: (object) => {
    set({ 
      selectedObject: object,
      selectedObjects: object ? new Set([object]) : new Set(),
      lastSelectedObject: object
    });
  },

  addSelectedObject: (object) => set((state) => {
    const newSelection = new Set(state.selectedObjects);
    newSelection.add(object);
    return {
      selectedObjects: newSelection,
      selectedObject: object, // Update primary selection
      lastSelectedObject: object
    };
  }),

  selectObjectsInRange: (startObject: Object3D, endObject: Object3D) => set((state) => {
    const objects = get().objects;
    const startIndex = objects.indexOf(startObject);
    const endIndex = objects.indexOf(endObject);
    
    if (startIndex === -1 || endIndex === -1) return state;
    
    const min = Math.min(startIndex, endIndex);
    const max = Math.max(startIndex, endIndex);
    const objectsInRange = objects.slice(min, max + 1);
    
    const newSelection = new Set(objectsInRange);
    
    return {
      selectedObjects: newSelection,
      selectedObject: endObject,
      lastSelectedObject: endObject
    };
  }),

  removeSelectedObject: (object) => set((state) => {
    const newSelection = new Set(state.selectedObjects);
    newSelection.delete(object);
    return {
      selectedObjects: newSelection,
      selectedObject: newSelection.size > 0 ? Array.from(newSelection)[0] : null,
      lastSelectedObject: newSelection.size > 0 ? Array.from(newSelection)[0] : null
    };
  }),

  clearSelection: () => set({ 
    selectedObject: null,
    selectedObjects: new Set(),
    lastSelectedObject: null
  }),

  setTransformMode: (mode) => {
    set({ transformMode: mode });
  },

  setIsTransforming: (isTransforming) => set({ isTransforming }),

  updateTransform: () => set((state) => ({
    transformUpdate: state.transformUpdate + 1
  })),
});