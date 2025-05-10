import { useEffect, useRef } from 'react';
import { useEditorStore } from '../store/editorStore';
import { useTimelineStore } from '../store/timelineStore';
import * as THREE from 'three';

export function useKeyboardControls() {
  const setTransformMode = useEditorStore((state) => state.setTransformMode);
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const selectedObjects = useEditorStore((state) => state.selectedObjects);
  const removeObject = useEditorStore((state) => state.removeObject);
  const removeObjects = useEditorStore((state) => state.removeObjects);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const saveScene = useEditorStore((state) => state.saveScene);
  const isPlaying = useTimelineStore((state) => state.isPlaying);
  const play = useTimelineStore((state) => state.play);
  const pause = useTimelineStore((state) => state.pause);
  const duplicateObject = useEditorStore((state) => state.duplicateObject);
  const copiedObjectRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Prevent default behavior for our shortcuts
      if (['w', 'e', 'r', 'Delete', 'Backspace', 'Escape', 's', 'c', 'v'].includes(e.key)) {
        e.preventDefault();
      }
      
      // Handle undo/redo
      if (e.metaKey || e.ctrlKey) {
        // Handle copy
        if (e.key === 'c') {
          if (selectedObjects.size > 0) {
            copiedObjectRef.current = Array.from(selectedObjects)[0];
          } else if (selectedObject) {
            copiedObjectRef.current = selectedObject;
          }
          return;
        }

        // Handle paste
        if (e.key === 'v') {
          if (copiedObjectRef.current) {
            duplicateObject(copiedObjectRef.current);
          }
          return;
        }

        // Save scene with Ctrl + S
        if (e.key === 's') {
          e.preventDefault();
          // Only trigger on Ctrl+S, not Cmd+S
          if (e.ctrlKey) {
            saveScene();
          }
          return;
        }

        if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          return;
        }
      }

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
        case 'delete': // For Windows/Linux
        case 'backspace': // For Mac
        case 'backspace':
          if (selectedObjects.size > 1) {
            removeObjects(Array.from(selectedObjects));
          } else if (selectedObject) {
            removeObject(selectedObject);
          }
          break;
        case 'escape':
          useEditorStore.getState().setSelectedObject(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObject, setTransformMode, removeObject, isPlaying, play, pause]);
}