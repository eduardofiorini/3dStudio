import { RigidBody } from '@react-three/rapier';
import { Object3D } from 'three';
import { PHYSICS_DEFAULTS } from './constants';

interface PhysicsObjectProps {
  object: Object3D;
  isStatic?: boolean;
  onClick?: (e: any) => void;
}

export function PhysicsObject({ object, isStatic = false, onClick }: PhysicsObjectProps) {
  return (
    <RigidBody
      type={isStatic ? 'fixed' : 'dynamic'}
      colliders="cuboid"
      restitution={PHYSICS_DEFAULTS.RESTITUTION}
      friction={PHYSICS_DEFAULTS.FRICTION}
    >
      <primitive 
        object={object}
        onClick={onClick}
        raycast={object.raycast?.bind(object)}
      />
    </RigidBody>
  );
}