import { StateCreator } from 'zustand';
import { EditorState } from '../types';
import * as THREE from 'three';

export interface ShaderAsset {
  id: string;
  name: string;
  vertexShader: string;
  fragmentShader: string;
  material: THREE.ShaderMaterial;
  users: Set<THREE.Object3D>;
}

export interface ShaderAssetsSlice {
  shaderAssets: ShaderAsset[];
  draggedShader: ShaderAsset | null;
  addShaderAsset: (asset: ShaderAsset) => void;
  removeShaderAsset: (id: string) => void;
  updateShaderAsset: (id: string, updates: Partial<ShaderAsset>) => void;
  addShaderUser: (shaderId: string, object: THREE.Object3D) => void;
  removeShaderUser: (shaderId: string, object: THREE.Object3D) => void;
  setDraggedShader: (shader: ShaderAsset | null) => void;
}

export const createShaderAssetsSlice: StateCreator<EditorState, [], [], ShaderAssetsSlice> = (set) => ({
  shaderAssets: [],
  draggedShader: null,
  
  addShaderAsset: (asset) =>
    set((state) => ({
      shaderAssets: [...state.shaderAssets, { ...asset, users: new Set() }],
    })),
    
  removeShaderAsset: (id) =>
    set((state) => ({
      shaderAssets: state.shaderAssets.filter((asset) => asset.id !== id),
    })),
    
  updateShaderAsset: (id, updates) =>
    set((state) => {
      const updatedAssets = state.shaderAssets.map((asset) => {
        if (asset.id === id) {
          const updatedAsset = { ...asset, ...updates };
          // Update all objects using this shader
          asset.users.forEach(obj => {
            if (obj instanceof THREE.Mesh) {
              obj.material = updatedAsset.material;
              obj.material.needsUpdate = true;
            }
          });
          return updatedAsset;
        }
        return asset;
      });
      return { shaderAssets: updatedAssets };
    }),

  addShaderUser: (shaderId, object) =>
    set((state) => {
      const updatedAssets = state.shaderAssets.map((asset) => {
        if (asset.id === shaderId) {
          asset.users.add(object);
        }
        return asset;
      });
      return { shaderAssets: updatedAssets };
    }),

  removeShaderUser: (shaderId, object) =>
    set((state) => {
      const updatedAssets = state.shaderAssets.map((asset) => {
        if (asset.id === shaderId) {
          asset.users.delete(object);
        }
        return asset;
      });
      return { shaderAssets: updatedAssets };
    }),
  
  setDraggedShader: (shader) =>
    set({ draggedShader: shader }),
});