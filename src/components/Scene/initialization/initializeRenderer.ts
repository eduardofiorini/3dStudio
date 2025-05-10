import * as THREE from 'three';
import { WebGLRenderer } from 'three';
import { SceneSettings } from '../../../types/editor';

export function initializeRenderer(renderer: WebGLRenderer, settings: SceneSettings) {
  // Shadow settings
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  // Physically correct lighting
  renderer.physicallyCorrectLights = true;
  
  // Tone mapping
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  
  // Background color
  renderer.setClearColor(settings.backgroundColor);

  console.log('Renderer initialized with settings:', {
    shadowMap: renderer.shadowMap.enabled,
    toneMapping: renderer.toneMapping,
    backgroundColor: settings.backgroundColor
  });
}