import { useEffect } from 'react';
import { RigidBody } from '@react-three/rapier';
import { PhysicsObjectProps } from './types';
import { PhysicsDebugger } from './PhysicsDebugger';

export function StaticBody({ 
  object,
  initialPosition,
  initialRotation,
  initialScale
}: Omit<PhysicsObjectProps, 'type'>) {
  useEffect(() => {
    PhysicsDebugger.logCreation({
      objectId: object.uuid,
      type: 'fixed',
      userDataType: object.userData.physicsType,
      position: initialPosition,
      hasRef: true
    });
  }, [object, initialPosition]);

  return (
    <RigidBody
      type="fixed"
      position={initialPosition}
      rotation={initialRotation}
      scale={initialScale}
      colliders="cuboid"
    >
      <primitive object={object} />
    </RigidBody>
  );
}