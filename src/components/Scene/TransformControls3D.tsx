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
  const currentTime = useTimelineStore((state) => state.currentTime);
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

    // CRITICAL: Immediately sync physics body with object transform AND force position update
    if (selectedObject.userData.physicsEnabled && selectedObject.userData.rigidBody) {
      try {
        const rigidBody = selectedObject.userData.rigidBody;
        
        // Force update the physics body position and ensure it sticks
        rigidBody.setTranslation(selectedObject.position, true);
        rigidBody.setRotation(selectedObject.quaternion, true);
        
        // Reset physics velocities to prevent drift
        rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
        rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
        
        // Wake up the body and force it to stay at the new position
        rigidBody.wakeUp();
        
        // Store the new position as the "authoritative" position
        object.userData.lastGizmoPosition = selectedObject.position.clone();
        object.userData.lastGizmoRotation = selectedObject.quaternion.clone();
        
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

  // Transform controls logic:
  // - Always respect transform lock
  // - Allow all transforms when timeline is at 0 (initial state)
  // - Allow all transforms when simulation is not playing
  // - During simulation: only kinematic objects can be positioned
  const canTransform = !isTransformLocked && (
    currentTime === 0 || // Always allow transforms at timeline start
    !isPlaying || // Allow transforms when simulation is paused/stopped
    (isPhysicsEnabled && isKinematic && transformMode === 'translate') // During simulation: only kinematic position
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