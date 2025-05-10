import { Object3D } from 'three';
import { RigidBody } from '@react-three/rapier';
import { PhysicsState } from '../types';

export class PhysicsManager {
  private static instance: PhysicsManager;
  private state: PhysicsState;

  private constructor() {
    this.state = {
      running: false,
      paused: false,
      showDebug: false,
      enabledObjects: new Set(),
      allowKeyframes: new Set(),
      initialTransforms: new Map()
    };
  }

  static getInstance(): PhysicsManager {
    if (!PhysicsManager.instance) {
      PhysicsManager.instance = new PhysicsManager();
    }
    return PhysicsManager.instance;
  }

  getState(): PhysicsState {
    return this.state;
  }

  enablePhysics(object: Object3D, type: 'dynamic' | 'static' | 'kinematic' = 'dynamic'): void {
    if (!object) {
      console.warn('Attempted to enable physics for invalid object');
      return;
    }

    // Store initial transform before enabling physics
    if (!this.state.initialTransforms.has(object)) {
      this.state.initialTransforms.set(object, {
        position: object.position.clone(),
        rotation: object.rotation.clone(),
        scale: object.scale.clone()
      });
    }

    object.userData = {
      ...object.userData,
      physicsEnabled: true,
      physicsType: type
    };

    this.state.enabledObjects.add(object);
  }

  disablePhysics(object: Object3D): void {
    this.state.enabledObjects.delete(object);
    this.state.allowKeyframes.delete(object);
    this.state.initialTransforms.delete(object);
    
    // Clean up physics properties
    object.userData.physicsEnabled = false;
    delete object.userData.physicsBody;
    delete object.userData.rigidBody;
  }

  resetObject(object: Object3D): void {
    const transform = this.state.initialTransforms.get(object);
    if (!transform) return;

    // Reset to initial transform
    object.position.copy(transform.position);
    object.rotation.copy(transform.rotation);
    object.scale.copy(transform.scale);

    // Reset physics body if it exists
    if (object.userData.rigidBody) {
      const body = object.userData.rigidBody;
      try {
        body.setTranslation(transform.position, true);
        body.setRotation(object.quaternion, true);
        body.setLinvel({ x: 0, y: 0, z: 0 }, true);
        body.setAngvel({ x: 0, y: 0, z: 0 }, true);
        body.resetForces(true);
        body.resetTorques(true);
        body.wakeUp();
      } catch (error) {
        console.warn('Failed to reset physics body:', error);
      }
    }

    object.updateMatrix();
    object.updateMatrixWorld(true);
  }

  start(): void {
    this.state.running = true;
    this.state.paused = false;
  }

  stop(): void {
    this.state.running = false;
    this.state.paused = false;
    this.state.initialTransforms.clear();
  }

  pause(): void {
    this.state.paused = true;
  }

  resume(): void {
    this.state.paused = false;
  }

  toggleDebug(): void {
    this.state.showDebug = !this.state.showDebug;
  }
}