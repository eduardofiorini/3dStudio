import { useRef, useEffect } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useTimelineStore } from '../../../store/timelineStore';
import { PhysicsObjectProps } from './types';
import { PhysicsDebugger } from './PhysicsDebugger';
import { handleKinematicAnimation } from './kinematicAnimation';

export function KinematicBody({ 
  object,
  initialPosition,
  initialRotation,
  initialScale
}: Omit<PhysicsObjectProps, 'type'>) {
  const api = useRef(null);
  const currentTime = useTimelineStore((state) => state.currentTime);
  const animations = useTimelineStore((state) => state.animations);

  // Debug logging
  useEffect(() => {
    PhysicsDebugger.logCreation({
      objectId: object.uuid,
      type: 'kinematicPosition',
      userDataType: object.userData.physicsType,
      position: initialPosition,
      hasRef: !!api.current
    });

    const interval = PhysicsDebugger.startPeriodicCheck({
      objectId: object.uuid,
      type: 'kinematicPosition',
      userDataType: object.userData.physicsType,
      position: object.position.toArray(),
      hasRef: !!api.current,
      rigidBodyApi: api.current ? 'exists' : 'null'
    });

    return () => clearInterval(interval);
  }, [object, initialPosition]);

  // Animation handling
  useFrame(() => {
    if (!api.current) return;
    handleKinematicAnimation(api.current, object, animations, currentTime);
  });

  return (
    <RigidBody
      ref={api}
      type="kinematicPosition"
      position={initialPosition}
      rotation={initialRotation}
      scale={initialScale}
      colliders="cuboid"
      mass={0}
    >
      <primitive object={object} />
    </RigidBody>
  );
}