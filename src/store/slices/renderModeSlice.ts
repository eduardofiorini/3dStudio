import { StateCreator } from 'zustand';
import { EditorState } from '../types';
import * as THREE from 'three';

export type RenderMode = 'normal' | 'wireframe' | 'clay';

interface StoredMaterialInfo {
  material: THREE.Material | THREE.Material[];
  type: 'standard' | 'physical' | 'hider';
}

export interface RenderModeState {
  renderMode: RenderMode;
  originalMaterials: WeakMap<THREE.Mesh, StoredMaterialInfo>;
}

export interface RenderModeSlice extends RenderModeState {
  setRenderMode: (mode: RenderMode) => void;
}

// Shared clay material for better performance
const clayMaterial = new THREE.MeshStandardMaterial({
  color: 0x808080,
  roughness: 0.9,
  metalness: 0,
  flatShading: true
});

function getMaterialType(material: THREE.Material): 'standard' | 'physical' | 'hider' {
  if (material instanceof THREE.MeshPhysicalMaterial) return 'physical';
  if (!material.colorWrite && material.depthWrite) return 'hider';
  return 'standard';
}

export const createRenderModeSlice: StateCreator<EditorState, [], [], RenderModeSlice> = (set, get) => ({
  renderMode: 'normal',
  originalMaterials: new WeakMap(),

  // Helper to convert GLB models to clay first
  convertGLBToClay: (object: THREE.Object3D) => {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Create a white standard material
        const whiteMaterial = new THREE.MeshStandardMaterial({
          color: '#ffffff',
          roughness: 0.9,
          metalness: 0,
          flatShading: true
        });
        child.material = whiteMaterial;
      }
    });
  },

  updateStoredMaterial: (mesh: THREE.Mesh) => {
    const state = get();
    if (state.renderMode === 'normal') {
      // Only update stored materials in normal mode
      state.originalMaterials.set(mesh, {
        material: mesh.material,
        type: getMaterialType(mesh.material instanceof THREE.Material ? mesh.material : mesh.material[0])
      });
    }
  },

  setRenderMode: (mode) => {
    const currentMode = get().renderMode;
    if (currentMode === mode) return;

    // Store current materials if switching from normal mode
    if (currentMode === 'normal') {
      get().objects.forEach((object) => {
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            get().originalMaterials.set(child, {
              material: child.material,
              type: getMaterialType(child.material instanceof THREE.Material ? child.material : child.material[0])
            });
          }
        });
      });
    }

    // Apply the new render mode
    get().objects.forEach((object) => {
      object.traverse((child) => {
        // Skip splats and only process regular meshes
        if (child instanceof THREE.Mesh && !child.parent?.userData.isGaussianSplat) {
          try {
            const storedMaterialInfo = get().originalMaterials.get(child);

            switch (mode) {
              case 'normal':
                if (storedMaterialInfo) {
                  child.material = storedMaterialInfo.material;
                  
                  // Restore material type-specific properties
                  if (child.material instanceof THREE.Material) {
                    switch (storedMaterialInfo.type) {
                      case 'physical':
                        if (!(child.material instanceof THREE.MeshPhysicalMaterial)) {
                          const oldMaterial = child.material;
                          child.material = new THREE.MeshPhysicalMaterial().copy(oldMaterial);
                        }
                        break;
                      case 'hider':
                        child.material.colorWrite = false;
                        child.material.depthWrite = true;
                        child.renderOrder = -100;
                        break;
                    }
                  }
                  if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                      if (mat) mat.wireframe = false;
                    });
                  } else if (child.material) {
                    child.material.wireframe = false;
                  }
                }
                break;

              case 'wireframe':
                if (storedMaterialInfo) {
                  child.material = storedMaterialInfo.material;
                  
                  // For GLB models, convert to white material first
                  if (child.parent?.userData.isGLBModel) {
                    const whiteMaterial = new THREE.MeshStandardMaterial({
                      color: '#ffffff',
                      roughness: 0.9,
                      metalness: 0,
                      flatShading: true
                    });
                    child.material = whiteMaterial;
                  }
                  
                  // Create wireframe material based on original type
                  const createWireframeMaterial = (originalMaterial: THREE.Material) => {
                    let wireframeMaterial: THREE.Material;
                    
                    // Always use standard material for wireframe to ensure consistent look
                    if (child.parent?.userData.isGLBModel) {
                      wireframeMaterial = new THREE.MeshStandardMaterial();
                    } else if (originalMaterial instanceof THREE.MeshPhysicalMaterial) {
                      wireframeMaterial = new THREE.MeshPhysicalMaterial();
                    } else {
                      wireframeMaterial = new THREE.MeshStandardMaterial();
                    }
                    
                    // Copy relevant properties
                    if (!child.parent?.userData.isGLBModel) {
                      wireframeMaterial.copy(originalMaterial);
                    }
                    
                    // Set roughness and metalness for better wireframe visibility
                    wireframeMaterial.roughness = 1;
                    wireframeMaterial.metalness = 0;
                    if (wireframeMaterial instanceof THREE.MeshPhysicalMaterial) {
                      wireframeMaterial.transmission = 0;
                    }
                    
                    // Apply wireframe settings
                    wireframeMaterial.wireframe = true;
                    wireframeMaterial.wireframeLinewidth = 0.3;
                    wireframeMaterial.wireframeLinecap = 'round';
                    wireframeMaterial.wireframeLinejoin = 'round';
                    wireframeMaterial.color.set('#aaaaaa');
                    wireframeMaterial.opacity = 1;
                    wireframeMaterial.transparent = false;
                    
                    return wireframeMaterial;
                  };
                  
                  if (Array.isArray(child.material)) {
                    child.material = child.material.map(mat => 
                      mat ? createWireframeMaterial(mat) : mat
                    );
                  } else if (child.material) {
                    child.material = createWireframeMaterial(child.material);
                  }
                }
                break;

              case 'clay':
                // Skip splats in clay mode
                if (child.parent?.userData.isGaussianSplat) return;
                const clayMat = clayMaterial.clone();
                clayMat.wireframe = false;
                child.material = clayMat;
                break;
            }
          } catch (error) {
            console.warn('Error updating material for object:', {
              id: child.uuid,
              mode,
              error: error.message
            });
          }
        }
      });
    });

    set({ renderMode: mode });
  },
});