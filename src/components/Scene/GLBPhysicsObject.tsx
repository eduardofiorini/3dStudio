import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { Object3D, Mesh } from 'three';
import { useTimelineStore } from '../../store/timelineStore';
import { useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';

interface GLBPhysicsObjectProps {
  object: Object3D;
  type: 'dynamic' | 'static' | 'kinematic';
  onClick?: (e: any) => void;
}

export function GLBPhysicsObject({ object, type, onClick }: GLBPhysicsObjectProps) {
  const isPlaying = useTimelineStore((state) => state.isPlaying);
  const currentTime = useTimelineStore((state) => state.currentTime);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const shouldApplyPhysics = isPlaying && currentTime > 0;
  const wasReset = useRef(false);

  const getRigidBodyType = () => {
    switch (type) {
      case 'static':
        return 'fixed';
      case 'kinematic':
        return 'kinematicPosition';
      default:
        return 'dynamic';
    }
  };

  useEffect(() => {
    if (currentTime === 0 && rigidBodyRef.current) {
      wasReset.current = true;

      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
      rigidBodyRef.current.resetForces(true);
      rigidBodyRef.current.resetTorques(true);

      const initial = object.userData.initialTransform;
      if (initial) {
        object.position.copy(initial.position);
        object.rotation.copy(initial.rotation);
        object.scale.copy(initial.scale);
      }
      object.updateMatrix();
      object.updateMatrixWorld(true);

      rigidBodyRef.current.setTranslation(object.position, true);
      rigidBodyRef.current.setRotation(object.quaternion, true);
    } else if (currentTime > 0) {
      wasReset.current = false;
    }
  }, [currentTime, object]);

  useFrame(() => {
    if (rigidBodyRef.current && shouldApplyPhysics && !wasReset.current) {
      const position = rigidBodyRef.current.translation();
      const rotation = rigidBodyRef.current.rotation();

      object.position.set(position.x, position.y, position.z);
      object.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      enabled={shouldApplyPhysics && !wasReset.current}
      type={getRigidBodyType()}
      position={object.position.toArray()}
      rotation={object.rotation.toArray()}
      scale={object.scale.toArray()}
      mass={type === 'static' ? 0 : 1}
      linearDamping={0.1}
      angularDamping={0.1}
      colliders="trimesh"
      friction={0.2}
      restitution={0.7}
    >
      <primitive object={object} onClick={onClick} />
    </RigidBody>
  );
}