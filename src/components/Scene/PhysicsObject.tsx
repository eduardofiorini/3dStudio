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
  const initialScaleRef = useRef(object.scale.clone());
  const shouldApplyPhysics = isPlaying && currentTime > 0;
  const wasReset = useRef(false);
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const [isResetting, setIsResetting] = useState(false);
  const [lastResetTime, setLastResetTime] = useState(0);

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
    if (!shouldApplyPhysics) {
      // When not simulating, use kinematicPosition if selected
      return isSelected ? 'kinematicPosition' : type;
    }
    // During simulation, use the specified type
    return type === 'static' ? 'fixed' : type === 'kinematic' ? 'kinematicPosition' : 'dynamic';
  };
  
  // Store initial scale when physics is enabled
  useEffect(() => {
    if (object.userData.physicsEnabled) {
      initialScaleRef.current = object.scale.clone();
    }
  }, [object.userData.physicsEnabled]);

  useEffect(() => {
    if (rigidBodyRef.current && object) {
      // Store direct reference to rigid body
      // Silently store the reference without logging
      try {
        object.userData.rigidBody = rigidBodyRef.current;
      } catch (error) {
        // Suppress error
      }
      
      // Cleanup on unmount
      return () => {
        if (object) {
          try {
            delete object.userData.rigidBody;
          } catch (error) {
            // Suppress error
          }
        }
      };
    }
  }, [rigidBodyRef.current, object]);

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
    if (rigidBodyRef.current && shouldApplyPhysics && !wasReset.current) {
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
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      enabled={shouldApplyPhysics && !wasReset.current}
      type={getPhysicsType()} // Use the dynamic type determination
      position={[object.position.x, object.position.y, object.position.z]}
      rotation={[object.rotation.x, object.rotation.y, object.rotation.z]}
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