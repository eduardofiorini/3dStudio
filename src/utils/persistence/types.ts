import { SceneSettings } from '../../types/editor';

export interface SerializedScene {
  objects: SerializedObject[];
  sceneSettings: SceneSettings;
  materialAssets: SerializedMaterialAsset[];
  shaderAssets: SerializedShaderAsset[];
  version: string;
}

export interface SerializedMaterialAsset {
  id: string;
  name: string;
  material: SerializedMaterial;
  users: string[]; // Array of object UUIDs using this material
}

export interface SerializedShaderAsset {
  id: string;
  name: string;
  vertexShader: string;
  fragmentShader: string;
  users: string[]; // Array of object UUIDs using this shader
}

export interface SerializedObject {
  type: string;
  objectType: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  material?: SerializedMaterial;
  textOptions?: SerializedTextOptions;
  mediaOptions?: SerializedMediaOptions;
  glbOptions?: SerializedGLBOptions;
  userData: any;
  lightProperties?: {
    type: string;
    color: string;
    intensity: number;
    distance?: number;
    decay?: number;
    width?: number;
    height?: number;
  };
}

export interface SerializedMaterial {
  type: 'standard' | 'physical' | 'hider';
  color: string;
  emissive: string;
  emissiveIntensity: number;
  metalness: number;
  roughness: number;
  opacity: number;
  transparent: boolean;
  castShadow: boolean;
  receiveShadow: boolean;
  transmission?: number;
  thickness?: number;
  ior?: number;
}

export interface SerializedTextOptions {
  text: string;
  size: number;
  height: number;
  is3D: boolean;
  font?: string;
}

export interface SerializedMediaOptions {
  mediaId: string;
  mediaType: 'image' | 'video';
  url: string;
  aspectRatio?: number;
}

export interface SerializedGLBOptions {
  modelId: string;
  originalName: string;
}