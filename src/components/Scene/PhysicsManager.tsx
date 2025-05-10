import { useRapier } from '@react-three/rapier';
import { Object3D } from 'three';
import { create } from 'zustand';

interface PhysicsManagerStore {
  resetPhysics: (objects: Object3D[]) => void;
  storeInitialTransforms: (objects: Object3D[]) => void;
  clearPhysicsState: (objects: Object3D[]) => void;
}

export const usePhysicsManagerStore = create<PhysicsManagerStore>(() => ({
  resetPhysics: () => {},
  storeInitialTransforms: () => {},
  clearPhysicsState: () => {},
}));

export function PhysicsManager() {
  const { world } = useRapier();

  usePhysicsManagerStore.setState({
storeInitialTransforms: (objects: Object3D[]) => {
  objects.forEach(object => {
    if (object.userData.physicsEnabled && !object.userData.initialTransform) {
      object.userData.initialTransform = {
        position: object.position.clone(),
        rotation: object.rotation.clone(),
        scale: object.scale.clone()
      };
    }
  });
},

    resetPhysics: (objects: Object3D[]) => {
      // Clear physics world
      const bodies = Array.from(world.bodies);
      bodies.forEach(body => {
        world.removeRigidBody(body);
      });

      // Reset objects to initial transforms
      objects.forEach(object => {
        if (!object.userData.physicsEnabled) return;

        // Reset to initial transform if it exists
        const initial = object.userData.initialTransform;
        if (initial) {
          object.position.copy(initial.position);
          object.rotation.copy(initial.rotation);
          object.scale.copy(initial.scale);
          object.updateMatrix();
          object.updateMatrixWorld(true);
        }

        // Clear physics state but preserve UI settings
        delete object.userData.physicsBody;
        delete object.userData.initialTransform;
      });
    },

    clearPhysicsState: (objects: Object3D[]) => {
      objects.forEach(object => {
        if (object.userData.physicsEnabled) {
          delete object.userData.physicsBody;
          delete object.userData.initialTransform;
        }
      });
    }
  });

  return null;
}