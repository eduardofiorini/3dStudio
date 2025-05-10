import { RigidBody } from '@react-three/rapier';
import { PhysicsObjectProps } from './types';

export function DynamicBody({ 
  object,
  initialPosition,
  initialRotation,
  initialScale
}: Omit<PhysicsObjectProps, 'type'>) {
  return (
    <RigidBody
      type="dynamic"
      position={initialPosition}
      rotation={initialRotation}
      scale={initialScale}
      colliders="cuboid"
    >
      <primitive object={object} />
    </RigidBody>
  );
}