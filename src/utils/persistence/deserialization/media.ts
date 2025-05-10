import * as THREE from 'three';
import { SerializedObject } from '../types';
import { createMediaPlane } from '../../objects/media';

export async function deserializeMedia(objData: SerializedObject): Promise<THREE.Object3D | null> {
  if (!objData.mediaOptions?.mediaId) {
    console.warn('Missing media ID:', objData);
    return null;
  }

  try {
    console.log('Deserializing media:', objData.mediaOptions.mediaId);

    const object = await createMediaPlane({ id: objData.mediaOptions.mediaId });

    if (!object) {
      console.warn('Failed to create media plane');
      return null;
    }

    // Restore transform
    if (objData.position) object.position.fromArray(objData.position);
    if (objData.rotation) object.rotation.fromArray(objData.rotation);
    if (objData.scale) object.scale.fromArray(objData.scale);

    // Restore material properties if they exist
    if (objData.material && object instanceof THREE.Mesh) {
      const material = object.material as THREE.MeshStandardMaterial;
      if (objData.material.color) material.color.set(objData.material.color);
      if (typeof objData.material.metalness === 'number') material.metalness = objData.material.metalness;
      if (typeof objData.material.roughness === 'number') material.roughness = objData.material.roughness;
      if (typeof objData.material.opacity === 'number') {
        material.opacity = objData.material.opacity;
        material.transparent = material.opacity < 1;
      }
      material.needsUpdate = true;
    }

    // Restore user data
    object.userData = {
      ...object.userData,
      ...objData.userData,
      mediaId: objData.mediaOptions.mediaId,
      mediaType: objData.mediaOptions.mediaType
    };

    console.log('Media object created successfully:', {
      type: object.userData.mediaType,
      mediaId: object.userData.mediaId
    });

    return object;
  } catch (error) {
    console.error('Error deserializing media:', error);
    return null;
  }
}