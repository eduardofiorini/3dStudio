import * as THREE from 'three';
import { Object3D } from 'three';

export function getSceneInfo(objects: Object3D[]) {
  // Log raw objects first for debugging
  console.log('Raw scene objects:', objects.map(obj => ({
    type: obj.type,
    name: obj.name || obj.userData.originalName,
    userData: obj.userData
  })));

  const sceneInfo = objects.map(obj => ({
    id: obj.uuid.slice(0, 8),
    type: obj.userData.objectType || obj.type,
    name: obj.name || obj.userData.originalName || obj.type,
    isGLB: obj.userData.isGLBModel || false,
    position: obj.position.toArray().map(v => v.toFixed(2)),
    rotation: obj.rotation.toArray().slice(0, 3).map(v => (v * 180 / Math.PI).toFixed(2)),
    physics: obj.userData.physicsEnabled ? {
      type: obj.userData.physicsType,
      enabled: true
    } : null,
    material: obj instanceof THREE.Mesh ? {
      type: obj.material instanceof THREE.MeshPhysicalMaterial ? 'physical' :
            obj.material instanceof THREE.MeshStandardMaterial ? 'standard' : 'other',
      color: obj.material instanceof THREE.Material ? '#' + obj.material.color?.getHexString() : null
    } : null
  }));

  // Log processed scene info
  console.log('Processed scene info:', sceneInfo);

  return `Current Scene State:\n${JSON.stringify(sceneInfo, null, 2)}`;
}