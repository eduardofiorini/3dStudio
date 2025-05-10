import { Object3D, Vector3, Euler, Matrix4 } from 'three';
import { TransformType, Axis } from './types';
import { useEditorStore } from '../../store/editorStore';
import { updatePosition } from './position';
import { updateRotation, getRotationDegrees } from './rotation';
import { updateScale } from './scale';
import { validateTransformValue, sanitizeTransformValue } from './validation';

// Thresholds for significant changes
const POSITION_THRESHOLD = 0.1;
const ROTATION_THRESHOLD = 0.1;
const SCALE_THRESHOLD = 0.01;

// Store initial transform states
const initialTransformStates = new WeakMap<Object3D, {
  position: Vector3;
  rotation: Euler;
  scale: Vector3;
  matrix: Matrix4;
}>();

// Helper functions for validation
function isValidVector(vec: Vector3 | Euler): boolean {
  return vec && 
         Number.isFinite(vec.x) && 
         Number.isFinite(vec.y) && 
         Number.isFinite(vec.z);
}

function isValidAxis(axis: string): axis is Axis {
  return ['x', 'y', 'z'].includes(axis);
}

function validateObjectTransform(object: Object3D): boolean {
  return isValidVector(object.position) &&
         isValidVector(object.rotation) &&
         isValidVector(object.scale);
}

// Store initial transform state
export function storeInitialTransform(object: Object3D) {
  if (!initialTransformStates.has(object)) {
    const state = {
      position: object.position.clone(),
      rotation: object.rotation.clone(),
      scale: object.scale.clone(),
      matrix: object.matrix.clone()
    };
    initialTransformStates.set(object, state);
  }
}

// Get initial transform state
export function getInitialTransformState(object: Object3D) {
  return initialTransformStates.get(object);
}

// Clear initial transform state
export function clearInitialTransformState(object: Object3D) {
  initialTransformStates.delete(object);
}

// Revert to initial transform state
function revertToInitialState(object: Object3D) {
  const initial = initialTransformStates.get(object);
  if (initial) {
    object.position.copy(initial.position);
    object.rotation.copy(initial.rotation);
    object.scale.copy(initial.scale);
    object.matrix.copy(initial.matrix);
    object.updateMatrix();
    object.updateMatrixWorld(true);
  }
}

// Sync with physics if enabled
function syncWithPhysics(object: Object3D) {
  if (object.userData.physicsEnabled && object.userData.physicsBody) {
    try {
      const physicsBody = object.userData.physicsBody;
      const position = object.position;
      const quaternion = object.quaternion;

      if (isValidVector(position)) {
        physicsBody.setTranslation(
          { x: position.x, y: position.y, z: position.z },
          true
        );
      }

      if (quaternion && 
          Number.isFinite(quaternion.x) && 
          Number.isFinite(quaternion.y) && 
          Number.isFinite(quaternion.z) && 
          Number.isFinite(quaternion.w)) {
        physicsBody.setRotation(quaternion, true);
      }
    } catch (error) {
      console.error('Failed to sync with physics:', error);
      return false;
    }
  }
  return true;
}

// Check if transform change is significant
function isSignificantChange(
  type: TransformType,
  oldValue: number,
  newValue: number
): boolean {
  const threshold = type === 'position' ? POSITION_THRESHOLD :
                   type === 'rotation' ? ROTATION_THRESHOLD :
                   SCALE_THRESHOLD;
  return Math.abs(oldValue - newValue) > threshold;
}

// Main transform update function
export function updateObjectTransform(
  object: Object3D,
  type: TransformType,
  axis: Axis,
  value: number
): void {
  // Initial validation
  if (!object || !isValidAxis(axis) || object.userData.transformLocked) {
    console.warn('Invalid transform parameters:', { type, axis, value, object });
    return;
  }

  // Validate and sanitize input value
  if (!validateTransformValue(value)) {
    console.warn('Invalid transform value:', value);
    return;
  }

  const sanitizedValue = sanitizeTransformValue(value);
  if (sanitizedValue !== value) {
    console.warn('Transform value was sanitized:', { original: value, sanitized: sanitizedValue });
    value = sanitizedValue;
  }

  // Store initial state
  storeInitialTransform(object);
  const initialState = {
    position: object.position.clone(),
    rotation: object.rotation.clone(),
    scale: object.scale.clone()
  };

  try {
    const oldValue = type === 'position' ? object.position[axis] :
                     type === 'rotation' ? getRotationDegrees(object, axis) :
                     object.scale[axis];

    // Apply transform
    switch (type) {
      case 'position':
        updatePosition(object, axis, value);
        break;
      case 'rotation':
        updateRotation(object, axis, value);
        break;
      case 'scale':
        updateScale(object, axis, value);
        break;
    }

    // Update matrices
    object.updateMatrix();
    object.updateMatrixWorld(true);

    // Only add to history if change is significant
    if (isSignificantChange(type, oldValue, value)) {
      useEditorStore.getState().addToHistory({
        type: 'transform',
        data: {
          object,
          transform: {
            position: object.position.clone(),
            rotation: object.rotation.clone(),
            scale: object.scale.clone()
          },
          previousState: initialState
        }
      });
    }

    // Validate resulting transform
    if (!validateObjectTransform(object)) {
      console.warn('Transform resulted in invalid values, reverting');
      revertToInitialState(object);
      return;
    }

    // Sync with physics system
    if (!syncWithPhysics(object)) {
      console.warn('Physics sync failed, reverting transform');
      revertToInitialState(object);
      return;
    }

    // Dispatch change event
    object.dispatchEvent({ type: 'change' });

    // Update editor state
    useEditorStore.getState().updateTransform();

  } catch (error) {
    console.error('Transform update failed:', { error, type, axis, value, object });
    revertToInitialState(object);
  }
}