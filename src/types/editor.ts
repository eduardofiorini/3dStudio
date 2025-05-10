import { Object3D } from 'three';

export type TransformMode = 'translate' | 'rotate' | 'scale';
export type Axis = 'x' | 'y' | 'z';

export interface Transform {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export interface Keyframe {
  time: number;
  transform: Transform;
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  transformType?: keyof Transform; // Track which transform property was keyframed
}

export interface Animation {
  id: string;
  objectId: string;
  keyframes: Keyframe[];
  duration: number;
  isPlaying: boolean;
}

export interface TimelineState {
  currentTime: number;
  isPlaying: boolean;
  animations: Animation[];
}

export interface SceneSettings {
  showGrid: boolean;
  backgroundColor: string;
  ambientLightIntensity: number;
  ambientLightColor: string;
  directionalLightIntensity: number;
  directionalLightColor: string;
  directionalLightPosition: { x: number; y: number; z: number };
  shadowIntensity: number;
  shadowBias: number;
  shadowRadius: number;
  envMap?: {
    enabled: boolean;
    showBackground: boolean;
    url?: string;
    preset: 'apartment' | 'city' | 'dawn' | 'forest' | 'lobby' | 'night' | 'park' | 'studio' | 'sunset' | 'warehouse';
    intensity: number;
  };
  postProcessing?: {
    bloom: boolean;
    bloomIntensity: number;
    depthOfField: boolean;
    noise: boolean;
    vignette: boolean;
    vignetteAmount: number;
    brightness: number;
    contrast: number;
    pixelation: boolean;
    pixelSize: number;
  };
}