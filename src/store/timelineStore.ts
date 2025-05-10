import { create } from 'zustand';
import { useEditorStore } from './editorStore';
import { TimelineState, Animation, Keyframe, Transform } from '../types/editor';
import { Object3D } from 'three';

interface TimelineStore extends TimelineState {
  addAnimation: (animation: Animation) => void;
  removeAnimation: (id: string) => void;
  addKeyframe: (animationId: string, keyframe: Keyframe) => void;
  removeKeyframe: (animationId: string, time: number, transformType?: keyof Transform) => void;
  updateKeyframeTime: (animationId: string, oldTime: number, newTime: number) => void;
  setCurrentTime: (time: number) => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
  updateObjectTransform: (object: Object3D, transform: Transform) => void;
  isPaused: boolean;
}

export const useTimelineStore = create<TimelineStore>((set, get) => ({
  currentTime: 0,
  isPlaying: false,
  isPaused: false,
  animations: [],
  errorCount: 0,
  lastErrorTime: 0,
  MAX_ERRORS_PER_SECOND: 100,
  ERROR_COOLDOWN: 1000, // 1 second cooldown

  addAnimation: (animation) =>
    set((state) => ({
      animations: [...state.animations, animation],
    })),

  removeAnimation: (id) =>
    set((state) => ({
      animations: state.animations.filter((a) => a.id !== id),
    })),

  addKeyframe: (animationId, keyframe) =>
    set((state) => ({
      animations: state.animations.map((animation) =>
        animation.id === animationId
          ? {
              ...animation,
              keyframes: [...animation.keyframes, keyframe].sort((a, b) => a.time - b.time),
            }
          : animation
      ),
    })),

  removeKeyframe: (animationId, time, transformType) =>
    set((state) => ({
      animations: state.animations.map((animation) =>
        animation.id === animationId
          ? {
              ...animation,
              keyframes: animation.keyframes.filter((k) => 
                transformType ? 
                  !(k.time === time && k.transformType === transformType) : 
                  k.time !== time
              ),
            }
          : animation
      ),
    })),

  updateKeyframeTime: (animationId, oldTime, newTime) =>
    set((state) => ({
      animations: state.animations.map((animation) =>
        animation.id === animationId
          ? {
              ...animation,
              keyframes: animation.keyframes
                .map((k) =>
                  k.time === oldTime ? { ...k, time: newTime } : k
                )
                .sort((a, b) => a.time - b.time),
            }
          : animation
      ),
    })),

  setCurrentTime: (time) => set({ currentTime: time }),
  
  play: () => set({ isPlaying: true, isPaused: false }),
  
  pause: () => set({ isPlaying: false, isPaused: true }),

  checkErrorThreshold: () => {
    const state = get();
    const now = Date.now();
    
    // Reset error count if cooldown has passed
    if (now - state.lastErrorTime > state.ERROR_COOLDOWN) {
      set({ errorCount: 0, lastErrorTime: now });
      return false;
    }
    
    // Increment error count
    set({ errorCount: state.errorCount + 1, lastErrorTime: now });
    
    // Check if we've hit the threshold
    if (state.errorCount >= state.MAX_ERRORS_PER_SECOND) {
      console.warn('Timeline: Error threshold reached, pausing playback');
      get().pause();
      return true;
    }
    return false;
  },

  updateObjectTransform: (object: Object3D, transform: Transform) => {
    const state = get();
    try {
      if (!object || !transform) {
        throw new Error('Invalid object or transform');
      }

      // Validate transform values
      const isValid = (val: number) => Number.isFinite(val) && !Number.isNaN(val);
      const validateVector = (v: any) => 
        v && isValid(v.x) && isValid(v.y) && isValid(v.z);

      if (!validateVector(transform.position) || 
          !validateVector(transform.rotation) || 
          !validateVector(transform.scale)) {
        throw new Error('Invalid transform values');
      }

    object.position.set(transform.position.x, transform.position.y, transform.position.z);
    object.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
    object.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
      
      object.updateMatrix();
      object.updateMatrixWorld(true);
    } catch (error) {
      console.error('Timeline: Transform error:', error);
      if (state.checkErrorThreshold()) {
        return;
      }
    }
  },
  
  reset: () => {
    const state = get();
    // Immediately pause playback and reset time
    set({ 
      currentTime: 0, 
      isPlaying: false,
      isPaused: false // Ensure we're fully stopped
    });

    const objects = window.__THREE_OBJECTS;
    if (!objects?.length) {
      console.warn('No objects found to reset');
      return;
    }
    
    // Use Promise to ensure physics reset completes
    const resetPromise = new Promise<void>(resolve => {
      // Small delay to ensure physics engine has stopped
      setTimeout(() => {
        objects.forEach(object => {
          if (!object.userData.physicsEnabled) return;

          const initial = object.userData.initialTransform;
          if (!initial) return;

          // Reset transform
          object.position.copy(initial.position);
          object.rotation.copy(initial.rotation);
          object.scale.copy(initial.scale);

          // Reset physics body if it exists
          const rigidBody = object.userData.rigidBody;
          if (rigidBody) {
            try {
              rigidBody.setTranslation(
                { x: initial.position.x, y: initial.position.y, z: initial.position.z },
                true
              );
              rigidBody.setRotation(object.quaternion, true);
              rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
              rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
              rigidBody.resetForces(true);
              rigidBody.resetTorques(true);
              rigidBody.wakeUp();
            } catch (error) {
              console.warn('Error resetting physics body:', error);
            }
          }

          object.updateMatrix();
          object.updateMatrixWorld(true);
        });

        // Force scene update after all resets
        useEditorStore.getState().updateTransform();
        resolve();
      }, 50); // Small delay to ensure physics engine has stopped
    });

    // Return promise for potential chaining
    return resetPromise;
  },
}));