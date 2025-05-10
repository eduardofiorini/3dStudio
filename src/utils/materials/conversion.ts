import * as THREE from 'three';
import { MATERIAL_PRESETS, MaterialType } from './types';

function preserveMaterialMaps(oldMaterial: THREE.Material, newMaterial: THREE.Material) {
  if (oldMaterial instanceof THREE.MeshStandardMaterial && 
      newMaterial instanceof THREE.MeshStandardMaterial) {
    // Preserve normal map
    if (oldMaterial.normalMap) {
      newMaterial.normalMap = oldMaterial.normalMap;
      newMaterial.normalScale.copy(oldMaterial.normalScale);
    }
    // Preserve other important maps
    if (oldMaterial.map) newMaterial.map = oldMaterial.map;
    if (oldMaterial.aoMap) newMaterial.aoMap = oldMaterial.aoMap;
    if (oldMaterial.roughnessMap) newMaterial.roughnessMap = oldMaterial.roughnessMap;
    if (oldMaterial.metalnessMap) newMaterial.metalnessMap = oldMaterial.metalnessMap;
    if (oldMaterial.bumpMap) {
      newMaterial.bumpMap = oldMaterial.bumpMap;
      newMaterial.bumpScale = oldMaterial.bumpScale;
    }
    if (oldMaterial.displacementMap) {
      newMaterial.displacementMap = oldMaterial.displacementMap;
      newMaterial.displacementScale = oldMaterial.displacementScale;
      newMaterial.displacementBias = oldMaterial.displacementBias;
    }
  }
}

export function convertMeshMaterial(mesh: THREE.Mesh, type: MaterialType) {
  if (!mesh.material) return;

  // Store original color and maps
  const originalColor = mesh.material instanceof THREE.MeshStandardMaterial 
    ? mesh.material.color.getHex()
    : 0x636363;

  // Create new material based on type
  const preset = MATERIAL_PRESETS[type];
  if (!preset) return;

  const newMaterial = preset.create({
    color: `#${new THREE.Color(originalColor).getHexString()}`
  });

  // Preserve maps from old material
  preserveMaterialMaps(mesh.material, newMaterial);

  // Dispose of old material
  if (mesh.material instanceof THREE.Material) {
    mesh.material.dispose();
  }

  // Apply new material
  mesh.material = newMaterial;

  // Set render order for hider material
  if (type === 'hider') {
    mesh.renderOrder = -100;
  } else {
    mesh.renderOrder = 0;
  }
}

export function convertModelMaterials(model: THREE.Object3D, type: MaterialType) {
  console.log('Converting model materials to:', type);
  
  model.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      console.log('Converting mesh material:', {
        meshName: node.name,
        oldMaterial: node.material instanceof THREE.MeshStandardMaterial 
          ? 'MeshStandardMaterial' 
          : node.material.type
      });
      
      convertMeshMaterial(node, type);
      
      // Force render order on all child meshes for GLB models
      if (type === 'hider') {
        node.renderOrder = -100;
      } else {
        node.renderOrder = 0;
      }
    }
  });
}