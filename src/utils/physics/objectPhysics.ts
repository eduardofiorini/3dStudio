import { Object3D, Mesh, PlaneGeometry } from 'three';
import { RigidBodyTypeString } from '@react-three/rapier';
import { TorusGeometry, Vector3 } from 'three';

interface PhysicsConfig {
  type: RigidBodyTypeString;
  colliderType: 'cuboid' | 'hull' | 'trimesh';
  mass?: number;
  friction?: number;
  restitution?: number;
  linearDamping?: number;
  angularDamping?: number;
  ccdEnabled?: boolean;
}

export function getPhysicsConfig(object: Object3D): PhysicsConfig {
  // Default config
  const defaultConfig: PhysicsConfig = {
    type: 'dynamic',
    colliderType: 'hull',
    mass: 1,
    friction: 0.2,
    restitution: 0.7,
    linearDamping: 0.1,  // Add damping for smoother physics
    angularDamping: 0.1,
    ccdEnabled: true     // Enable CCD by default for better collision detection
  };

  // Return null for lights to skip physics
  if (object.userData.isLight) {
    return null;
  }

  // Handle text objects
  if (object.userData.textOptions) {
    return {
      ...defaultConfig,
      type: 'fixed',
      colliderType: object.userData.textOptions.is3D ? 'hull' : 'cuboid',
      ccdEnabled: false  // No need for CCD on static objects
    };
  }

  // Handle GLB models with improved collision detection
  if (object.userData.isGLBModel) {
    return {
      ...defaultConfig,
      colliderType: 'trimesh',
      // Increase damping for GLB models to prevent excessive bouncing
      linearDamping: 0.2,
      angularDamping: 0.2
    };
  }

  // Handle planes with proper physics setup
  if (object instanceof Mesh && object.geometry instanceof PlaneGeometry) {
    return {
      ...defaultConfig,
      type: 'fixed',
      colliderType: 'cuboid',
      mass: 0,
      ccdEnabled: false
    };
  }

  // Handle torus shapes with improved collision handling
  if (object instanceof Mesh && object.geometry instanceof TorusGeometry) {
    return {
      ...defaultConfig,
      colliderType: 'hull',
      mass: 1,
      friction: 0.2,
      restitution: 0.7,
      // Add extra damping for torus to prevent rolling forever
      linearDamping: 0.15,
      angularDamping: 0.15
    };
  }

  return defaultConfig;
}