import { Object3D } from 'three';
import { EditorState } from '../../types';

import * as THREE from 'three';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';

export function duplicateObjects(objects: Object3D[], get: () => EditorState, set: (fn: (state: EditorState) => Partial<EditorState>) => void) {
  const duplicatedObjects: Object3D[] = [];

  objects.forEach(object => {
    // Store original physics state
    const physicsSettings = {
      enabled: object.userData.physicsEnabled,
      type: object.userData.physicsType
    };
    
    let newObject: THREE.Object3D;
    
    // Special handling for RectAreaLight
    if (object instanceof THREE.RectAreaLight) {
      // Create a new RectAreaLight instead of cloning
      const newLight = new THREE.RectAreaLight(
        object.color.getHex(),
        object.intensity,
        object.width,
        object.height
      );
      
      // Copy transform
      newLight.position.copy(object.position);
      newLight.rotation.copy(object.rotation);
      newLight.scale.copy(object.scale);
      
      // Copy userData
      newLight.userData = {
        ...object.userData,
        objectType: 'Rect Area Light',
        isLight: true
      };
      
      // Create new helper
      const helper = new RectAreaLightHelper(newLight);
      helper.name = 'RectAreaLightHelper';
      newLight.add(helper);
      
      newObject = newLight;
    } else {
      // Temporarily disable physics
      const originalPhysics = object.userData.physicsEnabled;
      object.userData.physicsEnabled = false;
      delete object.userData.rigidBody;
      delete object.userData.physicsBody;
      
      // Clone object without physics
      newObject = object.clone();
      
      // Restore original object's physics state
      object.userData.physicsEnabled = originalPhysics;
    }

    if ('material' in newObject && 'material' in object) {
      const materialAsset = get().materialAssets.find(asset => 
        asset.users.has(object)
      );
      if (materialAsset) {
        newObject.material = materialAsset.material;
        get().addMaterialUser(materialAsset.id, newObject);
      } else {
        newObject.material = object.material.clone();
      }
    }
    
    // Re-enable physics if it was enabled on the original
    if (physicsSettings.enabled) {
      newObject.userData.physicsEnabled = true;
      newObject.userData.physicsType = physicsSettings.type;
      
      // Store initial transform for physics
      newObject.userData.initialTransform = {
        position: newObject.position.clone(),
        rotation: newObject.rotation.clone(),
        scale: newObject.scale.clone()
      };
    }

    duplicatedObjects.push(newObject);
  });
  
  // Add to history
  get().addToHistory({
    type: 'create',
    data: { objects: duplicatedObjects }
  });

  return duplicatedObjects;
}