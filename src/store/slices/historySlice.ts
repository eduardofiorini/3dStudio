import { StateCreator } from 'zustand';
import { EditorState } from '../types';
import { Object3D, Vector3, Euler } from 'three';
import { updateRotationHistory } from '../../utils/transforms/rotation';

interface Transform {
  position: Vector3;
  rotation: Euler;
  scale: Vector3;
}

interface HistoryAction {
  type: 'transform' | 'delete' | 'create';
  data: {
    object?: Object3D;
    objects?: Object3D[];
    transform?: Transform;
    previousState?: Transform;
  };
}

export interface HistorySlice {
  undoStack: HistoryAction[];
  redoStack: HistoryAction[];
  addToHistory: (action: HistoryAction) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
}

export const createHistorySlice: StateCreator<EditorState, [], [], HistorySlice> = (set, get) => ({
  undoStack: [],
  redoStack: [],

  addToHistory: (action) => set((state) => ({
    undoStack: [...state.undoStack.slice(-9), action], // Keep last 9 + new action = 10 total
    redoStack: [] // Clear redo stack when new action is added
  })),

  undo: () => {
    const state = get();
    const lastAction = state.undoStack[state.undoStack.length - 1];
    
    if (!lastAction) return;

    switch (lastAction.type) {
      case 'transform': {
        const { object, previousState } = lastAction.data;
        if (!object || !previousState) return;

        // Store current state for redo
        const redoAction = {
          type: 'transform' as const,
          data: {
            object,
            transform: {
              position: object.position.clone(),
              rotation: object.rotation.clone(),
              scale: object.scale.clone()
            },
            previousState
          }
        };

        // Restore previous state
        object.position.copy(previousState.position);
        object.rotation.copy(previousState.rotation);
        object.scale.copy(previousState.scale);
        
        // Update rotation history
        updateRotationHistory(object, {
          x: previousState.rotation.x,
          y: previousState.rotation.y,
          z: previousState.rotation.z
        });

        set((state) => ({
          undoStack: state.undoStack.slice(0, -1), // Remove last action
          redoStack: [...state.redoStack, redoAction]
        }));
        break;
      }

      case 'delete': {
        // Handle both single and multiple object deletions
        const objects = lastAction.data.objects || (lastAction.data.object ? [lastAction.data.object] : []);
        if (objects.length === 0) return;

        // Restore all objects
        objects.forEach(object => {
          get().addObject(object);
        });
        
        set((state) => ({
          undoStack: state.undoStack.slice(0, -1),
          redoStack: [...state.redoStack, { type: 'create', data: { objects } }]
        }));
        break;
      }

      case 'create': {
        // Handle both single and multiple object creations
        const objects = lastAction.data.objects || (lastAction.data.object ? [lastAction.data.object] : []);
        if (objects.length === 0) return;

        // Remove all objects
        objects.forEach(object => {
          get().removeObject(object);
        });
        
        set((state) => ({
          undoStack: state.undoStack.slice(0, -1),
          redoStack: [...state.redoStack, { type: 'delete', data: { objects } }]
        }));
        break;
      }
    }
  },

  redo: () => {
    const state = get();
    const lastAction = state.redoStack[state.redoStack.length - 1];
    
    if (!lastAction) return;

    switch (lastAction.type) {
      case 'transform': {
        const { object, transform } = lastAction.data;
        if (!object || !transform) return;

        // Store current state for undo
        const undoAction = {
          type: 'transform' as const,
          data: {
            object,
            transform: {
              position: object.position.clone(),
              rotation: object.rotation.clone(),
              scale: object.scale.clone()
            },
            previousState: transform
          }
        };

        // Apply redo state
        object.position.copy(transform.position);
        object.rotation.copy(transform.rotation);
        object.scale.copy(transform.scale);
        
        // Update rotation history
        updateRotationHistory(object, {
          x: transform.rotation.x,
          y: transform.rotation.y,
          z: transform.rotation.z
        });

        set((state) => ({
          undoStack: [...state.undoStack, undoAction],
          redoStack: state.redoStack.slice(0, -1).slice(-9) // Keep last 10 redo actions
        }));
        break;
      }

      case 'delete': {
        // Handle both single and multiple object deletions
        const objects = lastAction.data.objects || (lastAction.data.object ? [lastAction.data.object] : []);
        if (objects.length === 0) return;

        // Remove all objects
        objects.forEach(object => {
          get().removeObject(object);
        });
        
        set((state) => ({
          undoStack: [...state.undoStack, { type: 'create', data: { objects } }],
          redoStack: state.redoStack.slice(0, -1)
        }));
        break;
      }

      case 'create': {
        // Handle both single and multiple object creations
        const objects = lastAction.data.objects || (lastAction.data.object ? [lastAction.data.object] : []);
        if (objects.length === 0) return;

        // Restore all objects
        objects.forEach(object => {
          get().addObject(object);
        });
        
        set((state) => ({
          undoStack: [...state.undoStack, { type: 'delete', data: { objects } }],
          redoStack: state.redoStack.slice(0, -1)
        }));
        break;
      }
    }
  },

  clearHistory: () => set({ undoStack: [], redoStack: [] })
});