import { useState, useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useEditorStore } from '../../store/editorStore';
import * as THREE from 'three';

export function SelectionBox() {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [endPoint, setEndPoint] = useState({ x: 0, y: 0 });
  const { camera, scene, gl } = useThree();
  const setSelectedObject = useEditorStore((state) => state.setSelectedObject);
  const addSelectedObject = useEditorStore((state) => state.addSelectedObject);
  const clearSelection = useEditorStore((state) => state.clearSelection);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // Left click
        setIsSelecting(true);
        setStartPoint({ x: e.clientX, y: e.clientY });
        setEndPoint({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isSelecting) {
        setEndPoint({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isSelecting) {
        setIsSelecting(false);
        
        // Convert screen coordinates to normalized device coordinates
        const rect = gl.domElement.getBoundingClientRect();
        const startNdc = {
          x: ((startPoint.x - rect.left) / rect.width) * 2 - 1,
          y: -((startPoint.y - rect.top) / rect.height) * 2 + 1
        };
        const endNdc = {
          x: ((endPoint.x - rect.left) / rect.width) * 2 - 1,
          y: -((endPoint.y - rect.top) / rect.height) * 2 + 1
        };

        // Create selection box
        const selectionBox = new THREE.Box2(
          new THREE.Vector2(Math.min(startNdc.x, endNdc.x), Math.min(startNdc.y, endNdc.y)),
          new THREE.Vector2(Math.max(startNdc.x, endNdc.x), Math.max(startNdc.y, endNdc.y))
        );

        // Find objects in selection box
        const selectedObjects = scene.children.filter(object => {
          if (!object.visible) return false;
          
          // Convert object position to screen space
          const vector = new THREE.Vector3();
          vector.setFromMatrixPosition(object.matrixWorld);
          vector.project(camera);
          
          return selectionBox.containsPoint(new THREE.Vector2(vector.x, vector.y));
        });

        if (selectedObjects.length > 0) {
          if (!e.shiftKey) {
            clearSelection();
            setSelectedObject(selectedObjects[0]);
          } else {
            selectedObjects.forEach(obj => addSelectedObject(obj));
          }
        } else if (!e.shiftKey) {
          clearSelection();
        }
      }
    };

    gl.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelecting, startPoint, camera, scene, gl]);

  if (!isSelecting) return null;

  // Calculate selection box dimensions
  const left = Math.min(startPoint.x, endPoint.x);
  const top = Math.min(startPoint.y, endPoint.y);
  const width = Math.abs(endPoint.x - startPoint.x);
  const height = Math.abs(endPoint.y - startPoint.y);

  return (
    <div
      style={{
        position: 'fixed',
        left,
        top,
        width,
        height,
        border: '1px solid #4a9eff',
        backgroundColor: 'rgba(74, 158, 255, 0.1)',
        pointerEvents: 'none',
      }}
    />
  );
}