import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { useEditorStore } from '../../../store/editorStore';
import * as THREE from 'three';
import { getObjectsInSelectionBox } from '../../../utils/selection';

export function SelectionController() {
  const { camera, scene, gl } = useThree();
  const setSelectedObject = useEditorStore((state) => state.setSelectedObject);
  const addSelectedObject = useEditorStore((state) => state.addSelectedObject);
  const removeSelectedObject = useEditorStore((state) => state.removeSelectedObject);
  const selectedObjects = useEditorStore((state) => state.selectedObjects);
  const clearSelection = useEditorStore((state) => state.clearSelection);
  const setSelectionState = useEditorStore((state) => state.setSelectionState);
  const { isSelecting, selectionStart: startPoint, selectionEnd: endPoint } = useEditorStore();
  const [dragStartPoint, setDragStartPoint] = useState<Point2D | null>(null);
  const isTransforming = useEditorStore((state) => state.isTransforming);
  const DRAG_THRESHOLD = 15; // pixels

  const calculateDistance = (p1: Point2D, p2: Point2D) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // Left click
        setDragStartPoint({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (dragStartPoint && !isSelecting) {
        // Check if we've exceeded the drag threshold
        const distance = calculateDistance(dragStartPoint, { x: e.clientX, y: e.clientY });        
        // Only start selection if not transforming and over threshold
        if (distance > DRAG_THRESHOLD && !isTransforming) {
          // Start selection
          if (!e.shiftKey) {
            clearSelection();
          }
          setSelectionState({
            isSelecting: true,
            selectionStart: dragStartPoint,
            selectionEnd: { x: e.clientX, y: e.clientY }
          });
        }
      } else if (isSelecting) {
        // Update selection end point
        setSelectionState({
          selectionEnd: { x: e.clientX, y: e.clientY }
        });

        // Get objects in current selection box
        const objectsInBox = getObjectsInSelectionBox(
          startPoint,
          { x: e.clientX, y: e.clientY },
          camera,
          scene,
          gl.domElement
        );

        // Create a Set of objects currently in the selection box
        const objectsInBoxSet = new Set(objectsInBox);
        
        // Remove objects that are no longer in the selection box
        selectedObjects.forEach(obj => {
          if (!objectsInBoxSet.has(obj)) {
            removeSelectedObject(obj);
          }
        });

        // Add new objects that are in the selection box
        objectsInBox.forEach(obj => {
          if (!selectedObjects.has(obj)) {
            addSelectedObject(obj);
          }
        });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      setDragStartPoint(null);
      if (isSelecting) {
        setSelectionState({ isSelecting: false });
      } else if (dragStartPoint && !isTransforming) {
        // Handle as a normal click if we didn't exceed threshold
        const ray = new THREE.Raycaster();
        const mouse = new THREE.Vector2(
          ((e.clientX - gl.domElement.getBoundingClientRect().left) / gl.domElement.clientWidth) * 2 - 1,
          -((e.clientY - gl.domElement.getBoundingClientRect().top) / gl.domElement.clientHeight) * 2 + 1
        );
        ray.setFromCamera(mouse, camera);
        const intersects = ray.intersectObjects(scene.children, false);
        
        if (intersects.length > 0) {
          if (!e.shiftKey) {
            clearSelection();
            setSelectedObject(intersects[0].object);
          } else {
            addSelectedObject(intersects[0].object);
          }
        } else if (!e.shiftKey) {
          clearSelection();
        } // Skip deselection if transforming
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
  }, [isSelecting, startPoint, camera, scene, gl, selectedObjects, dragStartPoint]);

  // Return null for the Canvas component
  return null;
}

interface Point2D {
  x: number;
  y: number;
}