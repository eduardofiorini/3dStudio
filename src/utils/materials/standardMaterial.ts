import * as THREE from 'three';

export interface MaterialOptions {
  color?: string;
  emissive?: string;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
  envMapIntensity?: number;
  transparent?: boolean;
  side?: THREE.Side;
  shadowSide?: THREE.Side;
}

export function createStandardMaterial(options: MaterialOptions = {}) {
  return new THREE.MeshStandardMaterial({
    color: options.color || '#636363',
    emissive: new THREE.Color(options.emissive || '#000000'),
    emissiveIntensity: 0,
    metalness: options.metalness ?? 0.1,
    roughness: options.roughness ?? 0.7,
    envMapIntensity: options.envMapIntensity ?? 1.5,
    opacity: options.opacity ?? 1,
    transparent: options.transparent ?? false,
    side: options.side ?? THREE.FrontSide,
    shadowSide: options.shadowSide ?? THREE.FrontSide
  });
}