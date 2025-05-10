import { StateCreator } from 'zustand';
import { Object3D } from 'three';
import { EditorState, PhysicsState } from '../types';

export interface PhysicsSlice {
  physics: PhysicsState;
  startPhysics: () => void;
  stopPhysics: () => void;
  pausePhysics: () => void;
  togglePhysicsDebug: () => void;
  resetPhysics: () => void;
  updatePhysicsObjects: (object: Object3D, enabled: boolean) => void;
}

export const createPhysicsSlice: StateCreator<EditorState, [], [], PhysicsSlice> = (set, get) => ({
  physics: {
    running: false,
    paused: false,
    showDebug: true, // Debug mode on by default
    enabledObjects: new Set(),
    allowKeyframes: new Set(),
    initialTransforms: new Map(), // Ensures initialTransforms exists by default
  },

  togglePhysicsDebug: () => set((state) => ({
    physics: {
      ...state.physics,
      showDebug: !state.physics.showDebug,
      paused: true
    },
  })),

  startPhysics: () => set((state) => {
    const initialTransforms = new Map(state.physics.initialTransforms);

    // Ensure transforms are initialized for all enabled objects
    state.physics.enabledObjects.forEach((obj) => {
      if (!obj) {
        console.warn('Null or invalid object detected in startPhysics.');
        return;
      }

      if (!initialTransforms.has(obj)) {
        initialTransforms.set(obj, {
          position: obj.position.clone(),
          rotation: obj.rotation.clone(),
          scale: obj.scale.clone(),
        });
      }
    });

    return {
      physics: {
        ...state.physics,
        running: true,
        paused: false,
        initialTransforms,
      },
    };
  }),

  stopPhysics: () => set((state) => {
    const enabledObjects = Array.from(state.physics.enabledObjects);

    // Only process physics-enabled objects
    enabledObjects.forEach((obj) => {
      if (!obj) {
        console.warn('Skipping null or invalid object in stopPhysics.');
        return;
      }

      const transform = state.physics.initialTransforms.get(obj);
      if (!transform) {
        console.warn('Missing initial transform for object in stopPhysics:', obj);
        return;
      }

      // Restore object transforms
      obj.position.copy(transform.position);
      obj.rotation.copy(transform.rotation);
      obj.scale.copy(transform.scale);

      // Disable physics behavior
      obj.userData.physicsActive = false;
    });

    return {
      physics: {
        ...state.physics,
        running: false,
        paused: false,
        initialTransforms: new Map(), // Clear transforms
      },
    };
  }),

  pausePhysics: () => set((state) => {
    // Simply set the paused state - no need to modify objects
    // The Physics component in Scene.tsx will handle the pause state

    return {
      physics: {
        ...state.physics,
        paused: true,
      },
    };
  }),

  resetPhysics: () => set((state) => {
    const enabledObjects = Array.from(state.physics.enabledObjects);

    // Reset only physics-enabled objects
    enabledObjects.forEach((obj) => {
      if (!obj) {
        console.warn('Skipping null or invalid object in resetPhysics.');
        return;
      }

      const transform = state.physics.initialTransforms.get(obj);
      if (!transform) {
        console.warn('Missing initial transform for object in resetPhysics:', obj);
        return;
      }

      obj.position.copy(transform.position);
      obj.rotation.copy(transform.rotation);
      obj.scale.copy(transform.scale);
    });

    return {
      physics: {
        ...state.physics,
        running: false,
        paused: false,
        initialTransforms: new Map(), // Clear transforms
      },
    };
  }),

  updatePhysicsObjects: (object: Object3D, enabled: boolean) => set((state) => {
    const newEnabledObjects = new Set(state.physics.enabledObjects);
    const newAllowKeyframes = new Set(state.physics.allowKeyframes);
    const newInitialTransforms = new Map(state.physics.initialTransforms);

    if (enabled) {
      // Only proceed if object is valid
      if (!object) {
        console.warn('Attempted to enable physics for invalid object');
        return state;
      }
      // Initialize physics properties
      object.userData = {
        ...object.userData,
        hasPhysics: true,
        physicsType: object.userData.physicsType || 'dynamic'
      };
      
      newEnabledObjects.add(object);
      newInitialTransforms.set(object, {
        position: object.position.clone(),
        rotation: object.rotation.clone(),
        scale: object.scale.clone(),
      });
    } else {
      newEnabledObjects.delete(object);
      newInitialTransforms.delete(object);
      newAllowKeyframes.delete(object);
      
      // Clean up physics properties
      object.userData.hasPhysics = false;
      delete object.userData.physicsBody;
    }

    return {
      physics: {
        ...state.physics,
        enabledObjects: newEnabledObjects,
        allowKeyframes: newAllowKeyframes,
        initialTransforms: newInitialTransforms,
      },
    };
  }),
});