import { StateCreator } from 'zustand';
import { EditorState } from '../types';
import * as THREE from 'three';

export interface ArrayModifierState {
  previewObjects: THREE.Object3D[];
  addPreviewObject: (object: THREE.Object3D) => void;
  clearPreviewObjects: () => void;
  updatePreviewObjects: (
    sourceObject: THREE.Object3D | null,
    gridSize: { x: number; y: number },
    spacing: number,
    position: { x: number; y: number; z: number }
  ) => void;
}

export const createArrayModifierSlice: StateCreator<EditorState, [], [], ArrayModifierState> = (set, get) => ({
  previewObjects: [],

  addPreviewObject: (object) => 
    set((state) => ({
      previewObjects: [...state.previewObjects, object]
    })),

  clearPreviewObjects: () => {
    // Remove preview objects from scene
    get().previewObjects.forEach(obj => {
      if (obj.parent) {
        obj.parent.remove(obj);
      }
      // Dispose of geometries and materials
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
    set({ previewObjects: [] });
  },

  updatePreviewObjects: (sourceObject, gridSize, spacing, position) => {
    // Clear existing previews
    get().clearPreviewObjects();
    
    if (!sourceObject) return;
    
    // Store original physics state
    const physicsSettings = {
      enabled: sourceObject.userData.physicsEnabled,
      type: sourceObject.userData.physicsType
    };
    
    // Temporarily disable physics for preview
    const originalPhysics = sourceObject.userData.physicsEnabled;
    sourceObject.userData.physicsEnabled = false;
    delete sourceObject.userData.rigidBody;
    delete sourceObject.userData.physicsBody;

    // Calculate grid center offset
    const centerOffsetX = ((gridSize.x - 1) * spacing) / 2;
    const centerOffsetZ = ((gridSize.y - 1) * spacing) / 2;

    const newPreviewObjects: THREE.Object3D[] = [];

    // Create preview grid
    for (let x = 0; x < gridSize.x; x++) {
      for (let y = 0; y < gridSize.y; y++) {
        const clone = sourceObject.clone();
        
        // Handle material cloning/sharing
        if ('material' in sourceObject && 'material' in clone) {
          const store = get();
          const materialAsset = store.materialAssets.find(asset => 
            asset.users.has(sourceObject)
          );
          if (materialAsset) {
            clone.material = materialAsset.material;
            store.addMaterialUser(materialAsset.id, clone);
          } else {
            clone.material = sourceObject.material.clone();
          }
        }

        // Apply position offset and grid spacing
        clone.position.x = position.x + (spacing * x) - centerOffsetX;
        clone.position.y = position.y;
        clone.position.z = position.z + (spacing * y) - centerOffsetZ;

        newPreviewObjects.push(clone);
        sourceObject.parent?.add(clone);
      }
    }
    
    // Restore original physics state
    sourceObject.userData.physicsEnabled = originalPhysics;

    set({ previewObjects: newPreviewObjects });
  },

  createArrayGrid: (sourceObject: THREE.Object3D, gridSize: { x: number; y: number }, spacing: number, position: { x: number; y: number; z: number }) => {
    const store = get();
    
    // Store original physics settings
    const physicsSettings = {
      enabled: sourceObject.userData.physicsEnabled,
      type: sourceObject.userData.physicsType
    };
    
    // Create objects without physics first
    const objects: THREE.Object3D[] = [];
    
    // Calculate grid center offset
    const centerOffsetX = ((gridSize.x - 1) * spacing) / 2;
    const centerOffsetZ = ((gridSize.y - 1) * spacing) / 2;
    
    // Create grid
    for (let x = 0; x < gridSize.x; x++) {
      for (let y = 0; y < gridSize.y; y++) {
        // Clone without physics
        const originalPhysics = sourceObject.userData.physicsEnabled;
        sourceObject.userData.physicsEnabled = false;
        delete sourceObject.userData.rigidBody;
        delete sourceObject.userData.physicsBody;

        const clone = sourceObject.clone();

        // Restore source object's physics
        sourceObject.userData.physicsEnabled = originalPhysics;
        
        // Handle material
        if ('material' in sourceObject && 'material' in clone) {
          const materialAsset = store.materialAssets.find(asset => 
            asset.users.has(sourceObject)
          );
          if (materialAsset) {
            clone.material = materialAsset.material;
            store.addMaterialUser(materialAsset.id, clone);
          } else {
            clone.material = sourceObject.material.clone();
          }
        }
        
        // Position object
        clone.position.x = position.x + (spacing * x) - centerOffsetX;
        clone.position.y = position.y;
        clone.position.z = position.z + (spacing * y) - centerOffsetZ;
        
        objects.push(clone);
      }
    }
    
    // Add all objects to scene first
    objects.forEach(obj => store.addObject(obj));

    // Enable physics after all objects are positioned
    if (physicsSettings.enabled) {
      objects.forEach(obj => {
        obj.userData.physicsEnabled = true;
        obj.userData.physicsType = physicsSettings.type;
        
        // Store initial transform for physics
        obj.userData.initialTransform = {
          position: obj.position.clone(),
          rotation: obj.rotation.clone(),
          scale: obj.scale.clone()
        };
      });
    }
    
    // Clear previews
    store.clearPreviewObjects();
  }
});