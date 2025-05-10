import { useCallback } from 'react';
import { Object3D } from 'three';
import { PhysicsManager } from '../core/PhysicsManager';

export function usePhysics() {
  const manager = PhysicsManager.getInstance();

  const enablePhysics = useCallback((
    object: Object3D, 
    type: 'dynamic' | 'static' | 'kinematic' = 'dynamic'
  ) => {
    if (!object) return;

    // Enable physics through manager
    manager.enablePhysics(object, type);

    // Force a store update to trigger re-render
    useEditorStore.getState().updateTransform();
  }, [manager]);

  const disablePhysics = useCallback((object: Object3D) => {
    manager.disablePhysics(object);
    useEditorStore.getState().updateTransform();
  }, []);

  const resetPhysics = useCallback((object: Object3D) => {
    manager.resetObject(object);
  }, []);

  const getPhysicsState = useCallback(() => {
    return manager.getState();
  }, []);

  return {
    enablePhysics,
    disablePhysics,
    resetPhysics,
    getPhysicsState,
    manager
  };
}