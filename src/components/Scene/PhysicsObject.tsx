import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { Object3D, Mesh, PlaneGeometry } from 'three';
import { useTimelineStore } from '../../store/timelineStore';
import { useFrame } from '@react-three/fiber';
import { useRef, useEffect, useState, useCallback } from 'react';
import { getPhysicsConfig } from '../../utils/physics/objectPhysics';
import { storeInitialTransform } from '../../utils/physics/transforms';
import { useEditorStore } from '../../store/editorStore';

interface PhysicsObjectProps {
  object: Object3D;
  type: 'dynamic' | 'static' | 'kinematic';
  onClick?: (e: any) => void;
}

export function PhysicsObject({ object, type, onClick }: PhysicsObjectProps) {
  const isPlaying = useTimelineStore((state) => state.isPlaying);
  const currentTime = useTimelineStore((state) => state.currentTime);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const isTransforming = useEditorStore((state) => state.isTransforming);
  const initialScaleRef = useRef(object.scale.clone());
  const shouldApplyPhysics = isPlaying && currentTime > 0;
  const wasReset = useRef(false);
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const transformMode = useEditorStore((state) => state.transformMode);
  const [isResetting, setIsResetting] = useState(false);
  const [lastResetTime, setLastResetTime] = useState(0);
  const lastKnownPosition = useRef(object.position.clone());
  const lastKnownRotation = useRef(object.quaternion.clone());

  // Validate physics configuration
  const validatePhysicsConfig = useCallback((config: any) => {
    if (!config) return false;
    return (
      typeof config.mass === 'number' &&
      typeof config.friction === 'number' &&
      typeof config.restitution === 'number'
    );
  }, []);

  const physicsConfig = getPhysicsConfig(object);
  
  // Validate config before proceeding
  if (!validatePhysicsConfig(physicsConfig)) {
    console.warn('Invalid physics config for object:', object);
    return (
      <primitive object={object} onClick={onClick} />
    );
  }

  // Determine if this object is currently selected
  const isSelected = selectedObject?.uuid === object.uuid;

  // Determine the proper physics type
  const getPhysicsType = () => {
    // Simplified logic: always use the object's designated physics type
    // Don't change body type based on selection state to prevent physics issues
    switch (type) {
      case 'static':
        return 'fixed';
      case 'kinematic':
        return 'kinematicPosition';
      default:
        return 'dynamic';
    }
  };
  
  // Store initial scale when physics is enabled
  useEffect(() => {
    if (object.userData.physicsEnabled) {
      initialScaleRef.current = object.scale.clone();
    }
  }, [object.userData.physicsEnabled]);

  // Sync physics body with object position when not simulating
  useEffect(() => {
    if (rigidBodyRef.current && !shouldApplyPhysics) {
      // When simulation is not running, ensure physics body matches object position
      const hasPositionChanged = !object.position.equals(lastKnownPosition.current);
      const hasRotationChanged = !object.quaternion.equals(lastKnownRotation.current);
      
      if (hasPositionChanged || hasRotationChanged) {
        try {
          rigidBodyRef.current.setTranslation(object.position, true);
          rigidBodyRef.current.setRotation(object.quaternion, true);
          
          // Update our tracking
          lastKnownPosition.current.copy(object.position);
          lastKnownRotation.current.copy(object.quaternion);
        } catch (error) {
          console.warn('Failed to sync physics body:', error);
        }
      }
    }
  });

  useEffect(() => {
    // CRITICAL: Store and maintain physics body reference
    // This ensures the reference persists across selection changes
    if (rigidBodyRef.current && object) {
      object.userData.rigidBody = rigidBodyRef.current;
      
      // Ensure initial sync
      try {
        rigidBodyRef.current.setTranslation(object.position, true);
        rigidBodyRef.current.setRotation(object.quaternion, true);
        rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
      } catch (error) {
        console.warn('Failed to initialize physics body sync:', error);
      }
    }
    
    // IMPORTANT: Don't clear the rigidBody reference on unmount
    // This allows the reference to persist when objects are deselected/reselected
  }, [object]);

useEffect(() => {
    if (currentTime === 0 && rigidBodyRef.current) {
        wasReset.current = true;
        setIsResetting(true);
        setLastResetTime(Date.now());

        try {
          // Reset physics state with proper error handling
          const body = rigidBodyRef.current;
          body.setLinvel({ x: 0, y: 0, z: 0 }, true);
          body.setAngvel({ x: 0, y: 0, z: 0 }, true);
          body.resetForces(true);
          body.resetTorques(true);
          body.wakeUp();  // Ensure body is awake after reset

        // Reset transform with validation
        const initial = object.userData.initialTransform;
        if (initial) {
            // Validate position before copying
            if (isValidVector(initial.position)) {
                object.position.copy(initial.position);
            } else {
                console.warn('Invalid initial position detected, using default');
                object.position.set(0, 0, 0);
            }

            // Validate rotation before copying
            if (isValidVector(initial.rotation)) {
                object.rotation.copy(initial.rotation);
            } else {
                console.warn('Invalid initial rotation detected, using default');
                object.rotation.set(0, 0, 0);
            }

            // Validate scale before copying
            const scale = initialScaleRef.current;
            if (isValidVector(scale)) {
                object.scale.copy(scale);
            } else {
                console.warn('Invalid initial scale detected, using default');
                object.scale.set(1, 1, 1);
            }
            
            // Sync transform with physics body
            body.setTranslation(
              { 
                x: initial.position.x,
                y: initial.position.y,
                z: initial.position.z 
              },
              true
            );
            body.setRotation(object.quaternion, true);
        }

        object.updateMatrix();
        object.updateMatrixWorld(true);
        } catch (error) {
          console.warn('Error resetting physics state:', error);
        }

        // Clear reset state after a short delay
        setTimeout(() => {
          setIsResetting(false);
        }, 100);

    } else if (currentTime > 0) {
        wasReset.current = false;
    }
}, [currentTime, object, lastResetTime]);

// Add these helper functions at component level
const isValidVector = (vec: any): boolean => {
    return vec && 
           Number.isFinite(vec.x) && 
           Number.isFinite(vec.y) && 
           Number.isFinite(vec.z);
};

const isValidQuaternion = (quat: any): boolean => {
    return quat && 
           Number.isFinite(quat.x) && 
           Number.isFinite(quat.y) && 
           Number.isFinite(quat.z) && 
           Number.isFinite(quat.w);
};

  useFrame(() => {
    if (rigidBodyRef.current && shouldApplyPhysics && !wasReset.current && !object.userData.gizmoTransformed) {
      // Only update object from physics body during simulation
      const position = rigidBodyRef.current.translation();
      const rotation = rigidBodyRef.current.rotation();
      
      // Validate position values
      if (!Number.isFinite(position.x) || !Number.isFinite(position.y) || !Number.isFinite(position.z)) {
        console.warn('Invalid physics position detected, resetting forces');
        rigidBodyRef.current.resetForces(true);
        return;
      }
      
      // Validate rotation values
      if (!Number.isFinite(rotation.x) || !Number.isFinite(rotation.y) || 
          !Number.isFinite(rotation.z) || !Number.isFinite(rotation.w)) {
        console.warn('Invalid physics rotation detected, resetting forces');
        rigidBodyRef.current.resetForces(true);
        return;
      }

      object.position.set(position.x, position.y, position.z);
      object.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
      
      // Update our tracking
      lastKnownPosition.current.copy(object.position);
      lastKnownRotation.current.copy(object.quaternion);
    } else if (rigidBodyRef.current && !shouldApplyPhysics && !isResetting && !object.userData.gizmoTransformed) {
      // When simulation is not running, continuously sync physics body with object position
      // BUT skip sync if object was recently transformed by gizmo
      try {
        // Check if object position has changed since last frame
        const hasPositionChanged = !object.position.equals(lastKnownPosition.current);
        const hasRotationChanged = !object.quaternion.equals(lastKnownRotation.current);
        
        if (hasPositionChanged || hasRotationChanged) {
          // Object was moved externally (via transform inputs), sync physics body
          rigidBodyRef.current.setTranslation(object.position, true);
          rigidBodyRef.current.setRotation(object.quaternion, true);
          rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
          rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
          rigidBodyRef.current.resetTorques(true);
          
          // Update tracking
          lastKnownPosition.current.copy(object.position);
          lastKnownRotation.current.copy(object.quaternion);
        }
      } catch (error) {
        console.warn('Failed to sync physics body in frame loop:', error);
      }
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      enabled={shouldApplyPhysics && !wasReset.current}
      type={getPhysicsType()} // Use the dynamic type determination
      position={object.position.toArray()}
      rotation={object.rotation.toArray()}
      scale={[initialScaleRef.current.x, initialScaleRef.current.y, initialScaleRef.current.z]}
      mass={physicsConfig.mass}
      friction={physicsConfig.friction}
      restitution={physicsConfig.restitution}
      linearDamping={physicsConfig.linearDamping}
      angularDamping={physicsConfig.angularDamping}
      ccd={physicsConfig.ccdEnabled}
      colliders={physicsConfig.colliderType}
      includeInvisible
    >
      <mesh
        castShadow
        receiveShadow
        onClick={onClick}
        geometry={object instanceof Mesh ? object.geometry : undefined}
        material={object instanceof Mesh ? object.material : undefined}
      />
    </RigidBody>
  );
}