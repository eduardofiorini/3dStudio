import * as THREE from 'three';
import { SerializedObject, SerializedMaterial } from './types';

export function serializeMaterial(material: THREE.Material): SerializedMaterial | undefined {
  if (!(material instanceof THREE.MeshStandardMaterial)) return undefined;

  // Base material properties
  const serializedMaterial: SerializedMaterial = {
    type: material instanceof THREE.MeshPhysicalMaterial ? 'physical' : 
          (!material.colorWrite && material.depthWrite) ? 'hider' : 'standard',
    color: `#${material.color?.getHexString()}`,
    emissive: `#${material.emissive?.getHexString()}`,
    emissiveIntensity: material.emissiveIntensity || 0,
    metalness: typeof material.metalness === 'number' ? material.metalness : 0,
    roughness: typeof material.roughness === 'number' ? material.roughness : 1,
    opacity: typeof material.opacity === 'number' ? material.opacity : 1,
    transparent: material.transparent || false,
    castShadow: material.userData.castShadow || false,
    receiveShadow: material.userData.receiveShadow || false
  };

  // Log material properties being serialized
  console.log('Serializing material:', {
    type: serializedMaterial.type,
    opacity: serializedMaterial.opacity,
    transparent: serializedMaterial.transparent
  });
  // Add physical material properties if applicable
  if (material instanceof THREE.MeshPhysicalMaterial) {
    serializedMaterial.transmission = material.transmission ?? 0;
    serializedMaterial.thickness = material.thickness;
    serializedMaterial.ior = material.ior;
    
    console.log('Serializing physical material:', {
      transmission: material.transmission ?? 0,
      thickness: material.thickness,
      ior: material.ior
    });
  }

  return serializedMaterial;
}

export function serializeObject(obj: THREE.Object3D): SerializedObject {
  // Log object being serialized
  console.log('Serializing object:', {
    type: obj.type,
    name: obj.name,
    userData: {
      isGLBModel: obj.userData.isGLBModel,
      modelId: obj.userData.modelId,
      objectType: obj.userData.objectType
    },
    isGLB: obj.userData.isGLBModel || false
  });

  let objectType = obj.userData.objectType;
  if (!objectType && obj instanceof THREE.Mesh) {
    objectType = obj.geometry.type.replace('Geometry', '');
  } else if (obj.userData.isGLBModel) {
    objectType = 'GLB Model';
  } else if (obj.userData.isLight) {
    objectType = obj.userData.objectType; // Use the stored light type
  }

  const serializedObj: SerializedObject = {
    type: obj.type,
    objectType: objectType || 'Cube',
    name: obj.name || obj.userData.originalName || '',
    position: obj.position.toArray() as [number, number, number],
    rotation: obj.rotation.toArray() as [number, number, number],
    scale: obj.scale.toArray() as [number, number, number],
    userData: {
      physicsType: obj.userData.physicsType || 'dynamic',
      initialTransform: obj.userData.initialTransform ? {
        position: obj.userData.initialTransform.position.toArray(),
        rotation: obj.userData.initialTransform.rotation.toArray(),
        scale: obj.userData.initialTransform.scale.toArray()
      } : null,
      isGLBModel: obj.userData.isGLBModel || false,
      modelId: obj.userData.modelId,
      objectType: 'GLB Model',
      // Preserve important flags
      physicsEnabled: obj.userData.physicsEnabled || false,
      physicsType: obj.userData.physicsType
    }
  };

  // Add GLB options if it's a GLB model
  if (obj.userData.isGLBModel) {
    serializedObj.glbOptions = {
      modelId: obj.userData.modelId,
      originalName: obj.userData.originalName,
      isGLB: true
    };
    // Ensure modelId exists
    if (!obj.userData.modelId) {
      console.warn('GLB model missing modelId, generating new one');
      obj.userData.modelId = crypto.randomUUID();
      serializedObj.glbOptions.modelId = obj.userData.modelId;
    }
    console.log('Serializing GLB model:', {
      id: obj.userData.modelId,
      name: obj.userData.originalName,
      isGLB: true,
      flags: {
        root: obj.userData.isGLBModel,
        modelId: obj.userData.modelId,
        type: obj.userData.objectType
      },
      meshCount: obj.children.filter(c => c instanceof THREE.Mesh).length
    });
  }

  // Add media options if it's a media object
  if (obj.userData.mediaType) {
    serializedObj.mediaOptions = {
      mediaId: obj.userData.mediaId,
      mediaType: obj.userData.mediaType
    };
  }

  // Add text options if it's a text object
  if (obj.userData.textOptions) {
    serializedObj.textOptions = { ...obj.userData.textOptions };
  }

  // Add material data if it exists
  if (obj instanceof THREE.Mesh) {
    serializedObj.material = serializeMaterial(obj.material);
  }

  // Add light properties if it's a light
  if (obj.userData.isLight) {
    serializedObj.lightProperties = {
      type: obj.userData.objectType || 'Directional Light',
      color: obj instanceof THREE.Light ? '#' + obj.color.getHexString() : '#ffffff',
      intensity: obj instanceof THREE.Light ? obj.intensity : 1,
      distance: obj instanceof THREE.PointLight ? obj.distance : undefined,
      decay: obj instanceof THREE.PointLight ? obj.decay : undefined,
      width: obj instanceof THREE.RectAreaLight ? obj.width : undefined,
      height: obj instanceof THREE.RectAreaLight ? obj.height : undefined
    };
    // Ensure light userData is preserved
    serializedObj.userData = {
      ...serializedObj.userData,
      isLight: true,
      objectType: obj.userData.objectType || 'Directional Light'
    };
  }


  return serializedObj;
}