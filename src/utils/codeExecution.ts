import * as THREE from 'three';
import { useEditorStore } from '../store/editorStore';
import { validateTransforms } from './transforms/validation';

interface ErrorState {
  count: number;
  lastError: number;
  silenced: boolean;
}

const errorState: ErrorState = {
  count: 0,
  lastError: 0,
  silenced: false
};

const ERROR_CONFIG = {
  MAX_ERRORS: 20,         // Maximum errors before silencing
  RESET_INTERVAL: 5000,   // Reset error count after 5 seconds of no errors
  COOLDOWN_PERIOD: 10000  // How long to silence errors
};

function handleError(error: any) {
  const now = Date.now();
  
  // Reset error count if enough time has passed
  if (now - errorState.lastError > ERROR_CONFIG.RESET_INTERVAL) {
    errorState.count = 0;
    errorState.silenced = false;
  }

  // Update error state
  errorState.count++;
  errorState.lastError = now;

  // Check if we should silence errors
  if (errorState.count >= ERROR_CONFIG.MAX_ERRORS) {
    if (!errorState.silenced) {
      console.warn(`Excessive errors detected (${errorState.count}). Silencing similar errors for ${ERROR_CONFIG.COOLDOWN_PERIOD/1000}s`);
      errorState.silenced = true;
      
      // Reset after cooldown
      setTimeout(() => {
        errorState.count = 0;
        errorState.silenced = false;
        console.log('Error reporting re-enabled');
      }, ERROR_CONFIG.COOLDOWN_PERIOD);
    }
    return;
  }

  // Log error if not silenced
  if (!errorState.silenced) {
    if (error.type === 'reference') {
      console.warn('Reference Error:', error.message);
    } else if (error instanceof TypeError) {
      console.warn('Type Error:', error.message);
    } else if (error.message?.includes('Infinity') || error.message?.includes('NaN')) {
      console.warn('Invalid numeric value:', error.message);
    } else {
      console.error('Code execution error:', error);
    }
  }
}


interface SceneObject extends THREE.Object3D {
  name?: string;
}

interface ExecutionError extends Error {
  type: 'reference' | 'infinity' | 'general';
  details?: string;
}

interface CodeExecutionContext {
  scene: {
    objects: SceneObject[];
    selected: SceneObject | null;
    add: (object: THREE.Object3D | null) => void;
    getObjectByName: (name: string) => SceneObject | null;
    validateObject: (object: THREE.Object3D) => boolean;
  };
  THREE: typeof THREE;
}

function validateObject(object: THREE.Object3D): boolean {
  // Check for infinity/NaN in transforms
  if (!validateTransforms(object)) {
    return false;
  }

  // Check material properties if it's a mesh
  if (object instanceof THREE.Mesh) {
    const material = object.material as THREE.Material;
    if ('color' in material && material.color) {
      const color = material.color;
      if (!Number.isFinite(color.r) || !Number.isFinite(color.g) || !Number.isFinite(color.b)) {
        return false;
      }
    }
  }

  return true;
}

export function createExecutionContext(): CodeExecutionContext {
  const store = useEditorStore.getState();
  
  return {
    scene: {
      objects: store.objects,
      selected: store.selectedObject,
      getObjectByName: (name: string) => {
        return store.objects.find(obj => obj.name === name) || null;
      },
      add: (object: THREE.Object3D | null) => { 
        if (!object) return;
        
        // Validate object before adding
        if (!validateObject(object)) {
          throw new Error('Invalid object properties detected (infinity or NaN values)');
        }

        // Set up object properties
        if (object instanceof THREE.Mesh) {
          object.castShadow = true;
          object.receiveShadow = true;
        }
        
        // Ensure object has a name
        if (!object.name) {
          object.name = `${object.type}_${Math.random().toString(36).substr(2, 9)}`;
        }

        store.addObject(object);
        store.updateTransform();
      },
      validateObject
    },
    THREE
  };
}

function createSafeWrapper(code: string): string {
  return `
    try {
      const renderer = { render: () => {} };
      const camera = null;
      const getObjectByName = (name) => scene.getObjectByName(name);
      
      ${code}
    } catch (error) {
      if (error instanceof ReferenceError) {
        throw { 
          type: 'reference',
          message: 'Undefined variable: ' + error.message.split(' ')[0],
          details: error.message
        };
      }
      throw error;
    }
  `;
}

export function executeCode(code: string): boolean {
  try {
    const context = createExecutionContext();
    const store = useEditorStore.getState();
    
    const wrappedCode = createSafeWrapper(code);

    const fn = new Function('scene', 'THREE', wrappedCode);
    fn(context.scene, context.THREE);

    // Force a store update after code execution
    store.updateTransform();
    
    return true;
  } catch (error) {
    handleError(error);
    return false;
  }
}