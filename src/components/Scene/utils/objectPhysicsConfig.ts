import { Object3D } from 'three';
import { PhysicsState } from '../../../types/editor';
import { PhysicsType } from '../physics/types';

export function getObjectPhysicsConfig(object: Object3D, physics: PhysicsState) {
  const initialTransform = physics.initialTransforms.get(object);
  const position = initialTransform?.position.toArray() || object.position.toArray();
  const rotation = initialTransform?.rotation.toArray() || object.rotation.toArray();
  const scale = initialTransform?.scale.toArray() || object.scale.toArray();

  const physicsType: PhysicsType = object.userData.physicsType === 'static' ? 'static' : 'dynamic';

  console.log('Physics config:', {
    id: object.uuid,
    type: physicsType,
    position,
    restitution: 1,
    friction: 0
  });

  return {
    type: physicsType,
    position: position as [number, number, number],
    rotation: rotation as [number, number, number],
    scale: scale as [number, number, number],
    restitution: 1,
    friction: 0
  };
}