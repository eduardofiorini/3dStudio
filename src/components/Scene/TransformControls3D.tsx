import { useCallback, useRef, useEffect } from 'react';
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

  // Add effect to ensure physics body is properly synced when object is selected
  useEffect(() => {
    if (selectedObject && selectedObject.userData.physicsEnabled && selectedObject.userData.rigidBody) {
      try {
        const rigidBody = selectedObject.userData.rigidBody;
        
        // Ensure physics body position matches current object position
        const currentPos = rigidBody.translation();
        const objPos = selectedObject.position;
        
        // Check if they're out of sync
        const positionDiff = Math.abs(currentPos.x - objPos.x) + 
                           Math.abs(currentPos.y - objPos.y) + 
                           Math.abs(currentPos.z - objPos.z);
        
        if (positionDiff > 0.001) {
          // Sync physics body to object position
          rigidBody.setTranslation(objPos, true);
          rigidBody.setRotation(selectedObject.quaternion, true);
          rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
          rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
          rigidBody.resetForces(true);
          rigidBody.resetTorques(true);
          rigidBody.wakeUp();
          
          console.log('Synced physics body to object position on selection');
        }
      } catch (error) {
        console.warn('Failed to sync physics body on selection:', error);
      }
    }
  }, [selectedObject]);
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

    // Mark that this object was transformed by gizmo
    if (selectedObject.userData.physicsEnabled) {
      selectedObject.userData.gizmoTransformed = true;
      selectedObject.userData.gizmoPosition = selectedObject.position.clone();
      selectedObject.userData.gizmoRotation = selectedObject.quaternion.clone();
    }

    updateTransform();
  }, [selectedObject, selectedObjects, updateTransform, isValidVector]);

  const handleMouseUp = useCallback(() => {
    setIsTransforming(false);
    
    if (selectedObject) {
      // Sync physics body after gizmo transform completes
      if (selectedObject.userData.physicsEnabled && selectedObject.userData.rigidBody) {
        try {
          const rigidBody = selectedObject.userData.rigidBody;
          
          // Force sync physics body to final gizmo position
          rigidBody.setTranslation(selectedObject.position, true);
          rigidBody.setRotation(selectedObject.quaternion, true);
          rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
          rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
          rigidBody.resetForces(true);
          rigidBody.resetTorques(true);
          rigidBody.wakeUp();
          
          // Clear gizmo flags after sync
          delete selectedObject.userData.gizmoTransformed;
          delete selectedObject.userData.gizmoPosition;
          delete selectedObject.userData.gizmoRotation;
          
        } catch (error) {
          console.warn('Failed to sync physics after gizmo transform:', error);
        }
      }
      
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

  // Simplified transform logic: allow transforms when not locked and (timeline at 0 OR simulation not playing)
  const canTransform = !isTransformLocked && (currentTime === 0 || !isPlaying);

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
      key={selectedObject.uuid} // Force component refresh on object change
    />
  );
}