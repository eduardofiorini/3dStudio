import { useCallback } from 'react';
import { Object3D } from 'three';
import { useEditorStore } from '../store/editorStore';

export function useTransformLock() {
  const toggleLock = useCallback((object: Object3D, locked: boolean) => {
    const store = useEditorStore.getState();
    
    object.userData.transformLocked = locked;
    
    // Force re-render of transform controls if object is selected
    if (store.selectedObject === object) {
      store.setSelectedObject(null);
      requestAnimationFrame(() => {
        store.setSelectedObject(object);
        store.updateTransform();
      });
    }
  }, []);

  return { toggleLock };
}