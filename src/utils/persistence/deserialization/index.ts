import { SerializedObject } from '../types';
import { deserializeLight } from './lights';
import { deserializePrimitive } from './primitives';
import { deserializeMedia } from './media';
import { deserializeText } from './text';
import { deserializeTransform } from './transform';
import { deserializeMaterial } from './material';

export async function deserializeObject(objData: SerializedObject): Promise<THREE.Object3D | null> {
  try {
    // Skip unknown object types
    if (!objData.objectType) {
      console.warn('Missing object type:', objData);
      return null;
    }

    let object: THREE.Object3D | null = null;

    // Handle different object types
    if (objData.lightProperties?.type) {
      object = deserializeLight(objData);
    } else if (objData.objectType === '2D Text' || objData.objectType === '3D Text') {
      object = await deserializeText(objData);
    } else if (objData.objectType === 'Image' || objData.objectType === 'Video') {
      object = await deserializeMedia(objData);
    } else {
      object = await deserializePrimitive(objData);
    }

    if (!object) return null;

    // Restore transform and material
    deserializeTransform(object, objData);
    if (objData.material && object instanceof THREE.Mesh) {
      deserializeMaterial(object, objData.material);
    }

    // Restore user data
    object.userData = {
      ...objData.userData,
      objectType: objData.objectType
    };

    return object;
  } catch (error) {
    console.error('Error deserializing object:', error);
    return null;
  }
}