import { SceneSettings } from '../types/editor';

export const DEFAULT_SCENE_SETTINGS: SceneSettings = {
  showGrid: true,
  backgroundColor: '#212121',
  ambientLightIntensity: 1.2,
  ambientLightColor: '#ffffff',
  directionalLightIntensity: 6,
  directionalLightColor: '#ffffff',
  directionalLightPosition: { x: 8, y: 10, z: -4 },
  shadowIntensity: 0.6,
  shadowBias: 0,
  shadowRadius: 6.0,
  normalBias: 0.045,
  envMap: {
    enabled: true,
    showBackground: false,
    preset: 'city',
    intensity: 1.0
  },
  postProcessing: {
    bloom: true,
    bloomIntensity: 0.5,
    depthOfField: false,
    noise: false,
    vignette: false,
    vignetteAmount: 0.5,
    brightness: 0,
    contrast: 0,
    pixelation: false,
    pixelSize: 5
  }
};