import { useEffect } from 'react';
import { Scene, Object3D } from 'three';
import { useEditorStore } from '../store/editorStore';
import { useCallback } from 'react';

interface KeyboardShortcutsProps {
  removeObject: (object: Object3D) => void;
  scene: Scene;
}

export function useKeyboardShortcuts({ removeObject, scene }: KeyboardShortcutsProps) {
  const setTransformMode = useEditorStore((state) => state.setTransformMode);

  const handleTransformMode = useCallback((e: KeyboardEvent) => {
    switch (e.key.toLowerCase()) {
      case 'w':
        setTransformMode('translate');
        break;
      case 'e':
        setTransformMode('rotate');
        break;
      case 'r':
        setTransformMode('scale');
        break;
    }
  }, [setTransformMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete') {
        const selectedObject = useEditorStore.getState().selectedObject;
        if (selectedObject) {
          removeObject(selectedObject); 
        }
      } else if (e.key === 'Escape') {
        useEditorStore.getState().setSelectedObject(null);
      }
      handleTransformMode(e);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [removeObject, scene, handleTransformMode]);
}