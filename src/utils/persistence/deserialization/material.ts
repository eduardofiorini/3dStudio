import * as THREE from 'three';
import { SerializedMaterial } from '../types';

export function deserializeMaterial(mesh: THREE.Mesh, materialData: SerializedMaterial): void {
  if (!(mesh.material instanceof THREE.MeshStandardMaterial)) return;

  try {
    const material = mesh.material;
    
    // Apply material properties with validation
    if (materialData.color) material.color.set(materialData.color);
    if (materialData.emissive) material.emissive.set(materialData.emissive);
    
    material.emissiveIntensity = materialData.emissiveIntensity || 0;
    material.metalness = typeof materialData.metalness === 'number' ? materialData.metalness : 0;
    material.roughness = typeof materialData.roughness === 'number' ? materialData.roughness : 1;
    material.opacity = materialData.opacity ?? 1;
    material.transparent = material.opacity < 1;
    
    mesh.castShadow = materialData.castShadow ?? true;
    mesh.receiveShadow = materialData.receiveShadow ?? true;
    
    material.needsUpdate = true;

    console.log('Material updated successfully:', {
      color: material.color.getHexString(),
      metalness: material.metalness,
      roughness: material.roughness,
      opacity: material.opacity
    });
  } catch (error) {
    console.error('Error deserializing material:', error);
  }
}