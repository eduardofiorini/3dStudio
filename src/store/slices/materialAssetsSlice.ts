import { StateCreator } from 'zustand';
import { EditorState } from '../types';
import * as THREE from 'three';

export interface MaterialAsset {
  id: string;
  name: string;
  material: THREE.Material;
  users: Set<THREE.Object3D>;
}

export interface MaterialAssetsSlice {
  materialAssets: MaterialAsset[];
  draggedMaterial: MaterialAsset | null;
  addMaterialAsset: (asset: MaterialAsset) => void;
  removeMaterialAsset: (id: string) => void;
  updateMaterialAsset: (id: string, updates: Partial<MaterialAsset>) => void;
  addMaterialUser: (materialId: string, object: THREE.Object3D) => void;
  removeMaterialUser: (materialId: string, object: THREE.Object3D) => void;
  setDraggedMaterial: (material: MaterialAsset | null) => void;
}

export const createMaterialAssetsSlice: StateCreator<
  EditorState,
  [],
  [],
  MaterialAssetsSlice
> = (set) => ({
  materialAssets: [],
  draggedMaterial: null,
  
  addMaterialAsset: (asset) =>
    set((state) => ({
      materialAssets: [...state.materialAssets, { ...asset, users: new Set() }],
    })),
    
  removeMaterialAsset: (id) =>
    set((state) => ({
      materialAssets: state.materialAssets.filter((asset) => asset.id !== id),
    })),
    
  updateMaterialAsset: (id, updates) =>
    set((state) => {
      const updatedAssets = state.materialAssets.map((asset) => {
        if (asset.id === id) {
          const updatedAsset = { ...asset, ...updates };
          // Update all objects using this material
          asset.users.forEach(obj => {
            if (obj instanceof THREE.Mesh) {
              // Use the same material instance for all users
              obj.material = updatedAsset.material;
            }
          });
          return updatedAsset;
        }
        return asset;
      });
      return { materialAssets: updatedAssets };
    }),

  addMaterialUser: (materialId, object) =>
    set((state) => {
      const updatedAssets = state.materialAssets.map((asset) => {
        if (asset.id === materialId) {
          asset.users.add(object);
        }
        return asset;
      });
      return { materialAssets: updatedAssets };
    }),

  removeMaterialUser: (materialId, object) =>
    set((state) => {
      const updatedAssets = state.materialAssets.map((asset) => {
        if (asset.id === materialId) {
          asset.users.delete(object);
        }
        return asset;
      });
      return { materialAssets: updatedAssets };
    }),
  
  setDraggedMaterial: (material) =>
    set({ draggedMaterial: material }),
});