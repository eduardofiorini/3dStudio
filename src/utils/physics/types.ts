import { Object3D, Vector3, Euler } from 'three';

export interface PhysicsState {
  running: boolean;
  paused: boolean;
  showDebug: boolean;
  enabledObjects: Set<Object3D>;
  allowKeyframes: Set<Object3D>;
  initialTransforms: Map<Object3D, StoredTransform>;
}

export interface StoredTransform {
  position: Vector3;
  rotation: Euler;
  scale: Vector3;
}

export interface PhysicsConfig {
  type: 'dynamic' | 'static' | 'kinematic';
  mass?: number;
  friction?: number;
  restitution?: number;
  colliderType: 'cuboid' | 'hull' | 'trimesh';
}