import * as THREE from 'three';
import { CameraHelper } from 'three';
import { ObjectOptions, setupBaseObject } from './baseObject';

export interface CameraOptions extends ObjectOptions {
  fov?: number;
  aspect?: number;
  near?: number;
  far?: number;
  showHelper?: boolean;
}

export function createPerspectiveCamera(options: CameraOptions = {}) {
  const {
    fov = 50,
    aspect = window.innerWidth / window.innerHeight,
    near = 0.2,
    far = 100,
    showHelper = true,
    position = { x: 0, y: 2, z: 2 }
  } = options;

  // Create camera
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  
  camera.position.set(position.x, position.y, position.z);
  camera.name = 'Camera';
  // Look at origin (0, 0, 0)
  const target = new THREE.Vector3(0, 0, 0);
  camera.lookAt(target);
  
  // Store helper reference in userData
  let helper: THREE.CameraHelper | null = null;
  
  // Add helper
  if (showHelper) {
    helper = new CameraHelper(camera);
    helper.userData.isHelper = true;
    const scene = (window as any).__THREE_SCENE__;
    if (scene) {
      scene.add(helper);
    }
  }

  // Set metadata
  camera.userData = {
    ...camera.userData,
    objectType: 'Camera',
    isCamera: true,
    helper, // Store reference to helper
    cameraSettings: {
      fov,
      aspect,
      near,
      far,
      showHelper
    },
    // Methods to manage helper
    updateHelper: () => {
      if (helper) {
        helper.update();
      }
    },
    toggleHelper: (show: boolean) => {
      if (helper) {
        helper.visible = show;
        helper.update();
      } else if (show) {
        // Create new helper if needed
        helper = new CameraHelper(camera);
        helper.userData.isHelper = true;
        const scene = (window as any).__THREE_SCENE__;
        if (scene) {
          scene.add(helper);
        }
        camera.userData.helper = helper;
      }
    }
  }

  return camera;
}