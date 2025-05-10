import * as THREE from 'three';

export type MaterialType = 'standard' | 'physical' | 'hider' | 'shadow';

export interface MaterialOptions {
  type?: MaterialType;
  color?: string;
  emissive?: string;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
  opacity?: number;
  transmission?: number;
  thickness?: number;
  ior?: number;
  side?: THREE.Side;
  transparent?: boolean;
}

export const MATERIAL_PRESETS = {
  standard: {
    type: 'standard' as const,
    label: 'Standard Material',
    create: (options: MaterialOptions = {}) => new THREE.MeshStandardMaterial({
      color: '#636363',
      emissive: new THREE.Color('#000000'),
      emissiveIntensity: 0,
      metalness: 0,
      roughness: 0.7,
      ...options
    })
  },
  physical: {
    type: 'physical' as const,
    label: 'Physical Material',
    create: (options: MaterialOptions = {}) => new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      metalness: 0.0,
      roughness: 0.0,
      transmission: 1.0,
      thickness: 0.5,
      ior: 1.3,
      transparent: true,
      opacity: 1.0,
      emissive: new THREE.Color('#000000'),
      emissiveIntensity: 0,
      ...options
    })
  },
  hider: {
    type: 'hider' as const,
    label: 'Hider Material',
    create: () => new THREE.MeshStandardMaterial({
      colorWrite: false,
      side: THREE.DoubleSide,
      transparent: false,
      depthWrite: true,
      depthTest: true
    })
  },
  shadow: {
    type: 'shadow' as const,
    label: 'Shadow Material',
    create: (options: MaterialOptions = {}) => {
      const material = new THREE.ShadowMaterial();
      material.opacity = options.opacity ?? 0.4;
      material.transparent = true;
      material.side = THREE.FrontSide;
      material.castShadow = false;
      return material;
    }
  }
} as const;