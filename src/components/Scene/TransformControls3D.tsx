import { useCallback, useRef } from 'react';
import { TransformControls } from '@react-three/drei';
import { useEditorStore } from '../../store/editorStore';
import { useTimelineStore } from '../../store/timelineStore';
import * as THREE from 'three';

export function TransformControls3D() {
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const selectedObjects = useEditorStore((state) => state.selectedObjects);
  const transformMode = useEditorStore((state) => state.transformMode);
  const isPlaying = useTimelineStore((state) => state.isPlaying);
  const isPhysicsEnabled = selectedObject?.userData.physicsEnabled;
  const isKinematic = selectedObject?.userData.physicsType === 'kinematic';
  const isTransformLocked = selectedObject?.userData.transformLocked;
  const setIsTransforming = useEditorStore((state) => state.setIsTransforming);
  const updateTransform = useEditorStore((state) => state.updateTransform);

  const lastValidTransform = useRef({
    position: new THREE.Vector3(),
    rotation: new THREE.Euler(),
    scale: new THREE.Vector3(1, 1, 1)
  });
  const initialOffsets = useRef(new Map<THREE.Object3D, THREE.Vector3>());

  const isValidVector = useCallback((vec: THREE.Vector3 | THREE.Euler): boolean => {
    return vec && 
           Number.isFinite(vec.x) && 
           Number.isFinite(vec.y) && 
           Number.isFinite(vec.z);
  }, []);

  const handleMouseDown = useCallback(() => {
    setIsTransforming(true);
    
    if (selectedObject) {
      // Store initial state for history
      const initialState = {
        position: selectedObject.position.clone(),
        rotation: selectedObject.rotation.clone(),
        scale: selectedObject.scale.clone()
      };
      
      lastValidTransform.current = {
        position: selectedObject.position.clone(),
        rotation: selectedObject.rotation.clone(),
        scale: selectedObject.scale.clone()
      };
      
      // Store for undo/redo
      useEditorStore.getState().addToHistory({
        type: 'transform',
        data: {
          object: selectedObject,
          transform: initialState,
          previousState: initialState
        }
      });
      
      // Store initial offsets for all selected objects relative to the primary selected object
      initialOffsets.current.clear();
      selectedObjects.forEach(obj => {
        if (obj !== selectedObject) {
          const offset = obj.position.clone().sub(selectedObject.position);
          initialOffsets.current.set(obj, offset);
        }
      });
    }
  }, [setIsTransforming, selectedObject]);

  const handleTransform = useCallback(() => {
    if (!selectedObject) return;

    if (!isValidVector(selectedObject.position) || 
        !isValidVector(selectedObject.rotation) || 
        !isValidVector(selectedObject.scale)) {
      console.warn('Invalid transform detected, restoring last valid state');
      selectedObject.position.copy(lastValidTransform.current.position);
      selectedObject.rotation.copy(lastValidTransform.current.rotation);
      selectedObject.scale.copy(lastValidTransform.current.scale);
      return;
    }

    // Update positions of other selected objects based on their initial offsets
    selectedObjects.forEach(obj => {
      if (obj !== selectedObject) {
        const offset = initialOffsets.current.get(obj);
        if (offset) {
          obj.position.copy(selectedObject.position).add(offset);
        }
      }
    });

    lastValidTransform.current = {
      position: selectedObject.position.clone(),
      rotation: selectedObject.rotation.clone(),
      scale: selectedObject.scale.clone()
    };

    if (selectedObject.userData.physicsBody) {
      try {
        const physicsBody = selectedObject.userData.physicsBody;
        physicsBody.setTranslation(
          {
            x: selectedObject.position.x,
            y: selectedObject.position.y,
            z: selectedObject.position.z
          },
          true
        );
        physicsBody.setRotation(selectedObject.quaternion, true);
      } catch (error) {
        console.error('Failed to sync physics during transform:', error);
      }
    }

    updateTransform();
  }, [selectedObject, selectedObjects, updateTransform, isValidVector]);

  const handleMouseUp = useCallback(() => {
    // Delay turning off transform state to prevent deselection
    setTimeout(() => {
      setIsTransforming(false);
    }, 0);
    
    if (selectedObject) {
      // Add final state to history if transform was significant
      const finalState = {
        position: selectedObject.position.clone(),
        rotation: selectedObject.rotation.clone(),
        scale: selectedObject.scale.clone()
      };
      
      const initialState = lastValidTransform.current;
      
      // Check if transform was significant
      const isSignificant = 
        selectedObject.position.distanceTo(initialState.position) > 0.1 ||
        Math.abs(selectedObject.rotation.x - initialState.rotation.x) > 0.1 ||
        Math.abs(selectedObject.rotation.y - initialState.rotation.y) > 0.1 ||
        Math.abs(selectedObject.rotation.z - initialState.rotation.z) > 0.1 ||
        Math.abs(selectedObject.scale.x - initialState.scale.x) > 0.01 ||
        Math.abs(selectedObject.scale.y - initialState.scale.y) > 0.01 ||
        Math.abs(selectedObject.scale.z - initialState.scale.z) > 0.01;
      
      if (isSignificant) {
        useEditorStore.getState().addToHistory({
          type: 'transform',
          data: {
            object: selectedObject,
            transform: finalState,
            previousState: initialState
          }
        });
      }
      
      handleTransform();
    }
  }, [setIsTransforming, selectedObject, handleTransform]);

  if (!selectedObject) return null;

  // Determine if transform controls should be enabled:
  // - Never enabled if transform is locked
  // - When simulation is running: only kinematic objects can be moved (position only)
  // - When simulation is stopped: all objects can be transformed
  const canTransform = !isTransformLocked && (
    !isPlaying || // When not playing, all objects can be transformed
    (isPhysicsEnabled && isKinematic && transformMode === 'translate') // During simulation, only kinematic position
  );

  return (
    <TransformControls 
      object={selectedObject}
      mode={transformMode}
      enabled={canTransform}
      onDrag={handleTransform}
      onObjectChange={handleTransform}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      space="world"
    />
  );
}